'use client';

import Link from 'next/link';
import React from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <section
        className="glass w-full max-w-2xl p-8 md:p-10 text-center rounded-2xl"
        aria-live="assertive"
        role="alert"
      >
        <h1 className="text-2xl md:text-3xl font-semibold mb-3">
          噢！页面遇到了一点问题
        </h1>
        <p className="text-white/70 mb-6">
          我们已记录错误{error?.digest ? `（ID: ${error.digest}）` : ''}。你可以尝试重新加载，或先返回首页。
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn touch-target"
            type="button"
          >
            重试
          </button>
          <Link href="/" className="btn btn-secondary touch-target">
            返回首页
          </Link>
        </div>

        <details className="mt-6 text-left text-white/60">
          <summary className="cursor-pointer select-none">查看错误详情</summary>
          <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">
{String(error?.message || '')}
          </pre>
        </details>
      </section>
    </main>
  );
}