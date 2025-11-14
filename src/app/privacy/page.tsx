import type { Metadata } from "next";
import { CONTACT, BRAND } from "../lib/site-data";

export const metadata: Metadata = {
  title: "隐私政策 | 福乐音乐工作室 Fuel Music Studio",
  description: "我们如何收集、使用与保护您的信息。",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl p-6 md:p-8 bg-white/80 dark:bg-neutral-900/70 border border-black/5 dark:border-white/10">
        <h1 className="text-2xl md:text-4xl font-semibold">隐私政策</h1>
        <p className="section-sub mt-2">更新日期：{new Date().toISOString().slice(0,10)}</p>
      </header>

      <section className="card space-y-3">
        <h2 className="section-title">我们收集哪些信息</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          当您通过网站表单联系{BRAND.nameCN}时，我们会收集您主动提供的称呼、邮箱与需求描述，仅用于沟通与提供服务。
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">我们如何使用信息</h2>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• 回复您的咨询、提供报价与项目进度沟通；</li>
          <li>• 在您授权的情况下，提供与服务相关的通知。</li>
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">信息的保存与安全</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          我们采取合理的技术与管理措施保护您的信息。除法律法规要求或获得您明确授权，不会向第三方出售或共享您的个人信息。
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">联系我们</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          如对本政策有任何问题，或希望访问/更正/删除您的信息，请联系：
          <br/>邮箱：<a href={`mailto:${CONTACT.email}`} className="link">{CONTACT.email}</a>；
          电话：<a href={`tel:${CONTACT.phone}`} className="hover:opacity-80 transition">{CONTACT.phone}</a>。
        </p>
      </section>
    </div>
  );
}