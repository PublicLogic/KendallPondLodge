"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { searchGuide } from "@/lib/kendall.mjs";
import { Icon } from "./Icons";

type Result = {
  kind: string;
  title: string;
  answer: string;
  href: string;
  linkLabel: string;
};

const starters = ["How do I use the hot tub?", "Where are the audio controls?", "What should I do before checkout?"];

function KendallForm({ embedded = false }: { embedded?: boolean }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!embedded) inputRef.current?.focus();
  }, [embedded]);

  function ask(value: string) {
    const clean = value.trim().slice(0, 240);
    if (!clean) return;
    setQuestion(clean);
    setResult(searchGuide(clean) as Result);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(question);
  }

  return (
    <div className={`kendall-search${embedded ? " kendall-search-embedded" : ""}`}>
      <form onSubmit={submit} className="kendall-form">
        <label htmlFor={embedded ? "kendall-question-page" : "kendall-question-panel"}>What do you need?</label>
        <div className="kendall-input-row">
          <input
            ref={inputRef}
            id={embedded ? "kendall-question-page" : "kendall-question-panel"}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={240}
            placeholder="Try “How do I use the hot tub?”"
          />
          <button type="submit">Find</button>
        </div>
      </form>

      {!result && (
        <div className="kendall-starters" aria-label="Example questions">
          {starters.map((starter) => <button type="button" onClick={() => ask(starter)} key={starter}>{starter}</button>)}
        </div>
      )}

      <div className="kendall-result" aria-live="polite">
        {result && (
          <>
            <strong>{result.title}</strong>
            <p>{result.answer}</p>
            <Link href={result.href}>{result.linkLabel}<Icon name="arrow" size={16} /></Link>
          </>
        )}
      </div>
      <p className="kendall-note">Searches this guide only. Not AI. Nothing is saved.</p>
    </div>
  );
}

export function AskKendall({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (embedded) return <KendallForm embedded />;

  return (
    <div className="kendall-widget">
      {open && (
        <section className="kendall-panel" role="dialog" aria-modal="false" aria-labelledby="kendall-title">
          <header>
            <div><span>Guide search</span><h2 id="kendall-title">Ask Kendall</h2></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Ask Kendall">×</button>
          </header>
          <KendallForm />
        </section>
      )}
      <button className="kendall-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="kendall-dot" aria-hidden="true" />
        {open ? "Close" : "Ask Kendall"}
      </button>
    </div>
  );
}
