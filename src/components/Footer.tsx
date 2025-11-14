import Link from "next/link";
import { BRAND, CONTACT } from "../app/lib/site-data";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-black/5 dark:border-white/10">
      <div className="container py-10 grid md:grid-cols-3 gap-6">
        {/* 品牌 */}
        <div>
          <div className="text-lg font-semibold">
            {BRAND.nameCN} <span className="text-brand">/</span> {BRAND.nameEN}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{BRAND.slogan}</p>
        </div>

        {/* 快速链接 */}
        <nav className="text-sm">
          <div className="font-medium">快速链接</div>
          <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
            <li><Link href="/#services" className="hover:opacity-80 transition">主营业务</Link></li>
            <li><Link href="/#pricing" className="hover:opacity-80 transition">混音服务价格</Link></li>
            <li><Link href="/tools" className="hover:opacity-80 transition">在线工具</Link></li>
            <li><Link href="/#contact" className="hover:opacity-80 transition">联系我们</Link></li>
            <li><Link href="/privacy" className="hover:opacity-80 transition">隐私政策</Link></li>
            <li><Link href="/terms" className="hover:opacity-80 transition">服务条款</Link></li>
          </ul>
        </nav>

        {/* 联系方式 */}
        <div className="text-sm">
          <div className="font-medium">联系</div>
          <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
            <li>邮箱：<a href={`mailto:${CONTACT.email}`} className="link">{CONTACT.email}</a></li>
            <li>微信：{CONTACT.wechat}</li>
            <li>电话：<a href={`tel:${CONTACT.phone}`} className="hover:opacity-80 transition">{CONTACT.phone}</a></li>
            <li>抖音：<a href="https://www.douyin.com/user/MS4wLjABAAAAQ5ucaqx0Oek2GZOjAJRnrS2AWsOaNfqmm_vm47UFXyoNbsa1KP_bfZlQ8IVV5xCu" target="_blank" rel="noopener noreferrer" className="text-[#6B4EFF] hover:text-[#8B5CF6] transition-colors">福乐音乐工作室</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-black/5 dark:border-white/10">
        <div className="container py-4 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3 justify-between">
          <div>© {year} {BRAND.nameEN}. All rights reserved.</div>
          <div className="flex items-center gap-3">
            {/* ICP 占位：上线国内节点后替换成你的备案号并保留链接 */}
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="hover:opacity-80 transition">
              沪ICP备2024016754号
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}