import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
 
 type Props = {
   audioRef: React.RefObject<HTMLAudioElement>;
 };
 
 export default function ProgressBar({ audioRef }: Props) {
   const railRef = useRef<HTMLDivElement>(null);
 
   const [duration, setDuration] = useState(0);
   const [current, setCurrent] = useState(0);
   const [bufferEnd, setBufferEnd] = useState(0);
 
   const [dragging, setDragging] = useState(false);
   const [dragPct, setDragPct] = useState<number | null>(null);
 
   // --- helpers ---
   const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
 
   const pctToTime = useCallback(
     (pct: number) => clamp01(pct / 100) * (duration || 0),
     [duration]
   );
 
   const timeToPct = useCallback(
     (t: number) => (duration ? clamp01(t / duration) * 100 : 0),
     [duration]
   );
 
   const playedPct = useMemo(
     () => (dragging && dragPct !== null ? dragPct : timeToPct(current)),
     [dragging, dragPct, current, timeToPct]
   );
 
   const bufferedPct = useMemo(
     () => (duration ? clamp01(bufferEnd / duration) * 100 : 0),
     [bufferEnd, duration]
   );
 
   // --- wire audio events: time/buffer/duration ---
   useEffect(() => {
     const a = audioRef.current;
     if (!a) return;
 
     const syncTime = () => setCurrent(a.currentTime || 0);
     const syncDur = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
     const syncBuf = () => {
       try {
         const b = a.buffered;
         let end = 0;
         for (let i = 0; i < b.length; i++) end = Math.max(end, b.end(i));
         setBufferEnd(Math.min(end, Number.isFinite(a.duration) ? a.duration : end));
       } catch {
         // no-op
       }
     };
 
     a.addEventListener("timeupdate", syncTime);
     a.addEventListener("loadedmetadata", syncDur);
     a.addEventListener("durationchange", syncDur);
     a.addEventListener("progress", syncBuf);
 
     // initial
     syncDur(); syncTime(); syncBuf();
 
     return () => {
       a.removeEventListener("timeupdate", syncTime);
       a.removeEventListener("loadedmetadata", syncDur);
       a.removeEventListener("durationchange", syncDur);
       a.removeEventListener("progress", syncBuf);
     };
   }, [audioRef]);
 
   // --- pointer drag ---
   const positionToPct = (clientX: number) => {
     const rail = railRef.current;
     if (!rail) return 0;
     const rect = rail.getBoundingClientRect();
     return clamp01((clientX - rect.left) / rect.width) * 100;
   };
 
   const onPointerDown = (e: React.PointerEvent) => {
     const rail = railRef.current;
     if (!rail) return;
     rail.setPointerCapture?.(e.pointerId);
     setDragging(true);
     setDragPct(positionToPct(e.clientX));
   };
 
   const onPointerMove = (e: React.PointerEvent) => {
     if (!dragging) return;
     setDragPct(positionToPct(e.clientX));
   };
 
   const commitSeek = (pct: number) => {
     const a = audioRef.current;
     if (!a) return;
     a.currentTime = pctToTime(pct);
   };
 
   const onPointerUp = (e: React.PointerEvent) => {
     const rail = railRef.current;
     if (rail) rail.releasePointerCapture?.(e.pointerId);
     if (dragPct !== null) commitSeek(dragPct);
     setDragging(false);
     setDragPct(null);
   };
 
   // --- keyboard (可聚焦/无障碍) ---
   const onKeyDown = (e: React.KeyboardEvent) => {
     const a = audioRef.current;
     if (!a) return;
     const step = 5; // 5 秒步进
     if (e.key === "ArrowRight") { e.preventDefault(); a.currentTime = Math.min(duration, a.currentTime + step); }
     if (e.key === "ArrowLeft")  { e.preventDefault(); a.currentTime = Math.max(0,         a.currentTime - step); }
     if (e.key === "Home")       { e.preventDefault(); a.currentTime = 0; }
     if (e.key === "End")        { e.preventDefault(); if (duration) a.currentTime = duration; }
   };
 
   // 动画：拖拽时禁用过渡，松开再开
   const trans = dragging ? "transition-none" : "transition-[width,left] duration-75";

   // 进度百分比转换为0-1范围
   const progress = playedPct / 100;

   return (
     <div
       ref={railRef}
       className=" 
         relative h-5 w-full rounded-full 
         bg-[#0F0F12] shadow-inner 
         px-3  /* 两侧内边距让圆点不溢出 */ 
       "
       onPointerDown={onPointerDown}
       onPointerMove={onPointerMove}
       onPointerUp={onPointerUp}
       tabIndex={0}
       role="slider"
       aria-label="Seek"
       aria-valuemin={0}
       aria-valuemax={Math.floor(duration || 0)}
       aria-valuenow={Math.floor(dragging && dragPct !== null ? pctToTime(dragPct) : current)}
       onKeyDown={onKeyDown}
     >
       {/* 缓冲条 */}
       <div
         className={`pointer-events-none absolute left-3 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-white/20 ${trans}`}
         style={{ width: `${bufferedPct}%` }}
       />
       {/* 已播放 */}
       <div
         className=" 
           absolute left-3 top-1/2 -translate-y-1/2 
           h-[6px] rounded-full 
           bg-gradient-to-r from-[#C4B5FD] to-[#7C3AED] 
         "
         style={{ width: `${playedPct}%` }}
       />
       {/* 可拖拽滑块 */}
       <div
         className=" 
           absolute top-1/2 -translate-y-1/2 
           h-5 w-5 rounded-full 
           bg-white border-2 border-[#7C3AED] 
           shadow-[0_0_0_8px_rgba(139,92,246,.15)] 
           transition-transform 
         "
         style={{ left: `calc(${playedPct}% + 3px)` }}
       >
         {/* 放大 28px 的透明热区，提升拖拽命中率 */}
         <span className="absolute -inset-3 cursor-pointer" aria-hidden />
       </div>
     </div>
   );
 }