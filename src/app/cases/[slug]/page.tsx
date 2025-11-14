import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CASES } from "../../lib/site-data";

type Params = { slug: string };

export function generateStaticParams() {
  return CASES.map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const c = CASES.find(x => x.slug === params.slug);
  if (!c) return { title: "案例详情 | 福乐音乐工作室 Fuel Music Studio" };
  return {
    title: `${c.title}｜案例 | 福乐音乐工作室`,
    description: c.description || `${c.artist} - ${c.title}`,
  };
}

function clean<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default function CaseDetail({ params }: { params: Params }) {
  const c = CASES.find(x => x.slug === params.slug);
  if (!c) return notFound();

  const ld = clean({
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: c.title,
    byArtist: { "@type": "MusicGroup", name: c.artist },
    datePublished: c.year ? String(c.year) : undefined,
    inLanguage: "zh-CN",
    description: c.description,
  });

  return (
    <div className="space-y-8">
      <nav className="text-sm text-gray-500">
        <Link href="/" className="link">首页</Link>
        <span className="mx-2">/</span>
        <a href="/#cases" className="link">项目案例</a>
      </nav>

      <header className="rounded-2xl p-6 md:p-8 bg-white/80 dark:bg-neutral-900/70 border border-black/5 dark:border-white/10">
        <div className="kicker">CASE STUDY</div>
        <h1 className="text-2xl md:text-4xl font-semibold mt-2">{c.title}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{c.artist}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
            {c.year && <span>年份：{c.year}</span>}
            {c.role && (() => {
              if (Array.isArray(c.role)) {
                return c.role.length > 0 ? <span>角色：{c.role.join(" / ")}</span> : null;
              }
              return <span>角色：{String(c.role)}</span>;
            })()}
          </div>
      </header>

      {c.description && (
        <section className="card">
          <h2 className="section-title">项目简介</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{c.description}</p>
        </section>
      )}

      {c.credits && (
         <section className="card">
           <h2 className="section-title">制作人员与署名</h2>
           {Array.isArray(c.credits) && c.credits.length > 0 ? (
             <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
               {c.credits.map((x: any, index: number) => <li key={index}>• {x}</li>)}
             </ul>
           ) : (
             <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{String(c.credits)}</p>
           )}
         </section>
       )}

      <div className="flex gap-3">
        <a href="#contact" className="btn">联系合作</a>
        <a href="/#cases" className="btn secondary">返回案例列表</a>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}