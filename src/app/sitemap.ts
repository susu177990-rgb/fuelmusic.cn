import { CASES } from "./lib/site-data";

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  const routes = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ...CASES.map(c => ({
      url: `${base}/cases/${c.slug}`,
      // 若有年份，用该年 1 月 1 日作为 lastModified；否则用 now
      lastModified: c.year ? new Date(`${c.year}-01-01`) : now,
      changeFrequency: "yearly",
      priority: 0.7,
    })),
  ];

  return routes;
}
