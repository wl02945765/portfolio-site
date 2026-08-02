"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";

export function AboutContent() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col px-6 pb-24 sm:px-10">
      <PageHeading>{t.about.heading}</PageHeading>
      <p className="mt-10 max-w-2xl text-base leading-8 tracking-wide text-black/75">
        {t.about.body}
      </p>
    </div>
  );
}
