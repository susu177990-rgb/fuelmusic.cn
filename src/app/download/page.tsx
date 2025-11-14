"use client";
import QRCode from "react-qr-code";
import { APP_LINKS } from "../lib/site-data";

function QrCard({ title, url }: { title: string; url: string }) {
  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 shadow-[0_6px_30px_rgba(0,0,0,0.06)] border border-black/5 dark:border-white/10 flex flex-col items-center text-center gap-4">
      <div className="font-medium">{title}</div>
      <div className="bg-white p-3 rounded-xl">
        <QRCode value={url} size={164} />
      </div>
      <a href={url} className="inline-flex items-center rounded-xl px-4 py-2 bg-[#6B4EFF] text-white hover:opacity-90 transition">
        直接下载/打开
      </a>
      <p className="text-xs text-gray-500">
        用手机相机扫一扫二维码，或点击按钮在设备上打开。
      </p>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold">APP 下载</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        支持 iOS 与 Android。未上架前可放 TestFlight / APK 链接（编辑 apps/web/src/app/lib/site-data.ts 的 APP_LINKS）。
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <QrCard title="iOS 下载" url={APP_LINKS.ios} />
        <QrCard title="Android 下载" url={APP_LINKS.android} />
      </div>

      <div className="rounded-2xl p-6 bg-white dark:bg-neutral-900 shadow-[0_6px_30px_rgba(0,0,0,0.06)] border border-black/5 dark:border-white/10">
        <div className="font-medium">关于 APP</div>
        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• 学习混音插件的上手教程与工程复盘。</li>
          <li>• 一键咨询下单，查看项目进度。</li>
          <li>• 版本计划：通知中心 / 作品集离线浏览 / 预约录音棚。</li>
        </ul>
      </div>
    </div>
  );
}
