"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";

const EMAIL = "ching.huang.tpe@gmail.com";

export function ContactContent() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col pb-24">
      <PageHeading>{t.contact.heading}</PageHeading>
      <p className="mt-10 max-w-xl px-6 text-base leading-8 tracking-wide text-zinc-400 sm:px-10">
        {t.contact.body}
      </p>
      <a
        href={`mailto:${EMAIL}`}
        className="mt-8 w-fit px-6 text-sm uppercase tracking-[0.1em] text-zinc-300 underline underline-offset-4 hover:text-zinc-500 sm:px-10"
      >
        {t.contact.emailLabel}: {EMAIL}
      </a>
    </div>
  );
}
