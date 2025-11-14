import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <section className="glass w-full max-w-2xl p-8 md:p-10 text-center rounded-2xl">
        <div className="text-[64px] leading-none font-black tracking-tight bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text select-none">
          404
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold">抱歉，页面不见了</h1>
        <p className="mt-3 text-white/70">
          可能链接已变更或被移除。您可以返回首页，或直接联系我们。
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/" className="btn touch-target">返回首页</Link>
          <Link href="/#contact" className="btn btn-secondary touch-target">联系我</Link>
        </div>
      </section>
    </main>
  );
}
