"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";

const EMAIL = "ching.huang.tpe@gmail.com";

export function ContactContent() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col px-6 pb-24 sm:px-10">
      <PageHeading>{t.contact.heading}</PageHeading>
      <p className="mt-10 max-w-xl text-base leading-8 tracking-wide text-white/80">
        {t.contact.body}
      </p>
      <a
        href={`mailto:${EMAIL}`}
        className="mt-8 w-fit text-sm uppercase tracking-[0.1em] text-white underline underline-offset-4 hover:text-white/60"
      >
        {t.contact.emailLabel}: {EMAIL}
      </a>
    </div>
  );
}
