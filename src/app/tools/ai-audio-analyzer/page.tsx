import React from 'react';
import Link from 'next/link';

export default function AIAudioAnalyzerPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* 面包屑导航 */}
        <div className="flex items-center text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white transition">首页</Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-white transition">在线音乐工具</Link>
          <span className="mx-2">/</span>
          <span className="text-white">AI音频分析工具</span>
        </div>
        
        {/* 居中卡片 */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-800">
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              AI音频分析工具
            </h1>
            
            <p className="text-gray-300 mb-10 max-w-2xl">
              使用我们先进的AI技术分析您的音频文件，获取专业级别的音频特征分析、调性识别、速度检测等功能。
              分析结果将帮助您更好地了解和处理您的音乐作品。
            </p>
            
            {/* 上传按钮 */}
            <button 
              className="w-full max-w-md py-6 px-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              上传音频文件
            </button>
            
            {/* 支持格式说明 */}
            <p className="mt-4 text-sm text-gray-400">
              支持MP3, WAV, FLAC格式，文件大小不超过50MB
            </p>
          </div>
        </div>
        
        {/* 功能说明 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">音频特征分析</h3>
            <p className="text-gray-300 text-sm">提取音频的频谱特征、能量分布和动态范围等关键参数。</p>
          </div>
          
          <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">调性识别</h3>
            <p className="text-gray-300 text-sm">精确识别音频的主调性和调性变化，支持各种音乐风格。</p>
          </div>
          
          <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold mb-3 text-pink-400">速度检测</h3>
            <p className="text-gray-300 text-sm">检测音频的BPM值（每分钟节拍数），帮助音乐制作和混音。</p>
          </div>
        </div>
      </div>
    </div>
  );
}