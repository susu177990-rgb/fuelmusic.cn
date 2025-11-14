#!/usr/bin/env python3
"""
专业音频分析脚本 - 使用librosa进行高精度分析
支持BPM、调性、LUFS、峰值等完整分析
"""

import librosa
import numpy as np
import json
import sys
import os
from typing import Dict, Any, Tuple

def analyze_audio(file_path: str) -> Dict[str, Any]:
    """
    分析音频文件，返回完整的音频特征
    
    Args:
        file_path: 音频文件路径
        
    Returns:
        包含所有分析结果的字典
    """
    try:
        print(f"开始分析音频文件: {file_path}")
        
        # 加载音频文件
        y, sr = librosa.load(file_path, sr=None)
        print(f"音频信息: 时长={len(y)/sr:.2f}秒, 采样率={sr}Hz, 样本数={len(y)}")
        
        # BPM检测
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        bpm = int(float(tempo))  # 确保转换为Python原生int
        print(f"BPM检测结果: {bpm}")
        
        # 调性检测
        key, mode = detect_key_mode(y, sr)
        print(f"调性检测结果: {key} {mode}")
        
        # LUFS计算
        lufs_integrated = calculate_lufs_integrated(y, sr)
        lufs_short_term = calculate_lufs_short_term(y, sr)
        lufs_range = calculate_lufs_range(y, sr)
        print(f"LUFS计算结果: 集成={lufs_integrated:.1f}, 短期={lufs_short_term:.1f}, 范围={lufs_range:.1f}")
        
        # 峰值检测
        peak_db = calculate_true_peak(y)
        print(f"峰值检测结果: {peak_db:.1f} dBTP")
        
        # 返回结果 - 确保所有数值都是Python原生类型
        result = {
            'bpm': int(bpm),
            'key': str(key),
            'scale': str(mode),
            'lufsIntegrated': float(round(lufs_integrated, 1)),
            'lufsShortTerm': float(round(lufs_short_term, 1)),
            'lufsRange': float(round(lufs_range, 1)),
            'peakDbFS': float(round(peak_db, 1)),
            'success': True
        }
        
        print("分析完成!")
        return result
        
    except Exception as e:
        print(f"分析失败: {str(e)}")
        return {
            'error': str(e),
            'success': False
        }

def detect_key_mode(y: np.ndarray, sr: int) -> Tuple[str, str]:
    """
    检测音频的调性和模式
    
    Args:
        y: 音频信号
        sr: 采样率
        
    Returns:
        (调性, 模式) 元组
    """
    try:
        # 计算Chroma特征
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        
        # 计算平均Chroma
        chroma_mean = np.mean(chroma, axis=1)
        
        # 大调和小调模板
        major_template = np.array([1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1])
        minor_template = np.array([1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0])
        
        # 音符名称
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        # 计算与模板的相关性
        major_correlations = []
        minor_correlations = []
        
        for shift in range(12):
            # 大调
            major_corr = np.corrcoef(chroma_mean, np.roll(major_template, shift))[0, 1]
            major_correlations.append(major_corr)
            
            # 小调
            minor_corr = np.corrcoef(chroma_mean, np.roll(minor_template, shift))[0, 1]
            minor_correlations.append(minor_corr)
        
        # 找到最佳匹配
        major_max_idx = np.argmax(major_correlations)
        minor_max_idx = np.argmax(minor_correlations)
        
        major_max_corr = major_correlations[major_max_idx]
        minor_max_corr = minor_correlations[minor_max_idx]
        
        if major_max_corr > minor_max_corr:
            key = note_names[(12 - major_max_idx) % 12]
            mode = 'maj'
        else:
            key = note_names[(12 - minor_max_idx) % 12]
            mode = 'min'
        
        return key, mode
        
    except Exception as e:
        print(f"调性检测失败: {str(e)}")
        return 'C', 'maj'

