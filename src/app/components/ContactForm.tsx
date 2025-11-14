"use client";
import React, { useState, useEffect } from "react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const msg = localStorage.getItem("contact_prefill");
      if (msg) {
        const ta = document.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
        if (ta) {
          ta.value = msg;
          ta.dispatchEvent(new Event("input", { bubbles: true }));
        }
        localStorage.removeItem("contact_prefill");
      }
    } catch {}
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(null);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    if ((fd.get("company") as string)?.trim()) {
      setErr("提交失败，请重试。");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          message: fd.get("message"),
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "提交失败");
      setOk("已收到，我们会尽快联系你！");
      (e.target as HTMLFormElement).reset();
    } catch (e: any) {
      setErr(e?.message || "提交失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return React.createElement(
    "form",
    { onSubmit, className: "card rounded-2xl p-6 backdrop-blur space-y-3 card-hover" },
    React.createElement("div", { className: "text-lg font-medium" }, "在线咨询"),
    React.createElement(
      "div",
      { className: "grid md:grid-cols-2 gap-3" },
      React.createElement(
        "label",
        { className: "block" },
        React.createElement("span", { className: "text-sm text-white/70" }, "称呼"),
        React.createElement("input", {
          id: "contact-name",
          name: "name",
          required: true,
          autoComplete: "name",
          inputMode: "text",
          className: "mt-1 w-full rounded-xl border px-3 py-2 bg-white/10 border-white/10 text-white placeholder-white/50",
          placeholder: "你的称呼"
        })
      ),
      React.createElement(
        "label",
        { className: "block" },
        React.createElement("span", { className: "text-sm text-white/70" }, "邮箱"),
        React.createElement("input", {
          id: "contact-email",
          type: "email",
          name: "email",
          required: true,
          autoComplete: "email",
          inputMode: "email",
          className: "mt-1 w-full rounded-xl border px-3 py-2 bg-white/10 border-white/10 text-white placeholder-white/50",
          placeholder: "example@xxx.com",
          title: "请输入有效邮箱地址"
        })
      )
    ),
    React.createElement(
      "label",
      { className: "block" },
      React.createElement("span", { className: "text-sm text-white/70" }, "需求描述"),
      React.createElement("textarea", {
        id: "contact-desc",
        name: "message",
        required: true,
        minLength: 10,
        rows: 5,
        placeholder: "说说你的项目、参考风格、预算范围等…",
        className: "mt-1 w-full rounded-xl border px-3 py-2 bg-white/10 border-white/10 text-white placeholder-white/50"
      })
    ),
    React.createElement("input", {
      type: "text",
      name: "company",
      className: "hidden",
      tabIndex: -1,
      autoComplete: "off"
    }),
    React.createElement(
      "button",
      {
        disabled: loading,
        className: "btn border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition"
      },
      loading ? "发送中…" : "发送"
    ),
    ok && React.createElement("p", { className: "text-green-400 text-sm" }, ok),
    err && React.createElement("p", { className: "text-red-400 text-sm" }, err),
    React.createElement("p", { className: "text-xs text-white/50" }, "我们通常在 24 小时内回复（工作日）。")
  );
}