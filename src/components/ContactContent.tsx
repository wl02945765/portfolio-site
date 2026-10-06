"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { getContactVisual } from "@/lib/content";
import { withBasePath } from "@/lib/basePath";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const EMAIL = "ching.huang.tpe@gmail.com";

const labelClass = "font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500";
const lineInputClass =
  "w-full border-0 border-b border-white/10 bg-transparent py-2 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-[#c9a66b] focus:outline-none";
const chipClass =
  "cursor-pointer select-none rounded-full border border-white/10 px-[18px] py-2 text-sm text-zinc-300 transition-colors hover:border-white/35 peer-checked:border-zinc-300 peer-checked:bg-zinc-300 peer-checked:text-black peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#c9a66b]";

// Clipboard API is refused in some in-app browsers (LINE, IG); fall back to
// the legacy execCommand path so the copy buttons still work there.
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      // nothing more we can do; the address is still visible as text
    }
    ta.remove();
  }
}

function useCopied() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  useEffect(() => {
    if (!copiedKey) return;
    const timer = setTimeout(() => setCopiedKey(null), 1800);
    return () => clearTimeout(timer);
  }, [copiedKey]);
  const copy = async (key: string, text: string) => {
    await copyText(text);
    setCopiedKey(key);
  };
  return { copiedKey, copy };
}

export function ContactContent() {
  const { t } = useLanguage();
  const c = t.contact;
  const visual = getContactVisual();
  const { copiedKey, copy } = useCopied();

  // Options are stored by index so switching language keeps the selection.
  const [types, setTypes] = useState<number[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [desc, setDesc] = useState("");
  const [name, setName] = useState("");
  const [timeline, setTimeline] = useState("");
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);

  const toggleType = (i: number) =>
    setTypes((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort()));

  const mailtoHref = (subject: string, body: string) =>
    `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (types.length === 0 || desc.trim() === "") {
      setError(true);
      return;
    }
    setError(false);
    const typeText = types.map((i) => c.types[i]).join("、");
    const who = name.trim();
    const subject = `【${c.mailSubject}】${typeText}${who ? `｜${who}` : ""}`;
    const body = [
      c.mailGreeting,
      "",
      c.mailIntro,
      desc.trim(),
      "",
      `${c.mailType}：${typeText}`,
      `${c.mailBudget}：${budget !== null ? c.budgets[budget] : c.mailUnset}`,
      `${c.mailTimeline}：${timeline.trim() || c.mailUnset}`,
      ...(who ? ["", who] : []),
    ].join("\n");
    setDraft({ subject, body });
    window.location.href = mailtoHref(subject, body);
  };

  return (
    <div className="flex flex-1 flex-col pb-24">
      <PageHeading>{c.heading}</PageHeading>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mx-6 mt-10 grid max-w-6xl border border-white/10 sm:mx-10 lg:mx-auto lg:w-[calc(100%-5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      >
        {/* Side panel */}
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 bg-gradient-to-b from-zinc-950 to-black p-7 sm:p-12 lg:border-b-0 lg:border-r">
          <div>
            <h2 className="heading-font text-[34px] leading-[1.05] text-zinc-100 [text-wrap:balance] sm:text-5xl">
              {c.titleLead} <em className="text-[#c9a66b]">{c.titleAccent}</em>
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-7 tracking-wide text-zinc-400">{c.intro}</p>
          </div>

          {visual.visualImage && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
              <img
                src={withBasePath(visual.visualImage)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-600">{c.directLabel}</span>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${EMAIL}`}
                className="break-all font-mono text-sm text-zinc-200 underline-offset-4 hover:underline"
              >
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={() => copy("email", EMAIL)}
                className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:border-white/35 hover:text-zinc-200"
              >
                {copiedKey === "email" ? c.copiedLabel : c.copyLabel}
              </button>
            </div>
            <span className="font-mono text-[11px] tracking-[0.1em] text-zinc-600">{c.location}</span>
          </div>
        </div>

        {/* Inquiry form */}
        <motion.form
          initial="hidden"
          animate="visible"
          variants={stagger}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-8 p-7 sm:p-12"
        >
          <motion.fieldset variants={fadeUp} className="flex min-w-0 flex-col gap-3">
            <legend className={`${labelClass} mb-3`}>
              <span className="mr-2.5 text-[#c9a66b]">01</span>
              {c.typeQuestion}
            </legend>
            <div className="flex flex-wrap gap-2">
              {c.types.map((label, i) => (
                <span key={i} className="relative">
                  <input
                    type="checkbox"
                    id={`contact-type-${i}`}
                    checked={types.includes(i)}
                    onChange={() => toggleType(i)}
                    className="peer absolute opacity-0"
                  />
                  <label htmlFor={`contact-type-${i}`} className={`${chipClass} inline-block`}>
                    {label}
                  </label>
                </span>
              ))}
            </div>
          </motion.fieldset>

          <motion.fieldset variants={fadeUp} className="flex min-w-0 flex-col gap-3">
            <legend className={`${labelClass} mb-3`}>
              <span className="mr-2.5 text-[#c9a66b]">02</span>
              {c.budgetQuestion}
            </legend>
            <div className="flex flex-wrap gap-2">
              {c.budgets.map((label, i) => (
                <span key={i} className="relative">
                  <input
                    type="radio"
                    name="contact-budget"
                    id={`contact-budget-${i}`}
                    checked={budget === i}
                    onChange={() => setBudget(i)}
                    className="peer absolute opacity-0"
                  />
                  <label htmlFor={`contact-budget-${i}`} className={`${chipClass} inline-block`}>
                    {label}
                  </label>
                </span>
              ))}
            </div>
          </motion.fieldset>

          <motion.div variants={fadeUp} className="flex flex-col gap-2">
            <label htmlFor="contact-desc" className={labelClass}>
              <span className="mr-2.5 text-[#c9a66b]">03</span>
              {c.descQuestion}
            </label>
            <textarea
              id="contact-desc"
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={c.descPlaceholder}
              className={`${lineInputClass} resize-y`}
            />
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-8 sm:grid-cols-2 sm:gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className={labelClass}>{c.nameLabel}</label>
              <input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.namePlaceholder}
                className={lineInputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-timeline" className={labelClass}>{c.timelineLabel}</label>
              <input
                id="contact-timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder={c.timelinePlaceholder}
                className={lineInputClass}
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            <div>
              <button
                type="submit"
                className="inline-block rounded-full border border-zinc-300 bg-zinc-300 px-10 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-black transition-colors hover:bg-transparent hover:text-zinc-300"
              >
                {c.submitButton}
              </button>
            </div>
            {error && <p className="text-sm text-[#c9a66b]">{c.formError}</p>}
          </motion.div>

          {draft && (
            <div className="border border-dashed border-[#c9a66b]/40 bg-[#c9a66b]/[0.04] p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#c9a66b]">{c.previewTitle}</p>
              <p className="mt-1 text-xs leading-6 text-zinc-500">{c.previewHint}</p>
              <pre className="mt-4 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-300">
                {`To: ${EMAIL}\n${draft.subject}\n\n${draft.body}`}
              </pre>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy("draft", `${draft.subject}\n\n${draft.body}`)}
                  className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:border-white/35 hover:text-zinc-200"
                >
                  {copiedKey === "draft" ? c.copiedLabel : c.copyAll}
                </button>
                <a
                  href={mailtoHref(draft.subject, draft.body)}
                  className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:border-white/35 hover:text-zinc-200"
                >
                  {c.openMail}
                </a>
              </div>
            </div>
          )}
        </motion.form>
      </motion.div>
    </div>
  );
}
