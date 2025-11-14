import type { Metadata } from "next";
import { BRAND } from "../lib/site-data";

export const metadata: Metadata = {
  title: "服务条款 | 福乐音乐工作室 Fuel Music Studio",
  description: "使用本网站与我们的服务前，请先阅读本条款。",
};

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl p-6 md:p-8 bg-white/80 dark:bg-neutral-900/70 border border-black/5 dark:border-white/10">
        <h1 className="text-2xl md:text-4xl font-semibold">服务条款</h1>
      </header>

      <section className="card space-y-3">
        <h2 className="section-title">使用本站</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          访问与使用本网站即表示您同意遵守本条款。{BRAND.nameCN}有权在不事先通知的情况下更新条款内容。
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">报价与项目</h2>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• 报价以工程评估为准，定稿前可进行约定次数的微调；</li>
          <li>• 项目文件的版权、署名与用途按照合同/邮件确认的约定执行。</li>
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">免责声明</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          因不可抗力或平台服务中断导致的损失，{BRAND.nameCN}不承担由此产生的间接损失责任。
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="section-title">法律适用与争议解决</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          本条款受中华人民共和国法律管辖。争议应友好协商解决，协商不成的，提交{BRAND.nameCN}所在地有管辖权的人民法院。
        </p>
      </section>
    </div>
  );
}