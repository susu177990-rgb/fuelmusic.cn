"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 服务器端默认设置为false，避免SSR/客户端不匹配
  const [scrolled, setScrolled] = useState(false);
  
  // 滚动阴影 - 只在客户端计算初始滚动状态，避免SSR/客户端不匹配
  useEffect(() => {
    // 确保在客户端执行
    const onScroll = () => setScrolled(window.scrollY > 8);
    // 初始计算放在useEffect中，确保只在客户端执行
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 响应式显示控制 - 确保手机端只显示中文
  useEffect(() => {
    const updateDisplay = () => {
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const desktopSpan = document.querySelector('[data-desktop="true"]') as HTMLElement;
      const mobileSpan = document.querySelector('[data-mobile="true"]') as HTMLElement;
      
      if (desktopSpan && mobileSpan) {
        if (isMobile) {
          desktopSpan.style.display = 'none';
          mobileSpan.style.display = 'inline-block';
        } else {
          desktopSpan.style.display = 'inline-block';
          mobileSpan.style.display = 'none';
        }
      }
    };

    updateDisplay();
    window.addEventListener('resize', updateDisplay);
    return () => window.removeEventListener('resize', updateDisplay);
  }, []);

  // 点击外部/ESC 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [open]);

  // 锚点跳转后自动收起
  useEffect(() => {
    const onHash = () => setOpen(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const Item = ({
    href,
    children,
  }: { 
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      role="menuitem"
      onClick={() => setOpen(false)}
      className="block rounded-xl px-3 py-2 text-white/90 hover:bg-white/10 active:scale-[0.98] transition"
    >
      {children}
    </Link>
  );

  return (
    <header className="fixed inset-x-0 top-5 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={[
            "h-16 flex items-center justify-between rounded-2xl",
            "border border-white/10 bg-black/40 backdrop-blur",
            scrolled ? "shadow-[0_6px_24px_rgba(0,0,0,0.32)] ring-1 ring-white/10" : "shadow-none",
          ].join(" ")}
        >
          {/* 左侧：品牌名（可点回首页） */}
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition flex-shrink min-w-0 truncate"
            style={{ minWidth: 'fit-content' }}
          >
            {/* 桌面端：显示完整的中英文 */}
            <span 
              className="hidden sm:inline-block whitespace-nowrap" 
              style={{ display: 'none' }}
              data-desktop="true"
            >
              福乐音乐工作室 / Fuel Music Studio
            </span>
            {/* 手机端：只显示中文 */}
            <span 
              className="sm:hidden whitespace-nowrap" 
              style={{ display: 'inline-block' }}
              data-mobile="true"
            >
              福乐音乐工作室
            </span>
          </Link>

          {/* 右侧：汉堡按钮 + 下拉 */}
          <div className="ml-auto flex items-center gap-2 pr-2 relative flex-shrink-0">
            <div className="relative">
              <a href="/tools"
                className="inline-flex items-center justify-center h-10 px-3 md:px-4 rounded-full border border-white/10 bg-white/10 backdrop-blur hover:bg-white/15 hover:border-purple-400/60 transition text-white/90 text-sm md:text-base flex-shrink-0 whitespace-nowrap"
                title="在线工具"
                style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
              >
                <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>在线工具</span>
              </a>

              {false && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 rounded-2xl border border-white/10 bg-black/80 backdrop-blur p-2 shadow-xl z-50 w-44"
                >
                  <Link
                    href="/tools/bpm"
                    className="block px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-purple-300"
                  >
                    BPM 测速器
                  </Link>
                  <Link
                    href="/tools/key"
                    className="mt-1 block px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-purple-300"
                  >
                    KEY 调性检测器
                  </Link>
                </div>
              )}
            </div>

              <button
                type="button"
                aria-label="打开菜单"
                aria-expanded={open}
                aria-controls="main-menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((v) => !v);
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 hover:border-purple-400/60 transition focus-visible:outline-none focus-visible:ring-0"
              >
                <span className="text-white/80 text-base md:text-lg leading-none">≡</span>
              </button>

            {open && (
              <div
                ref={panelRef}
                id="main-menu"
                role="menu"
                className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-white/10 bg-black/80 backdrop-blur p-2 shadow-xl z-50"
              >
                <Item href="/">首页</Item>
                <Item href="/#services">业务</Item>
                <Item href="/#cases">案例</Item>
                <Item href="/#pricing">价格</Item>
                <Item href="/#contact">联系</Item>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}