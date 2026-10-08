"use client";

import { useActionState, useState } from "react";
import { sendMessage, type ContactState } from "@/app/contact/actions";

const initialState: ContactState = { status: "idle" };

const MESSAGE_MAX = 4000;
/** Longueur à partir de laquelle Pac-Man a mangé toutes les pastilles. */
const PACMAN_FULL_AT = 280;
const PELLETS = 14;

/**
 * Pac-Man avance le long du champ au fil de la frappe et mange les pastilles.
 * Purement décoratif : masqué aux lecteurs d'écran, immobile si l'utilisateur a
 * demandé à réduire les animations.
 */
function PacmanTrack({ length }: { length: number }) {
  const progress = Math.min(length / PACMAN_FULL_AT, 1);

  return (
    <div aria-hidden="true" className="flex items-center gap-4 border-t border-line px-3 py-2">
      <div className="relative h-4 flex-1">
        <div className="absolute inset-y-0 left-4 right-0 flex items-center justify-around">
          {Array.from({ length: PELLETS }, (_, i) => (
            <span
              key={i}
              className={`size-1 rounded-full bg-dim transition-opacity ${
                (i + 0.5) / PELLETS <= progress ? "opacity-0" : "opacity-100"
              }`}
            />
          ))}
        </div>
        <svg
          viewBox="0 0 16 16"
          className={`pacman absolute top-0 size-4 fill-amber transition-[left] duration-200 ${
            length > 0 ? "pacman-eating" : ""
          }`}
          style={{ left: `calc(${progress} * (100% - 1rem))` }}
        >
          <path className="pacman-jaw-top" d="M8 8 L16 8 A8 8 0 0 0 0 8 Z" />
          <path className="pacman-jaw-bottom" d="M8 8 L16 8 A8 8 0 0 1 0 8 Z" />
        </svg>
      </div>
      <span className="font-mono text-xs text-dim">
        {length} / {MESSAGE_MAX}
      </span>
    </div>
  );
}

const fieldClass =
  "mt-2 w-full border border-line bg-panel px-3 py-2.5 text-text placeholder:text-dim focus-visible:border-amber";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendMessage, initialState);
  // null tant que le visiteur n'a rien tapé : on part alors de la valeur renvoyée par le serveur.
  const [typedLength, setTypedLength] = useState<number | null>(null);

  if (state.status === "success") {
    return (
      <p role="status" className="border-l-2 border-open pl-4">
        Message envoyé. Je te réponds dès que possible.
      </p>
    );
  }

  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-dim">
          Nom
          <input
            name="name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            defaultValue={values?.name}
            aria-invalid={errors?.name ? true : undefined}
            aria-describedby={errors?.name ? "erreur-nom" : undefined}
            className={fieldClass}
          />
          {errors?.name ? (
            <span id="erreur-nom" className="mt-1 block text-alert">
              {errors.name}
            </span>
          ) : null}
        </label>

        <label className="block text-sm text-dim">
          E-mail
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            defaultValue={values?.email}
            aria-invalid={errors?.email ? true : undefined}
            aria-describedby={errors?.email ? "erreur-email" : undefined}
            className={fieldClass}
          />
          {errors?.email ? (
            <span id="erreur-email" className="mt-1 block text-alert">
              {errors.email}
            </span>
          ) : null}
        </label>
      </div>

      <label className="block text-sm text-dim">
        Message
        <span className="mt-2 block border border-line bg-panel focus-within:border-amber">
          <textarea
            name="message"
            required
            rows={7}
            maxLength={MESSAGE_MAX}
            defaultValue={values?.message}
            onInput={(event) => setTypedLength(event.currentTarget.value.length)}
            aria-invalid={errors?.message ? true : undefined}
            aria-describedby={errors?.message ? "erreur-message" : undefined}
            className="block w-full resize-y bg-transparent px-3 py-2.5 text-text outline-none"
          />
          <PacmanTrack length={typedLength ?? values?.message.length ?? 0} />
        </span>
        {errors?.message ? (
          <span id="erreur-message" className="mt-1 block text-alert">
            {errors.message}
          </span>
        ) : null}
      </label>

      {/* Champ piège pour les robots : hors écran, hors tabulation, ignoré des lecteurs d'écran. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Ne pas remplir
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-amber px-5 py-2.5 font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Envoi en cours…" : "Envoyer le message"}
        </button>
        {state.status === "error" ? (
          <p role="alert" className="text-sm text-alert">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
