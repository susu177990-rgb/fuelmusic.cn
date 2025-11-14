"use client";
import { BRAND, BUSINESS, CASES, PRICING, CONTACT } from "./lib/site-data";
import Link from "next/link";
import Image from "next/image";
import dynamic from 'next/dynamic';

// 懒加载 CaseCard 组件
const CaseCard = dynamic(() => import('../components/CaseCard'), {
  loading: () => <div className="card card-hover p-4 text-center">加载中...</div>,
  ssr: true,
});
// 懒加载 ContactForm 和 PricingEstimator 组件
const ContactForm = dynamic(() => import('./components/ContactForm'), {
  loading: () => <div className="p-4 text-center">加载联系表单中...</div>,
  ssr: true,
});

const PricingEstimator = dynamic(() => import('../components/PricingEstimator'), {
  loading: () => <div className="p-4 text-center">加载价格估算器中...</div>,
  ssr: true,
});

// 功能开关
const SHOW_ESTIMATOR = false;

export default function HomePage() {
  // FAQ JSON-LD 数据
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "混音通常需要多久？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "标准单曲在素材齐全、沟通清晰的情况下通常10个工作日内。EP/专辑会在初步评估后给出排期。"
        }
      },
      {
        "@type": "Question",
        "name": "需要我提供哪些文件？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "请提供分轨(WAV/AIFF，24bit/48kHz 优先)、BPM/调式信息、参考曲目，以及任何你希望保留的效果。"
        }
      },
      {
        "@type": "Question",
        "name": "可以先出一段试听样本吗？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "可提供 30–60 秒的片段试听，用于确认方向。确认后进入正式流程。"
        }
      },
      {
        "@type": "Question",
        "name": "包含几次修改？超出如何计费？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "单曲套餐默认含 3 次微调。超出部分按工时或包段计费，确认前会与您沟通。"
        }
      },
      {
        "@type": "Question",
        "name": "交付什么格式？会上架合规吗？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "默认交付立体声母带(WAV 24bit)，可按流媒体/短视频平台规范提供版本；可选 stems 及项目归档。"
        }
      }
    ]
  };

  return (
    <div className="space-y-16">

      {/* Hero */}
      <section id="hero" className="pt-6 md:pt-10"> 
        <div className="container"> 
          {/* 左侧内容固定在上方；右侧 Logo 固定尺寸并整体下移；按钮与 Logo 底缘对齐 */} 
          <div className="grid md:grid-cols-[minmax(0,1fr)_420px] gap-8 md:gap-10"> 
            {/* 左列：设置最小高度，使底边与右侧下移的 Logo 底边齐平 */} 
            <div className="flex flex-col md:min-h-[384px]"> 
              <div> 
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-[-0.02em] md:whitespace-nowrap"> 
                  {BRAND.nameCN} <span className="mx-2 text-brand">/</span> 
                  <span className="brand-gradient">{BRAND.nameEN}</span> 
                </h1> 
                <p className="lead mt-4">{BRAND.slogan}</p> 
              </div> 

              {/* 保持标题与按钮之间留白；桌面端上移约22px，大屏上移约26px，使按钮下边缘与右侧 Logo 下边缘对齐 */}
              <div className="mt-8 md:mt-auto md:-translate-y-[22px] lg:-translate-y-[26px] md:transform flex items-center gap-3"> 
                <a href="#contact" className="btn border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition">立即联系</a> 
                <a 
                  href="/tools" 
                  className="btn ml-3 border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition" 
                > 
                  在线工具 
                </a> 
              </div> 
            </div> 

            {/* 右列：透明容器 + 更小的 LOGO；保留紫色光晕 */} 
            <div className="hidden md:flex w-[420px] h-[320px] mt-10 md:mt-16 items-center justify-center pointer-events-none select-none"> 
              <Image 
                src="/brand/logo.webp" 
                alt="Fuel Music Logo" 
                width={320}           
                height={240} 
                priority
                className="logo-glow object-contain opacity-100 w-auto h-auto" 
                sizes="(min-width: 768px) 320px, 100vw" 
              /> 
            </div> 
          </div> 
        </div> 
      </section>



      {/* 主营业务 */}
      <section id="services" className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-semibold">主营业务</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {BUSINESS.map((b) => (
            <div key={b.title} className="card card-hover">
              <div className="text-lg font-medium">{b.title}</div>
              <div className="mt-1 text-gray-600 dark:text-gray-300">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 项目案例 */}
      <section id="cases" className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-semibold">项目案例</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {CASES.slice(0,3).map(c => (<CaseCard key={c.slug} item={c} />))}
        </div>
      </section>

      {/* 价格展示 */}
      <section id="pricing" className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-semibold">混音服务价格</h2>
        <p className="text-sm text-gray-500">以下为起步价，实际根据工程复杂度评估；支持项目打包与长期合作。</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRICING.map((p, index) => {
            // 处理标题，在括号前换行
            const title = p.title || p.name || '';
            const bracketIndex = title.indexOf('(');
            const mainTitle = bracketIndex > 0 ? title.substring(0, bracketIndex) : title;
            const subtitle = bracketIndex > 0 ? title.substring(bracketIndex) : null;
            
            return (
              <div key={p.slug || p.name || index} className="card card-hover flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1">
                      <div className="text-lg font-semibold leading-tight">{mainTitle}</div>
                      {subtitle && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-tight">{subtitle}</div>
                      )}
                    </div>
                    {p.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand)] text-white whitespace-nowrap flex-shrink-0">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 mb-4 text-2xl font-semibold">{p.price}</div>
                  {p.note && <div className="mt-1 mb-3 text-gray-500 text-sm">{p.note}</div>}
                  <ul className="mt-3 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {f.endsWith('：') || f === '额外收费：' || f === '交付内容：' || f === '服务内容：' ? (
                          <span className="font-medium text-gray-700 dark:text-gray-200">{f}</span>
                        ) : (
                          <span>• {f}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                {p.cta && (
                  <a 
                    href={p.cta.href} 
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm transition w-full"
                  >
                    {p.cta.label}
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur px-4 py-3 md:px-6 md:py-4 shadow-[0_12px_40px_rgba(109,82,255,0.18)]">
          <p className="text-sm md:text-[15px] text-gray-200">
            <span className="font-medium text-white">加值服务</span>
            <span className="mx-2 text-white/50">→</span>
            修音/修节奏 <span className="text-white">+￥99</span>(不含伴奏)；
            同意添加福乐音乐混音水印 <span className="text-white">立减￥99</span>。
          </p>
        </div>

        {SHOW_ESTIMATOR && (
          <section className="mt-10">
            <h3 className="text-2xl md:text-3xl font-semibold">报价估算(Beta)</h3>
            <p className="text-sm text-gray-500">仅分轨混音与编曲定制的粗略估算，结果用于沟通参考。</p>
            <div className="mt-4">
              <PricingEstimator />
            </div>
          </section>
        )}
      </section>



      {/* 常见问题 FAQ */}
      <section id="faq" className="space-y-4">
        <h2 className="section-title">常见问题 FAQ</h2>
        <p className="section-sub">关于周期、素材、修改次数与交付格式的常见问题。</p>
        <div className="grid md:grid-cols-2 gap-4">
          <details className="card card-hover">
            <summary className="font-medium cursor-pointer">混音通常需要多久？</summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">标准单曲在素材齐全、沟通清晰的情况下通常10个工作日内。EP/专辑会在初步评估后给出排期。</p>
          </details>
          <details className="card card-hover">
            <summary className="font-medium cursor-pointer">需要我提供哪些文件？</summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">请提供分轨(WAV/AIFF，24bit/48kHz 优先)、BPM/调式信息、参考曲目，以及任何你希望保留的效果。</p>
          </details>
          <details className="card card-hover">
            <summary className="font-medium cursor-pointer">可以先出一段试听样本吗？</summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">可提供 30–60 秒的片段试听，用于确认方向。确认后进入正式流程。</p>
          </details>
          <details className="card card-hover">
            <summary className="font-medium cursor-pointer">包含几次修改？超出如何计费？</summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">单曲套餐默认含 3 次微调。超出部分按工时或包段计费，确认前会与您沟通。</p>
          </details>
          <details className="card card-hover md:col-span-2">
            <summary className="font-medium cursor-pointer">交付什么格式？会上架合规吗？</summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">默认交付立体声母带(WAV 24bit)，可按流媒体/短视频平台规范提供版本；可选 stems 及项目归档。</p>
            <a href="#contact" className="btn mt-4">还有问题？联系我</a>
          </details>
        </div>
      </section>

      {/* 联系我们 */}
      <section id="contact" className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-semibold">联系我们</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card card-hover space-y-3">
            <div>
              <div className="text-sm text-gray-500">邮箱</div>
              <a href={`mailto:${CONTACT.email}`} className="mt-1 font-medium text-[#6B4EFF]">{CONTACT.email}</a>
            </div>
            <div>
              <div className="text-sm text-gray-500">微信</div>
              <div className="mt-1 font-medium">{CONTACT.wechat}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">电话</div>
              <div className="mt-1 font-medium">{CONTACT.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">抖音</div>
              <a 
                href="https://www.douyin.com/user/MS4wLjABAAAAQ5ucaqx0Oek2GZOjAJRnrS2AWsOaNfqmm_vm47UFXyoNbsa1KP_bfZlQ8IVV5xCu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-1 font-medium text-[#6B4EFF] hover:text-[#8B5CF6] transition-colors"
              >
                福乐音乐工作室
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              也可右侧直接提交需求表单，我们会回复到你的邮箱。
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* FAQ JSON-LD 标注 */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

    </div>
  );
}
