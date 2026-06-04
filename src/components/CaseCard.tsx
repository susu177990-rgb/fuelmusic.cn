"use client";
import Image from "next/image";
import { useRef, useState, useCallback, useEffect } from "react";
import type { CaseItem } from "../app/lib/site-data";
import ProgressBar from "@/components/ProgressBar";

function formatPlay(n: number) {
  // 12,345 => 1.2万；1,234,567 => 123.4万；过亿可自行扩展
  if (n >= 100000000) return (Math.round(n / 10000000) / 10) + "亿";
  if (n >= 10000) return (Math.round(n / 1000) / 10) + "万";
  return n.toLocaleString();
}

export default function CaseCard({ item }: { item: CaseItem }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasAudioError, setHasAudioError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const pauseOthers = useCallback(() => {
    const all = Array.from(document.querySelectorAll("audio")) as HTMLAudioElement[];
    all.forEach(a => { if (a !== audioRef.current) a.pause(); });
  }, []);

  // 音频错误处理函数
  const handleAudioError = useCallback(() => {
    setHasAudioError(true);
    setPlaying(false);
    // 稍后尝试恢复播放（仅在用户交互后）
    setTimeout(() => {
      setHasAudioError(false);
    }, 1000);
  }, []);  
  // 优化播放逻辑，增强错误处理和恢复机制
  const togglePlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      if (el.paused) {
        pauseOthers();
        // 如果之前有错误，尝试重新加载
        if (hasAudioError && audioUrlRef.current) {
          try {
            // 尝试重新加载音频
            el.src = audioUrlRef.current.value;
            await el.load();
          } catch (loadError) {
            console.error("Audio reload error:", loadError);
            // 显示错误状态但不阻止UI更新
          }
        }
        // 尝试播放
        await el.play();
        // 播放成功，清除错误状态
        setHasAudioError(false);
      } else {
        el.pause();
      }
    } catch (error) {
      console.error("Audio play error:", error);
      // 设置错误状态
      setHasAudioError(true);
      // 在失败时切换UI状态，保持用户体验一致性
      setPlaying(prev => !prev);
    }
  }, [pauseOthers, hasAudioError]);

  const onPlay   = () => setPlaying(true);
  const onPause  = () => setPlaying(false);
  const onEnded  = () => { setPlaying(false); };
  // 添加加载开始事件处理器
  const onLoadStart = () => {
    setHasAudioError(false);
  };
  // 播放进度更新 - 拖动时不更新
  const onTimeUpdate = () => {
    if (isDragging) return; // 拖动时不更新进度条
    const el = audioRef.current;
    if (!el) return;
    setProgress(el.currentTime / el.duration || 0);
  };
  // 计算点击位置的进度百分比
  const getProgressFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const clickPosition = (clientX - rect.left) / rect.width;
    // 限制在 0-1 范围内
    return Math.max(0, Math.min(1, clickPosition));
  };

  // 进度条点击/拖动开始事件
  const onSeekStart = (e: React.MouseEvent | React.TouchEvent) => {
    const el = audioRef.current;
    if (!el) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clickPosition = getProgressFromClientX(clientX);
    
    el.currentTime = clickPosition * el.duration;
    setProgress(clickPosition);
  };

  // 拖动过程中更新进度
  const onSeekMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const el = audioRef.current;
    if (!el) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clickPosition = getProgressFromClientX(clientX);
    
    setProgress(clickPosition);
  }, [isDragging]);

  // 拖动结束，应用最终进度
  // 拖动结束，应用最终进度并优化用户体验
  const onSeekEnd = useCallback(() => {
    if (!isDragging) return;
    
    const el = audioRef.current;
    if (!el || !el.duration) return;
    
    try {
      // 应用计算的进度位置
      el.currentTime = progress * el.duration;
      // 拖动结束，恢复正常状态
      setIsDragging(false);
    } catch (error) {
      console.error("Seek error:", error);
      // 即使出错也重置拖动状态，避免UI卡死
      setIsDragging(false);
    }
  }, [isDragging, progress]);

  // 设置拖动事件监听和加载事件处理
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    
    // 添加加载开始事件
    el.addEventListener("loadstart", onLoadStart);
    
    // 添加播放事件额外处理
    const handlePlayStateChange = () => {
      if (el.paused !== !playing) {
        setPlaying(!el.paused);
      }
    };
    
    el.addEventListener("play", handlePlayStateChange);
    el.addEventListener("pause", handlePlayStateChange);
    
    return () => {
      // 清理所有事件监听器
      el.removeEventListener("loadstart", onLoadStart);
      el.removeEventListener("play", handlePlayStateChange);
      el.removeEventListener("pause", handlePlayStateChange);
    };
  }, [playing]);

  // 管理全局鼠标/触摸事件监听
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => onSeekMove(e);
    const handleMouseUp = () => onSeekEnd();
    const handleTouchMove = (e: TouchEvent) => onSeekMove(e);
    const handleTouchEnd = () => onSeekEnd();

    // 添加全局事件监听，确保即使鼠标离开进度条区域也能继续拖动
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, onSeekEnd, onSeekMove]);

  // 优化全局空格键控制 - 允许空格键切换播放/暂停状态
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 避免干扰其他需要空格键的元素（如输入框）
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // 当焦点在当前卡片或卡片是最近播放的时，允许空格键控制
      const audioElement = audioRef.current;
      if (e.key === ' ' && audioElement) {
        e.preventDefault();
        togglePlay();
      }
    };

    // 添加全局键盘事件监听
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      // 组件卸载时移除事件监听
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [togglePlay]);
  
  return (
    <div className="card card-hover space-y-3">
      {item.cover && (
        <div 
          className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-white/[0.04] cursor-pointer ring-1 ring-white/0 hover:ring-violet-400/20 transition"
          style={{ aspectRatio: "1 / 1" }}
          onClick={togglePlay}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePlay(); }}}
          aria-pressed={playing}
          title={playing ? "点击暂停" : "点击播放"}
        >
          <Image 
            src={item.cover} 
            alt={`${item.artist} - ${item.title} 封面`} 
            fill 
            className="object-cover" 
            sizes="(min-width:768px) 33vw, 100vw" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none'; // 隐藏失败的图片
            }}
          />
          {/* 右上角小状态点 - 添加动画效果 */}
          <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-violet-400/70 shadow-[0_0_12px_rgba(109,82,255,0.8)]" 
               style={{ 
                 opacity: playing ? 1 : 0.25,
                 // 播放时添加脉冲动画
                 animation: playing ? 'pulse 2s infinite' : 'none'
               }} />
          
          {/* 添加动画样式 */}
          <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                box-shadow: 0 0 12px rgba(109, 82, 255, 0.8);
              }
              50% {
                box-shadow: 0 0 16px rgba(109, 82, 255, 1), 0 0 20px rgba(109, 82, 255, 0.6);
              }
            }
          `}</style>
        </div>
      )}

      <div className="text-sm text-gray-400">{item.artist}{item.role ? ` · ${item.role}` : ""}</div>
      <div className="text-lg font-semibold text-white tracking-[-0.01em]">{item.title}</div>
      
      {(() => {
        const playText = 
          item.playCountLabel ?? (typeof item.playCount === "number" ? formatPlay(item.playCount) : undefined);
        
        if (playText) {
          return (
            <div className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[11px] text-gray-300 border border-white/10">
              <span className="tabular-nums">{playText}</span>
            </div>
          );
        }
        return null;
      })()}
      

      {item.audio && (
        <>
          {/* 修复TypeScript编译错误，恢复使用source标签 */}
          <audio 
            ref={audioRef}
            preload="auto" /* 其他属性保持原样 */
            className="hidden"
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={handleAudioError}
            onLoadStart={onLoadStart}
            onTimeUpdate={onTimeUpdate}
          >
            <source src={item.audio} type="audio/mpeg" />
          </audio>
          <input type="hidden" ref={audioUrlRef} value={item.audio} />

          {/* 自定义播放器：毛玻璃 + 渐变进度 + 时间 */}
          <div className="relative mt-3 rounded-2xl bg-white/[0.02] backdrop-blur-2xl px-3 py-2 shadow-[0_12px_48px_rgba(109,82,255,0.22)] fuel-player">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/8 to-transparent" />
            <div className="fuel-player__wrap">
              {/* 播放按钮：36x36像素正圆形 */}
              <button 
                onClick={togglePlay}
                data-state={playing ? 'playing' : 'paused'}
                aria-label={playing ? '暂停' : '播放'}
                className=" 
                  bg-[#1A1A1F] text-[#A78BFA] ring-1 ring-white/10 
                  hover:text-[#8B5CF6] transition-colors 
                  data-[state=playing]:bg-[#7C3AED] data-[state=playing]:text-black 
                  fuel-player__btn
                "
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M6 4l14 8-14 8z"/></svg>
                )}
              </button>

              {/* 进度条：超薄，无黑框、无外发光，仅品牌渐变 + 白色圆点（有紫色描边） */}
              <div 
                ref={trackRef}
                onMouseDown={onSeekStart}
                onTouchStart={onSeekStart}
                className="relative ml-3 h-8 w-full flex items-center select-none fuel-player__rail"
                data-role="progress"
              >
                {/* 底轨（未播放） */}
                <div className="absolute left-0 right-0 h-[6px] rounded-full bg-white/10" />

                {/* 已播放填充（品牌渐变） */}
                <div 
                  className="absolute left-0 h-[6px] rounded-full bg-gradient-to-r from-[#C4B5FD] to-[#7C3AED]"
                  style={{ width: `${progress * 100}%` }}
                />

                {/* 圆点（更小、仅描边，无光圈） */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `calc(${progress * 100}% - 8px)` }}  // 8px = 半径 
                >
                  <div className="h-4 w-4 rounded-full bg-white border-2 border-[#8B5CF6]" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
