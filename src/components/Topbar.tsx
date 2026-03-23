"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "../app/lib/site-data";

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
      <Link href="/" className="hover:opacity-80 transition" onClick={onClick}>首页</Link>
      <Link href="/#services" className="hover:opacity-80 transition" onClick={onClick}>业务</Link>
      <Link href="/#cases" className="hover:opacity-80 transition" onClick={onClick}>案例</Link>
      <Link href="/#pricing" className="hover:opacity-80 transition" onClick={onClick}>价格</Link>
      <Link href="/download" className="hover:opacity-80 transition" onClick={onClick}>下载</Link>
      <Link href="/#contact" className="hover:opacity-80 transition" onClick={onClick}>联系</Link>
    </>
  );
}

export default function Topbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  

  return (
    <header className="topbar fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
      <div className="container h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="font-semibold text-white">
          {BRAND.nameCN} <span className="text-brand">/</span> {BRAND.nameEN}
        </Link>

        {/* 桌面端 */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-200">
          <NavLinks />
        </nav>

        {/* 移动端按钮 */}
        <button
          className="md:hidden btn w-10 h-10 flex items-center justify-center rounded-xl"
          aria-label="打开菜单"
          onClick={() => setOpen(v => !v)}
        >
          {open ? "×" : "≡"}
        </button>
      </div>

      {/* 移动端抽屉菜单 */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
          <div className="container py-3 flex flex-col gap-3 text-sm text-gray-200">
            <NavLinks onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}