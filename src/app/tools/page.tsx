"use client";
// Next.js 组件
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { analyzeAudio } from '@/lib/audioAnalyzer';

// 类型定义
interface AudioFeatures {
  bpm: number;
  key: string;
  scale: string;
  lufsIntegrated: number;
  peakDbFS: number;  // True Peak in dBTP
  lufsShortTerm: number;  // 平均短期响度
  lufsShortTermArray: number[];  // 数组用于绘制曲线
  lufsRange: number;
}

interface PlatformReport {
  [key: string]: {
    target: string;
    ok: boolean | null;
  };
}

// 工具函数
function fmtTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 主要组件
// 统计卡片（通用小卡）
function StatTile({ label, value, unit, tone = "blue" }: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "blue"|"purple"|"red"|"green";
}) {
  const toneMap:any = {
    blue:   {bg:"bg-blue-500/10",    ring:"ring-blue-400/30",   title:"text-blue-300",   val:"text-blue-100"},
    purple: {bg:"bg-purple-500/10",  ring:"ring-purple-400/30", title:"text-purple-300", val:"text-purple-100"},
    red:    {bg:"bg-rose-500/10",    ring:"ring-rose-400/30",   title:"text-rose-300",   val:"text-rose-100"},
    green:  {bg:"bg-emerald-500/10", ring:"ring-emerald-400/30",title:"text-emerald-300",val:"text-emerald-100"},
  };
  const t = toneMap[tone] || toneMap.blue;
  return (
    <div className={`rounded-2xl ${t.bg} ring-1 ${t.ring} p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}>
      <div className={`text-sm ${t.title}`}>{label}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className={`text-3xl sm:text-4xl font-semibold ${t.val}`}>{value ?? "--"}</div>
        {unit ? <div className={`text-base sm:text-lg ${t.title}`}>{unit}</div> : null}
      </div>
    </div>
  );
}

// 中性统计小卡（与现有视觉一致：深色毛玻璃 + 细边）
function NeutralTile({ label, value, unit }: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="text-sm sm:text-[15px] font-bold text-white/90">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-xl sm:text-2xl font-semibold text-white/90">{value ?? "--"}</div>
        {unit ? <div className="text-sm text-white/40">{unit}</div> : null}
      </div>
    </div>
  );
}

function ToolsHub() {
  // 文件相关状态
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [hint, setHint] = useState("上传音频文件后开始分析（支持 MP3 / WAV / M4A）");
  
  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // 音频分析结果状态
  const [analyzerRunning, setAnalyzerRunning] = useState(false);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null);
  const [essentiaVersion, setEssentiaVersion] = useState<string | null>(null);
  
  // 核心分析数据状态
  const [bpm, setBpm] = useState<number | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [scale, setScale] = useState<string | null>(null);
  const [lufsIntegrated, setLufsIntegrated] = useState<number | null>(null);
  const [peakDbFS, setPeakDbFS] = useState<number | null>(null);
  const [lufsShortTerm, setLufsShortTerm] = useState<number | null>(null);
  const [lufsRange, setLufsRange] = useState<number | null>(null);
  const [shortLoudness, setShortLoudness] = useState<number[] | null>(null);
  const [momentaryLoudness, setMomentaryLoudness] = useState<number[] | null>(null);
  const shortCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  
  // 平台报告状态
  const [platformReport, setPlatformReport] = useState<PlatformReport>({
    "网易云音乐": { target: '-15 LUFS', ok: null },
    "QQ音乐": { target: '-16 LUFS', ok: null },
    "抖音/TikTok": { target: '-12 LUFS', ok: null },
    YouTube: { target: '-14 LUFS', ok: null },
    AppleMusic: { target: '-16 LUFS', ok: null },
    Spotify: { target: '-14 LUFS', ok: null }
  });
  
  // 音频分析（待实现真实算法）
  const startAnalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    setAnalysisProgress(0);
    setAnalysisFailed(false);
    setCurrentStep("正在解码音频文件...");
    setHint("正在解码音频文件...");
    
    try {
      // 步骤1: 解码音频文件
      setCurrentStep("正在解码音频文件...");
      setHint("正在解码音频文件...");
      setAnalysisProgress(20);
      
      // 重置所有分析结果
      setBpm(null);
      setKey(null);
      setScale(null);
      setLufsIntegrated(null);
      setPeakDbFS(null);
      setLufsRange(null);
      setLufsShortTerm(null);
      setShortLoudness(null);
      
      // 重置平台报告
      const newPlatformReport = { ...platformReport };
      Object.keys(newPlatformReport).forEach(platform => {
        newPlatformReport[platform].ok = null;
      });
      setPlatformReport(newPlatformReport);
      
      // 模拟分析步骤进度
      const stepInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(stepInterval);
            return prev;
          }
          
          // 根据进度更新步骤
          if (prev < 20) {
            setCurrentStep("正在解码音频文件...");
            setHint("正在解码音频文件...");
          } else if (prev < 40) {
            setCurrentStep("正在分析BPM节拍...");
            setHint("正在分析BPM节拍...");
          } else if (prev < 60) {
            setCurrentStep("正在识别调性Key...");
            setHint("正在识别调性Key...");
          } else if (prev < 80) {
            setCurrentStep("正在计算响度LUFS...");
            setHint("正在计算响度LUFS...");
          } else {
            setCurrentStep("正在进行后端音频分析...");
            setHint("正在进行后端音频分析...");
          }
          
          return prev + Math.random() * 10;
        });
      }, 300);
      
      // 使用真实的音频分析算法
      const results = await analyzeAudio(file);
      
      // 分析完成，清理定时器
      clearInterval(stepInterval);
      setAnalysisProgress(100);
      
      // 设置分析结果
      setBpm(results.bpm);
      setKey(results.key);
      setScale(results.scale);
      setLufsIntegrated(results.lufsIntegrated);
      setPeakDbFS(results.peakDbFS);
               setLufsRange(results.lufsRange);
               setLufsShortTerm(results.lufsShortTerm);
               setShortLoudness(results.lufsShortTermArray);
               setMomentaryLoudness(results.lufsMomentaryArray);
      
      // 更新平台报告
      if (results.lufsIntegrated !== null) {
        const updatedReport = { ...newPlatformReport };
        Object.keys(updatedReport).forEach(platform => {
          const targetStr = updatedReport[platform].target;
          const target = parseFloat(targetStr.replace(' LUFS', ''));
          updatedReport[platform].ok = results.lufsIntegrated! >= target;
        });
        setPlatformReport(updatedReport);
      }
      
      // 标记分析完成
      setHasResult(true);
      setAnalysisFailed(false);
      setHint("分析完成！可以查看详细结果。");
      
    } catch (err: any) {
      console.error('分析出错:', err);
      
      // 统一的错误提示
      const errorMessage = "分析失败，请重新上传";
      
      setHint(errorMessage);
      setAnalysisFailed(true);
      
      // 重置结果状态
      setHasResult(false);
      setBpm(null);
      setKey(null);
      setScale(null);
      setLufsIntegrated(null);
      setLufsShortTerm(null);
      setLufsRange(null);
      setPeakDbFS(null);
      setShortLoudness(null);
      setMomentaryLoudness(null);
      
    } finally {
      setLoading(false);
      // 延迟重置进度条
      setTimeout(() => setAnalysisProgress(0), 1000);
    }
  };
  
  // 文件选择处理
  const onChooseFile = () => {
    fileInputRef.current?.click();
  };
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 文件验证
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/flac', 'audio/x-m4a'];
      
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav|m4a|aac|flac)$/i)) {
        setHint("文件格式不支持，请选择 MP3、WAV、M4A、AAC 或 FLAC 格式的音频文件");
        return;
      }
      
      setFile(selectedFile);
      setFileInfo({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        duration: null, // 将在实际播放时设置
        sampleRate: null,
        channels: null
      });
      setHint(`文件已选择：${selectedFile.name} (${fmtSize(selectedFile.size)})，点击开始分析按钮开始处理`);
    }
  };
  
  // 重置上传
  const resetUpload = () => {
    setFile(null);
    setFileInfo(null);
    setHasResult(false);
    setAnalysisFailed(false);
    setCurrentStep("");
    setBpm(null);
    setKey(null);
    setScale(null);
    setLufsIntegrated(null);
    setPeakDbFS(null);
    setLufsShortTerm(null);
    setLufsRange(null);
    setShortLoudness(null);
    setMomentaryLoudness(null);
    setHover(null);
    setHint("上传音频文件后开始分析（支持 MP3 / WAV / M4A）");
    
    // 重置平台报告，保持与初始状态一致
    setPlatformReport({
      "网易云音乐": { target: '-15 LUFS', ok: null },
      "QQ音乐": { target: '-16 LUFS', ok: null },
      "抖音/TikTok": { target: '-12 LUFS', ok: null },
      YouTube: { target: '-14 LUFS', ok: null },
      AppleMusic: { target: '-16 LUFS', ok: null },
      Spotify: { target: '-14 LUFS', ok: null }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 鼠标事件处理已整合到useEffect中

  // --- 短期响度曲线绘制（LUFS vs Time）---
  function drawShortLufs(
    canvas: HTMLCanvasElement,
    points: number | number[],  // 短期响度数组
    momentaryPoints: number[] | null,  // 瞬时响度数组
    opts: {
      seconds?: number | null;    // 总时长（秒，可选）
      hover?: { i: number; x: number; y: number } | null;
    } = {}
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx || points === null) return;
    
    // 如果是单个值，转换为数组
    const pointsArray = Array.isArray(points) ? points : [points];

    // DPR
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const cssW = canvas.clientWidth || 960;
    const cssH = canvas.clientHeight || 360;
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = cssW;
    const h = cssH;

    // 分离四边 padding，避免轴被遮挡
    const padTop = 24;
    const padRight = 32; // 进一步增加右侧内边距，确保文字不被裁剪
    const padBottom = 44; // 加大，留出刻度与“时间(秒)”标题
    const padLeft = 56;   // 进一步增加左侧内边距，确保"LUFS"文字不被裁剪
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // 计算 Y 轴范围（包含数据 & 瞬时响度），并加安全边距
    const momentaryArray = momentaryPoints || [];
    const rawMin = Math.min(...pointsArray, ...momentaryArray, -13);
    const rawMax = Math.max(...pointsArray, ...momentaryArray, -5);
    let yMin = Math.floor(rawMin - 0.5);
    let yMax = Math.ceil(rawMax + 0.5);
    if (yMax - yMin < 4) { yMax = yMin + 4; } // 最小可视高度，避免线被挤在底部

    const xN = pointsArray.length;
    const xStep = plotW / Math.max(1, xN - 1);
    const xAt = (i: number) => padLeft + i * xStep;
    const yAt = (v: number) => padTop + (yMax - v) * (plotH / (yMax - yMin));

    // 清理
    ctx.clearRect(0, 0, w, h);

    // 画 plot 区域边框裁剪，避免紫色填充溢出
    ctx.save();
    ctx.beginPath();
    ctx.rect(padLeft, padTop, plotW, plotH);
    ctx.clip();

    // 背景网格
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;

    // 垂直网格（时间）
    const secsAll = Math.max(1, Math.round((opts.seconds ?? (xN * 2))));
    const vEvery = Math.max(5, Math.round(secsAll / 12)); // ~12 格
    ctx.beginPath();
    for (let t = 0; t <= secsAll; t += vEvery) {
      const i = Math.round((t / secsAll) * (xN - 1));
      const x = xAt(i);
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, h - padBottom);
    }
    ctx.stroke();

    // 水平网格（LUFS）
    ctx.beginPath();
    for (let yTick = Math.ceil(yMin); yTick <= Math.floor(yMax); yTick += 1) {
      const y = yAt(yTick);
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
    }
    ctx.stroke();

    // 刻度文字
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // 横轴刻度数字
    for (let t = 0; t <= secsAll; t += vEvery) {
      const i = Math.round((t / secsAll) * (xN - 1));
      const x = xAt(i);
      ctx.fillText(String(t), x, h - padBottom + 6);
    }
    // 横轴标题（居中）
    ctx.fillText("时间 (秒)", padLeft + plotW / 2, h - padBottom + 22);

    // 纵轴刻度数字（靠左）
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let yTick = Math.ceil(yMin); yTick <= Math.floor(yMax); yTick += 1) {
      const y = yAt(yTick);
      ctx.fillText(String(yTick), padLeft - 8, y);
    }
    // 纵轴标题（居中竖排）
    ctx.save();
    ctx.translate(padLeft - 28, padTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("LUFS", 0, -10);
    ctx.restore();

    // 瞬时响度虚线（在网格之上、曲线之下）
    if (momentaryArray.length > 0) {
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(244,63,94,0.9)";
      ctx.lineWidth = 1;
      
      // 绘制瞬时响度曲线
      ctx.beginPath();
      for (let i = 0; i < momentaryArray.length; i++) {
        const x = xAt(i);
        const y = yAt(momentaryArray[i]);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 曲线 + 阴影（裁剪到 plot 区域内）
    ctx.save();
    ctx.beginPath();
    ctx.rect(padLeft, padTop, plotW, plotH);
    ctx.clip();

    // 阴影填充（避免"底部大紫带"，用裁剪限制区域）
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(pointsArray[0]));
    for (let i = 1; i < xN; i++) ctx.lineTo(xAt(i), yAt(pointsArray[i]));
    ctx.lineTo(xAt(xN - 1), padTop + plotH);
    ctx.lineTo(xAt(0), padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = "rgba(168,85,247,0.08)";
    ctx.fill();

    // 主曲线
    ctx.strokeStyle = "rgba(168,85,247,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(pointsArray[0]));
    for (let i = 1; i < xN; i++) ctx.lineTo(xAt(i), yAt(pointsArray[i]));
    ctx.stroke();

    // （可选）节点稀疏点
    ctx.fillStyle = "rgba(168,85,247,0.95)";
    const stride = Math.max(1, Math.round(xN / 60));
    for (let i = 0; i < xN; i += stride) {
      ctx.beginPath();
      ctx.arc(xAt(i), yAt(pointsArray[i]), 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 悬停提示（十字线 + 提示框）
    if (opts.hover) {
      const i = Math.min(Math.max(0, opts.hover.i), xN - 1);
      const px = xAt(i);
      const py = yAt(pointsArray[i]);

      // 十字线
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, padTop);
      ctx.lineTo(px, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // 提示内容：用“秒数”替代纯索引
      const secAtI = Math.round((i / Math.max(1, xN - 1)) * secsAll);
      const tip = [
        `${secAtI} s`,
        `短期响度： ${pointsArray[i].toFixed(3)} LUFS`,
        momentaryArray.length > i ? `瞬时响度： ${momentaryArray[i].toFixed(3)} LUFS` : ""
      ].filter(Boolean);

      // 提示框尺寸
      const pad = 8;
      ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      const tw = Math.max(...tip.map(t => ctx.measureText(t).width)) + pad * 2;
      const th = tip.length * 16 + pad * 2;

      let bx = Math.min(Math.max(px + 10, padLeft), padLeft + plotW - tw);
      let by = Math.min(Math.max(py - th - 8, padTop), padTop + plotH - th);

      // 背板
      ctx.fillStyle = "rgba(17,17,17,0.92)";
      ctx.strokeStyle = "rgba(168,85,247,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      // @ts-ignore 兼容老浏览器时可改为圆角矩形路径实现
      ctx.roundRect ? ctx.roundRect(bx, by, tw, th, 8) : ctx.rect(bx, by, tw, th);
      ctx.fill();
      ctx.stroke();

      // 文本
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      let ty = by + pad;
      for (const t of tip) {
        ctx.fillText(t, bx + pad, ty);
        ty += 16;
      }

      // 高亮点
      ctx.beginPath();
      ctx.fillStyle = "rgba(168,85,247,1)";
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // 直接使用drawShortLufs函数，不需要额外的包装器

  // 短期响度图表初始化和鼠标事件处理
  useEffect(() => {
    const cvs = shortCanvasRef.current;
    if (!cvs || shortLoudness === null) return;

    // 重绘
    const redraw = () => {
      drawShortLufs(cvs, shortLoudness, momentaryLoudness, { seconds: fileInfo?.duration ?? null, hover });
    };

    redraw();

    // 悬停事件
    const onMove = (ev: MouseEvent) => {
      const rect = cvs.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const padLeft = 56; // 与drawShortLufs函数中的padLeft保持一致
      const padRight = 32; // 与drawShortLufs函数中的padRight保持一致
      const w = cvs.clientWidth;
      const plotW = w - padLeft - padRight;
      if (plotW <= 0 || shortLoudness.length < 2) return;

      const step = plotW / (shortLoudness.length - 1);
      const i = Math.round((x - padLeft) / step);
      if (i < 0 || i >= shortLoudness.length) {
        setHover(null);
        return;
      }
      setHover({ i, x, y: 0 });
    };

    const onLeave = () => {
      setHover(null);
      // 移除悬停状态后重新绘制
      drawShortLufs(cvs, shortLoudness, momentaryLoudness, { seconds: fileInfo?.duration ?? null, hover: null });
    };

    // 为了确保事件正确绑定，先清理可能存在的事件监听器
    cvs.removeEventListener("mousemove", onMove);
    cvs.removeEventListener("mouseleave", onLeave);
    
    // 添加事件监听器
    cvs.addEventListener("mousemove", onMove);
    cvs.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", redraw);

    // 清理函数
    return () => {
      cvs.removeEventListener("mousemove", onMove);
      cvs.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", redraw);
    };
  }, [shortLoudness, momentaryLoudness, fileInfo?.duration, hover]); // 更新依赖
  

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden pt-0.5">
      {/* 背景装饰：紫色聚光 + 顶部暗角 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* 舞台聚光（居中，柔光） */}
        <div className="absolute left-1/2 top-[50px] -translate-x-1/2 h-[520px] w-[520px] rounded-full blur-3xl opacity-[0.22]" style={{background: 'radial-gradient(55%_55%_at_50%_50%, rgba(127,86,255,0.55) 0%, rgba(127,86,255,0.08) 46%, rgba(0,0,0,0) 70%)'}}></div>
        {/* 顶部暗角（更聚焦内容） */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent"></div>
      </div>

      <section className="mx-auto max-w-6xl px-5 pt-0.5 pb-14">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
              在线音频分析中心 <span className="text-purple-400">Audio Analysis Hub</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/70">
              一次上传，获取 BPM、调性 Key、响度 LUFS 等多个指标。同时检验响度是否符合流媒体平台规定
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-white/90 transition">首页</Link>
            <span>/</span>
            <span className="text-white/80">在线工具</span>
          </div>
        </header>

        <div className="mt-8 card-hover rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.05)] backdrop-blur p-4 sm:p-6 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_12px_40px_rgba(0,0,0,0.28)] transition hover:border-purple-400/40 hover:bg-[rgba(255,255,255,0.06)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_0_6px_3px_rgba(168,85,247,0.25),0_2px_8px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button 
              type="button" 
              onClick={onChooseFile}
              className="px-4 sm:px-5 h-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-sm transition hover:bg-white/15 hover:border-purple-400/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_0_1px_rgba(168,85,247,0.25),0_10px_30px_rgba(0,0,0,0.28)] touch-target"
            >
              <span className="leading-none text-white/90 text-sm sm:text-base">
                {file ? "重新上传" : "选择文件"}
              </span>
            </button>
            
            <input 
              ref={fileInputRef} 
              type="file"
              accept=".mp3,.wav,.m4a,.aac,.flac" 
              onChange={onFileChange} 
              className="hidden" 
            />
            
            {fileInfo && (
              <div className="flex flex-col gap-2 flex-1">
                <div className="text-white/60 text-sm break-words">
                  已选择：{fileInfo.name}
                </div>
                
                {/* 分析进度条 */}
                {loading && (
                  <div className="w-full sm:w-80">
                    <div className="w-full h-2 bg-white/5 rounded-full border border-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-100/90 to-purple-500/80 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:ml-auto">
              <button 
                type="button" 
                disabled={!file || loading} 
                onClick={startAnalyze}
                className={`px-4 sm:px-5 h-10 inline-flex items-center justify-center rounded-full border transition disabled:opacity-40 shadow-[0_0_2px_1px_rgba(255,255,255,0.08)] touch-target ${
                  analysisFailed 
                    ? "border-red-500/60 bg-red-500/10 text-white hover:bg-red-500/15 hover:border-red-400 hover:shadow-[0_0_10px_4px_rgba(239,68,68,0.25),0_3px_10px_rgba(0,0,0,0.25)]"
                    : "border-purple-500/60 bg-purple-500/10 text-white hover:bg-purple-500/15 hover:border-purple-400 hover:shadow-[0_0_10px_4px_rgba(168,85,247,0.25),0_3px_10px_rgba(0,0,0,0.25)]"
                }`}
              >
                {loading ? "分析中…" : (hasResult || analysisFailed ? "重新分析" : "开始分析")}
              </button>
              
              {file && (
                <button 
                  type="button" 
                  onClick={resetUpload}
                  className="px-4 h-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/0 hover:bg-white/10 transition touch-target"
                >
                  清空
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-3 text-white/60 text-sm">{hint}</div>
        </div>

        {/* 音频分析结果展示区域 */}
          
          <section className="mt-10 flex flex-col gap-8">
            
            {/* ① BPM & KEY */}
            
            <div className="card-hover rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.04)]">
            
            <div className="mb-4 flex items-end justify-between">
              
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white/90">BPM / KEY</div>
              
              <div className="text-[13px] text-white/40"></div>
              
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              <NeutralTile label="BPM" value={(typeof bpm === "number" ? Math.round(bpm) : "--")} unit="BPM" />
              
              <NeutralTile label="KEY" value={(key ? key + (scale? (" " + (scale === "min" ? "min" : scale)) : "") : "--")} />
              
            </div>
            
          </div>
          
          
          {/* ② 响度四项（集成/峰值/短期/LRA） */}
          
          <div className="mt-6 card-hover rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.04)]">
            
            <div className="mb-4 flex items-end justify-between">
              
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white/90">响度指标</div>
              
              <div className="text-[13px] text-white/40"></div>
              
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              
              <NeutralTile label="集成响度" value={(typeof lufsIntegrated === "number" ? lufsIntegrated.toFixed(1) : "--")} unit="LUFS" />
              
              <NeutralTile label="真峰值" value={(typeof peakDbFS === "number" ? peakDbFS.toFixed(1) : "--")} unit="dBTP" />
              
              <NeutralTile label="响度范围" value={(typeof lufsRange === "number" ? lufsRange.toFixed(1) : "--")} unit="LU" />
              
            </div>
            
          </div>
          
          {/* 响度曲线 */}
          <section id="loudness-curve" className="mt-6 sm:mt-8">
            <div className="card-hover rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.05)] backdrop-blur p-6 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_12px_40px_rgba(0,0,0,0.28)] transition hover:border-purple-400/40 hover:bg-[rgba(255,255,255,0.06)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_0_6px_3px_rgba(168,85,247,0.25),0_2px_8px_rgba(0,0,0,0.25)]">
              <div className="mb-4 flex items-end justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-white/90">响度曲线</h3>
              </div>
              <div className="relative rounded-2xl border border-white/10 bg-black/30 h-[320px] sm:h-[360px]">
                <canvas 
                  ref={shortCanvasRef as any} 
                  className="w-full h-full block cursor-crosshair"
                ></canvas>
                {!shortLoudness?.length && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">上传并分析后显示短期响度曲线</div>
                )}
              </div>
            </div>
          </section>
        </section>
        

        
        
        {/* 平台响度目标校验 */}
        <section className="mt-10">
          <div className="card-hover rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.05)] backdrop-blur p-6 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_12px_40px_rgba(0,0,0,0.28)] transition hover:border-purple-400/40 hover:bg-[rgba(255,255,255,0.06)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_0_6px_3px_rgba(168,85,247,0.25),0_2px_8px_rgba(0,0,0,0.25)]">
            <div className="mb-4 flex items-end justify-between">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white/90">平台响度目标校验</div>
              <div className="text-[13px] text-white/40"></div>
            </div>

            {/* 手机端：卡片式布局 */}
            <div className="block sm:hidden space-y-3">
              {Object.entries(platformReport).map(([name, info], index) => {
                const lufsTarget = parseInt(info.target);
                const dbtpTargets: Record<string, number> = {
                  "网易云音乐": -1,
                  "QQ音乐": -1,
                  "抖音/TikTok": -1,
                  YouTube: -1.5,
                  AppleMusic: -1.5,
                  Spotify: -1
                };
                const dbtpTarget = dbtpTargets[name] || -1;
                const passed = info.ok === true && (peakDbFS === null || peakDbFS <= dbtpTarget);
                
                return (
                  <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white/90 font-semibold text-sm">{name}</h4>
                      {info.ok === null ? (
                        <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">未检测</span>
                      ) : passed ? (
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">合格</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">超标</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-white/60 text-xs">LUFS 目标</div>
                        <div className="text-white/90 font-medium">{info.target}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">当前 LUFS</div>
                        <div className="text-white/90 font-medium">
                          {lufsIntegrated !== null ? `${lufsIntegrated.toFixed(1)} LUFS` : '--'}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">dBTP 目标</div>
                        <div className="text-white/90 font-medium">{dbtpTarget} dBTP</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-xs">当前 dBTP</div>
                        <div className="text-white/90 font-medium">
                          {peakDbFS !== null ? `${peakDbFS.toFixed(1)} dBTP` : '--'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 桌面端：表格布局 */}
            <div className="hidden sm:block overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left text-white/50 text-sm">
                    <th className="pb-3 font-semibold">平台名称</th>
                    <th className="pb-3 font-semibold">LUFS 目标</th>
                    <th className="pb-3 font-semibold">当前 LUFS</th>
                    <th className="pb-3 font-semibold">dBTP 目标</th>
                    <th className="pb-3 font-semibold">当前 dBTP</th>
                    <th className="pb-3 font-semibold">是否达标</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(platformReport).map(([name, info], index) => {
                    const lufsTarget = parseInt(info.target);
                    const dbtpTargets: Record<string, number> = {
                      "网易云音乐": -1,
                      "QQ音乐": -1,
                      "抖音/TikTok": -1,
                      YouTube: -1.5,
                      AppleMusic: -1.5,
                      Spotify: -1
                    };
                    const dbtpTarget = dbtpTargets[name] || -1;
                    const passed = info.ok === true && (peakDbFS === null || peakDbFS <= dbtpTarget);
                    
                    return (
                      <tr key={index} className="border-t border-white/10">
                        <td className="py-3 text-white/80 font-semibold text-sm">{name}</td>
                        <td className="py-3 text-white/80 font-semibold text-sm">{info.target}</td>
                        <td className="py-3 text-white/80 font-semibold text-sm">
                          {lufsIntegrated !== null ? `${lufsIntegrated.toFixed(1)} LUFS` : '--'}
                        </td>
                        <td className="py-3 text-white/80 font-semibold text-sm">{dbtpTarget} dBTP</td>
                        <td className="py-3 text-white/80 font-semibold text-sm">
                          {peakDbFS !== null ? `${peakDbFS.toFixed(1)} dBTP` : '--'}
                        </td>
                        <td className="py-3">
                          {info.ok === null ? (
                            <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">未检测</span>
                          ) : passed ? (
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">合格</span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">超标</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
            </div>
          </div>
        </section>

        {/* 响度重要性说明 */}
        <section className="mt-8">
          <div className="card-hover rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.05)] backdrop-blur p-6 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_12px_40px_rgba(0,0,0,0.28)] transition hover:border-purple-400/40 hover:bg-[rgba(255,255,255,0.06)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_0_6px_3px_rgba(168,85,247,0.25),0_2px_8px_rgba(0,0,0,0.25)]">
            <div className="mb-4 flex items-end justify-between">
              <div className="text-xl sm:text-2xl font-bold text-white/90">为什么响度如此重要</div>
            </div>
            
            <div className="text-white/80 text-sm leading-6 space-y-4">
              <p>
                人们都讨厌音量突然变大变小，为了防止我们被突如其来的巨响&ldquo;轰炸&rdquo;；也为了平台上音乐的音量都在统一水平线上，在线流媒体服务会测量音乐的响度，并调低那些录制响度较高的歌曲。我们将这种响度降低称为&ldquo;响度惩罚&rdquo;（Loudness Penalty）。你的音乐在母带制作时响度越高，受到的惩罚就可能越大。但所有的流媒体服务采取的方式不尽相同，给出的惩罚值也不一样，这使得你很难知道自己的音乐会面临多大的响度惩罚。
              </p>
              
              <p>
                所以音乐人应当在正式发布歌曲之前，将歌曲的响度控制在平台规定的标准之下，以保证歌曲的音质不会受到影响。
              </p>
              
              <p>
                由于各大平台的响度标准也很相近，按平台的规定控制好歌曲的响度也能确保音频在不同平台上的响度一致，从而提升听众的听觉体验，避免音频过载或过弱。
              </p>
            </div>
          </div>
        </section>
        
        <div className="mt-8 text-xs text-white/50 leading-6">
          <div className="text-xl sm:text-2xl font-bold text-white/90 mb-2">支持格式</div>
          <div className="mb-4">MP3、WAV、M4A、AAC、FLAC（建议使用 WAV 格式获取更准确结果）。</div>
          <div className="text-xl sm:text-2xl font-bold text-white/90 mb-2">注意事项</div>
          <ul className="list-disc list-inside space-y-1">
            <li>所有分析在浏览器端完成，数据不会上传到服务器。</li>
            <li>分析结果仅供参考，最终效果以实际听感为准。</li>
          </ul>
          
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-sm text-white/60">
              <strong className="text-white/80">技术声明：</strong>本网站的音频分析功能基于开源音频分析库 
              <a href="https://essentia.upf.edu/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition underline">
                Essentia
              </a> 
              实现，感谢其开源贡献。
            </div>
          </div>
        </div>
        

      </section>
    </div>
  );
}

// 直接导出ToolsHub组件，移除对不存在脚本的引用
export default ToolsHub;
