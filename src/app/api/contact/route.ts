import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "请填写称呼").max(60),
  email: z.string().email("邮箱格式不正确"),
  message: z.string().min(10, "请尽量详细描述需求（至少10个字）").max(5000),
});

const resendKey = process.env.RESEND_API_KEY || "";
const toEmail = process.env.CONTACT_TO_EMAIL || ""; // 你的收件邮箱

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = schema.parse(body);

    if (resendKey && toEmail) {
      const resend = new Resend(resendKey);
      const { data, error } = await resend.emails.send({
        from: "Fuel Music <onboarding@resend.dev>",
        to: [toEmail],
        subject: `网站新咨询 - ${name}`,
        replyTo: String(email),
        text: `来自：${name} <${email}>

${message}`,
      });
      if (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error("[RESEND_ERR]", error);
          }
          throw new Error("邮件服务出错");
        }
        if (process.env.NODE_ENV !== 'production') {
          console.log("[RESEND_OK]", { id: data?.id, to: toEmail });
        }
      } else {
        // 无密钥时降级为日志，便于本地调试（仅开发环境输出）
        if (process.env.NODE_ENV !== 'production') {
          console.log("[CONTACT_FALLBACK]", { name, email, message });
        }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = err?.issues?.[0]?.message || err?.message || "Bad Request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
