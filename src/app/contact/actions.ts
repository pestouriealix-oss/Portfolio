"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { siteConfig } from "@/config/site";

type Field = "name" | "email" | "message";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<Field, string>>;
      /** Valeurs saisies, renvoyées pour que le visiteur ne retape pas tout. */
      values?: Record<Field, string>;
    };

const contactSchema = z.object({
  name: z.string().trim().min(2, "Indique ton nom.").max(80, "80 caractères maximum."),
  email: z.email("Cette adresse e-mail n'est pas valide.").max(254),
  message: z
    .string()
    .trim()
    .min(10, "Ton message est un peu court.")
    .max(4000, "4 000 caractères maximum."),
});

/**
 * Limite de débit par adresse IP, en mémoire.
 * C'est un garde-fou, pas une garantie : sur une plateforme serverless chaque instance a sa
 * propre mémoire. Pour une limite stricte, il faudrait un stockage partagé (Redis).
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const attempts = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  // Champ piège, invisible pour un humain : s'il est rempli, c'est un robot.
  // On répond « succès » pour ne pas lui indiquer qu'il a été détecté.
  if (text("website") !== "") return { status: "success" };

  const values = { name: text("name"), email: text("email"), message: text("message") };

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<Field, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as Field;
      fieldErrors[field] ??= issue.message;
    }
    return { status: "error", message: "Corrige les champs signalés.", fieldErrors, values };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "inconnue";
  if (isRateLimited(ip)) {
    return {
      status: "error",
      message: "Trop de messages envoyés. Réessaie dans dix minutes.",
      values,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? siteConfig.links.email;
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY ou destinataire manquant");
    return {
      status: "error",
      message: "Le formulaire n'est pas encore configuré. Écris-moi directement par e-mail.",
      values,
    };
  }

  const { name, email, message } = parsed.data;

  // Appel direct à l'API HTTP de Resend : pas de SDK, donc aucune dépendance de plus.
  // Le corps est du JSON et du texte brut : pas d'injection d'en-têtes ni de HTML possible.
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `Message de ${name.replace(/[\r\n]+/g, " ")} via le portfolio`,
      text: `De : ${name} <${email}>\n\n${message}`,
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!response?.ok) {
    console.error("[contact] envoi refusé", response?.status);
    return {
      status: "error",
      message: "L'envoi a échoué. Réessaie, ou écris-moi directement par e-mail.",
      values,
    };
  }

  return { status: "success" };
}
