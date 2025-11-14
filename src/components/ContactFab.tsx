"use client";
import { useState } from "react";
import { CONTACT } from "../app/lib/site-data";

export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyWechat() {
    try {
      await navigator.clipboard.writeText(CONTACT.wechat);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("复制失败，请手动添加微信号：" + CONTACT.wechat);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {open && (
        <div className="flex flex-col items-end mb-16">
          <div className="space-y-2 w-full">
            <a href="#contact"
               className="block card py-3 px-4 card-hover text-sm">在线咨询（表单）</a>
            <a href={`mailto:${CONTACT.email}`}
               className="block card py-3 px-4 card-hover text-sm">发邮件：{CONTACT.email}</a>
            <a href={`tel:${CONTACT.phone}`}
               className="block card py-3 px-4 card-hover text-sm">拨打电话：{CONTACT.phone}</a>
            <button onClick={copyWechat}
               className="block w-full text-left card py-3 px-4 card-hover text-sm">
              {copied ? "已复制微信号 ✓" : `复制微信号：${CONTACT.wechat}`}
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "关闭" : "联系我"}
        className="btn rounded-full w-12 h-12 border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition absolute right-0 bottom-0"
      >
        {open ? "×" : "聊"}
      </button>
    </div>
  );
}