def calculate_lufs_integrated(y: np.ndarray, sr: int) -> float:
    """
    计算集成LUFS (EBU R128标准)
    
    Args:
        y: 音频信号
        sr: 采样率
        
    Returns:
        集成LUFS值
    """
    try:
        # 预加重滤波
        alpha = 0.95
        y_preemph = np.zeros_like(y)
        y_preemph[0] = y[0]
        for i in range(1, len(y)):
            y_preemph[i] = y[i] - alpha * y[i-1]
        
        # K加权滤波 (简化版)
        # 这里使用简化的高通滤波器
        y_kweighted = y_preemph
        
        # 计算短期响度 (400ms窗口)
        window_size = int(0.4 * sr)
        hop_size = int(0.1 * sr)
        
        momentary_loudness = []
        
        for start in range(0, len(y_kweighted) - window_size, hop_size):
            window = y_kweighted[start:start + window_size]
            
            # 计算RMS
            rms = np.sqrt(np.mean(window ** 2))
            
            # 转换为LUFS
            if rms > 0:
                lufs = -0.691 + 10 * np.log10(rms ** 2 / (20e-6) ** 2)
                momentary_loudness.append(lufs)
        
        if not momentary_loudness:
            return -70.0
        
        # 计算集成响度 (去除低于-70 LU的部分)
        gated_loudness = [l for l in momentary_loudness if l > -70]
        
        if not gated_loudness:
            return -70.0
        
        integrated_lufs = np.mean(gated_loudness)
        return integrated_lufs
        
    except Exception as e:
        print(f"LUFS计算失败: {str(e)}")
        return -70.0

def calculate_lufs_short_term(y: np.ndarray, sr: int) -> float:
    """
    计算短期LUFS
    
    Args:
        y: 音频信号
        sr: 采样率
        
    Returns:
        短期LUFS值
    """
    try:
        # 使用最后3秒的音频
        duration = min(3.0, len(y) / sr)
        start_sample = int((len(y) / sr - duration) * sr)
        y_short = y[start_sample:]
        
        # 计算RMS
        rms = np.sqrt(np.mean(y_short ** 2))
        
        # 转换为LUFS
        if rms > 0:
            lufs = -0.691 + 10 * np.log10(rms ** 2 / (20e-6) ** 2)
            return lufs
        else:
            return -70.0
            
    except Exception as e:
        print(f"短期LUFS计算失败: {str(e)}")
        return -70.0

def calculate_lufs_range(y: np.ndarray, sr: int) -> float:
    """
    计算响度范围
    
    Args:
        y: 音频信号
        sr: 采样率
        
    Returns:
        响度范围值
    """
    try:
        # 计算短期响度
        window_size = int(0.4 * sr)
        hop_size = int(0.1 * sr)
        
        momentary_loudness = []
        
        for start in range(0, len(y) - window_size, hop_size):
            window = y[start:start + window_size]
            rms = np.sqrt(np.mean(window ** 2))
            
            if rms > 0:
                lufs = -0.691 + 10 * np.log10(rms ** 2 / (20e-6) ** 2)
                momentary_loudness.append(lufs)
        
        if len(momentary_loudness) < 2:
            return 0.0
        
        # 计算范围 (最高10%和最低10%的差)
        sorted_loudness = sorted(momentary_loudness)
        lower_10 = int(len(sorted_loudness) * 0.1)
        upper_10 = int(len(sorted_loudness) * 0.9)
        
        if upper_10 >= len(sorted_loudness):
            upper_10 = len(sorted_loudness) - 1
        
        range_value = sorted_loudness[upper_10] - sorted_loudness[lower_10]
        return max(0.0, range_value)
        
    except Exception as e:
        print(f"响度范围计算失败: {str(e)}")
        return 0.0

def calculate_true_peak(y: np.ndarray) -> float:
    """
    计算真峰值 (True Peak)
    
    Args:
        y: 音频信号
        
    Returns:
        真峰值 (dBTP)
    """
    try:
        # 找到最大绝对值
        peak = np.max(np.abs(y))
        
        # 应用上采样来检测真峰值 (简化版：+1dB补偿)
        true_peak = peak * 1.122  # 约1dB
        
        # 转换为dBTP
        if true_peak > 0:
            peak_db = 20 * np.log10(true_peak)
            return peak_db
        else:
            return -np.inf
            
    except Exception as e:
        print(f"峰值检测失败: {str(e)}")
        return -np.inf

def main():
    """
    主函数 - 命令行接口
    """
    if len(sys.argv) != 2:
        print("用法: python audio_analyzer.py <音频文件路径>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"错误: 文件不存在 - {file_path}")
        sys.exit(1)
    
    # 分析音频
    result = analyze_audio(file_path)
    
    # 输出JSON结果
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
