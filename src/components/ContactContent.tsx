"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { btnPrimary } from "@/lib/buttonStyles";
import { getContactLinks, getContactVisual } from "@/lib/content";
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

type Mode = "hire" | "project";

const EMAIL = "ching.huang.tpe@gmail.com";

const labelClass = "font-mono text-xs uppercase tracking-[0.15em] text-zinc-400";
const lineInputClass =
  "w-full border-0 border-b border-white/10 bg-transparent py-2 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-[#c9a66b] focus:outline-none";
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

const smallBtnClass =
  "rounded-full border border-white/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:border-white/35 hover:text-zinc-200";
const submitClass = btnPrimary;

export function ContactContent() {
  const { t } = useLanguage();
  const c = t.contact;
  const h = c;
  const visual = getContactVisual();
  const links = getContactLinks();
  const { copiedKey, copy } = useCopied();

  // 預設「招募洽詢」；網址帶 ?mode=project 才進案子合作。
  // 不用 useSearchParams：它會讓靜態頁面整段退回瀏覽器端渲染（靜態 HTML 會是空的）。
  // 改成先以預設模式輸出靜態 HTML，載入後再讀網址參數。
  const [mode, setMode] = useState<Mode>("hire");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 載入後才讀網址，避免靜態 HTML 與瀏覽器端第一次渲染不一致
    if (new URLSearchParams(window.location.search).get("mode") === "project") setMode("project");
  }, []);
  const tabRefs = useRef<Record<Mode, HTMLButtonElement | null>>({ hire: null, project: null });

  const switchMode = (next: Mode, focus = false) => {
    setMode(next);
    // 網址記住模式，重新整理或分享連結時仍停在同一個分頁
    window.history.replaceState(null, "", `?mode=${next}`);
    if (focus) tabRefs.current[next]?.focus();
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const order: Mode[] = ["hire", "project"];
    const i = order.indexOf(mode);
    if (e.key === "ArrowRight") switchMode(order[(i + 1) % 2], true);
    else if (e.key === "ArrowLeft") switchMode(order[(i + 1) % 2], true);
    else if (e.key === "Home") switchMode("hire", true);
    else if (e.key === "End") switchMode("project", true);
    else return;
    e.preventDefault();
  };

  // 案子合作：選項以索引儲存，切換語言時選擇不會消失。
  const [types, setTypes] = useState<number[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [desc, setDesc] = useState("");
  const [name, setName] = useState("");
  const [timeline, setTimeline] = useState("");
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);

  // 招募洽詢：四欄全部選填
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [message, setMessage] = useState("");

  const toggleType = (i: number) =>
    setTypes((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort()));

  const mailtoHref = (subject: string, body: string) =>
    `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleProjectSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (types.length === 0 || desc.trim() === "") {
      setError(true);
      return;
    }
    setError(false);
    const typeText = types.map((i) => c.types[i]).join("、");
    const who = name.trim();
    const subject = `[${c.mailSubject}] ${typeText}${who ? `｜${who}` : ""}`;
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

  const handleHireSubmit = (e: FormEvent) => {
    e.preventDefault();
    const co = company.trim();
    const ro = role.trim();
    const subject = `[${h.hireMailSubject}]${co || ro ? " " : ""}${[co, ro].filter(Boolean).join("－")}`;
    const body = [
      h.hireMailGreeting,
      "",
      h.hireMailIntro,
      message.trim() || "—",
      "",
      ...(co ? [`${h.hireMailCompany}：${co}`] : []),
      ...(ro ? [`${h.hireMailRole}：${ro}`] : []),
      ...(jobLink.trim() ? [`${h.hireMailLink}：${jobLink.trim()}`] : []),
    ].join("\n");
    setDraft({ subject, body });
    window.location.href = mailtoHref(subject, body);
  };

  const tabs: { id: Mode; label: string }[] = [
    { id: "hire", label: h.tabHire },
    { id: "project", label: h.tabProject },
  ];

  return (
    <div className="flex flex-1 flex-col pb-24">
      <PageHeading>{c.heading}</PageHeading>

      {/* 模式分頁：招募洽詢／案子合作 */}
      <div className="mx-6 mt-10 max-w-6xl sm:mx-10 lg:mx-auto lg:w-[calc(100%-5rem)]">
        <div role="tablist" aria-label={h.tabsAria} className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const selected = mode === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                type="button"
                role="tab"
                id={`contact-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`contact-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  setDraft(null);
                  switchMode(tab.id);
                }}
                onKeyDown={onTabKeyDown}
                className={`min-h-[44px] rounded-full border px-6 text-sm tracking-wide transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#c9a66b] ${
                  selected
                    ? "border-zinc-300 bg-zinc-300 text-black"
                    : "border-white/15 text-zinc-300 hover:border-white/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{h.tabHint}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mx-6 mt-6 grid max-w-6xl border border-white/10 sm:mx-10 lg:mx-auto lg:w-[calc(100%-5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      >
        {/* Side panel */}
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 bg-gradient-to-b from-zinc-950 to-black p-7 sm:p-12 lg:border-b-0 lg:border-r">
          <div>
            <h2 className="heading-font text-[34px] leading-[1.05] text-zinc-100 [text-wrap:balance] sm:text-5xl">
              {mode === "hire" ? h.hireTitleLead : c.titleLead}{" "}
              <em className="text-[#c9a66b]">{mode === "hire" ? h.hireTitleAccent : c.titleAccent}</em>
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-7 tracking-wide text-zinc-400">
              {mode === "hire" ? h.hireIntro : c.intro}
            </p>
          </div>

          {visual.visualImage && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
              <img
                src={withBasePath(visual.visualImage)}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">{c.directLabel}</span>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${EMAIL}`}
                className={`break-all font-mono text-zinc-200 underline-offset-4 hover:underline ${
                  mode === "hire" ? "text-[13px] min-[400px]:text-base sm:text-lg" : "text-sm"
                }`}
              >
                {EMAIL}
              </a>
              <button type="button" onClick={() => copy("email", EMAIL)} className={smallBtnClass}>
                {copiedKey === "email" ? c.copiedLabel : c.copyLabel}
              </button>
            </div>
            <span className="font-mono text-xs tracking-[0.1em] text-zinc-400">
              {mode === "hire" ? h.basedIn : c.location}
            </span>
            {links.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">{h.externalLinks}</span>
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                  {links.map((l) => (
                    <li key={l.id}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center text-sm text-zinc-200 underline-offset-4 hover:underline"
                      >
                        {l.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 招募洽詢表單 */}
        {mode === "hire" && (
          <form
            role="tabpanel"
            id="contact-panel-hire"
            aria-labelledby="contact-tab-hire"
            onSubmit={handleHireSubmit}
            noValidate
            className="flex flex-col gap-8 p-7 sm:p-12"
          >
            <p className="text-sm text-zinc-400">{h.hireOptionalNote}</p>
            <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="hire-company" className={labelClass}>
                  <span className="mr-2.5 text-[#c9a66b]">01</span>
                  {h.hireCompany}
                </label>
                <input
                  id="hire-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={h.hireCompanyPh}
                  className={lineInputClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="hire-role" className={labelClass}>
                  <span className="mr-2.5 text-[#c9a66b]">02</span>
                  {h.hireRole}
                </label>
                <input
                  id="hire-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={h.hireRolePh}
                  className={lineInputClass}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="hire-link" className={labelClass}>
                <span className="mr-2.5 text-[#c9a66b]">03</span>
                {h.hireLink}
              </label>
              <input
                id="hire-link"
                type="url"
                inputMode="url"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder={h.hireLinkPh}
                className={lineInputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="hire-message" className={labelClass}>
                <span className="mr-2.5 text-[#c9a66b]">04</span>
                {h.hireMessage}
              </label>
              <textarea
                id="hire-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={h.hireMessagePh}
                className={`${lineInputClass} resize-y`}
              />
            </div>
            <div>
              <button type="submit" className={submitClass}>
                {c.ctaButton}
              </button>
            </div>
            {draft && <DraftPreview draft={draft} copy={copy} copiedKey={copiedKey} mailtoHref={mailtoHref} />}
          </form>
        )}

        {/* 案子合作表單（沿用原本三步驟） */}
        {mode === "project" && (
          <motion.form
            role="tabpanel"
            id="contact-panel-project"
            aria-labelledby="contact-tab-project"
            initial="hidden"
            animate="visible"
            variants={stagger}
            onSubmit={handleProjectSubmit}
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
                <button type="submit" className={submitClass}>
                  {c.submitButton}
                </button>
              </div>
              {error && <p className="text-sm text-[#c9a66b]">{c.formError}</p>}
            </motion.div>

            {draft && <DraftPreview draft={draft} copy={copy} copiedKey={copiedKey} mailtoHref={mailtoHref} />}
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}

function DraftPreview({
  draft,
  copy,
  copiedKey,
  mailtoHref,
}: {
  draft: { subject: string; body: string };
  copy: (key: string, text: string) => Promise<void>;
  copiedKey: string | null;
  mailtoHref: (subject: string, body: string) => string;
}) {
  const { t } = useLanguage();
  const c = t.contact;
  return (
    <div className="border border-dashed border-[#c9a66b]/40 bg-[#c9a66b]/[0.04] p-5">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#c9a66b]">{c.previewTitle}</p>
      <p className="mt-1 text-xs leading-6 text-zinc-400">{c.previewHint}</p>
      <pre className="mt-4 whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-300">
        {`To: ${EMAIL}\n${draft.subject}\n\n${draft.body}`}
      </pre>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => copy("draft", `${draft.subject}\n\n${draft.body}`)}
          className={smallBtnClass}
        >
          {copiedKey === "draft" ? c.copiedLabel : c.copyAll}
        </button>
        <a href={mailtoHref(draft.subject, draft.body)} className={smallBtnClass}>
          {c.openMail}
        </a>
      </div>
    </div>
  );
}
