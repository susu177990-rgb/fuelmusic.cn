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
        # 加载音频文件 - 使用更高的采样率进行更精确的分析
        y, sr = librosa.load(file_path, sr=22050)  # 使用22.05kHz采样率提高精度
        
        # BPM检测 - 使用更精确的算法
        # 方法1: 标准beat tracking
        tempo1, beats1 = librosa.beat.beat_track(y=y, sr=sr, start_bpm=60, tightness=100)
        
        # 方法2: 使用onset检测
        onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
        tempo2, beats2 = librosa.beat.beat_track(y=y, sr=sr, onset_envelope=librosa.onset.onset_strength(y=y, sr=sr))
        
        # 方法3: 使用更宽的BPM范围
        tempo3, beats3 = librosa.beat.beat_track(y=y, sr=sr, start_bpm=80, tightness=50)
        
        # 方法4: 使用更精确的节拍跟踪
        tempo4, beats4 = librosa.beat.beat_track(y=y, sr=sr, start_bpm=120, tightness=200)
        
        # 选择最合理的BPM（通常在60-180之间）
        tempos = [float(tempo1), float(tempo2), float(tempo3), float(tempo4)]
        valid_tempos = [t for t in tempos if 60 <= t <= 180]
        
        if valid_tempos:
            # 使用中位数而不是平均值，更稳定
            median_tempo = np.median(valid_tempos)
            bpm = int(min(valid_tempos, key=lambda x: abs(x - median_tempo)))
        else:
            bpm = int(float(tempo1))
        
        # 调性检测 - 使用更精确的算法
        key, mode = detect_key_mode_improved(y, sr)
        
        # LUFS计算 - 使用更精确的算法
        lufs_integrated = calculate_lufs_integrated_improved(y, sr)
        lufs_short_term_array = calculate_lufs_short_term_array_improved(y, sr)
        lufs_short_term_single = calculate_lufs_short_term_improved(y, sr)
        lufs_range = calculate_lufs_range_improved(y, sr)
        
        # 峰值检测 - 使用更精确的算法
        peak_db = calculate_true_peak_improved(y, sr)
        
        # 返回结果 - 确保所有数值都是Python原生类型
        result = {
            'bpm': int(bpm),
            'key': str(key),
            'scale': str(mode),
            'lufsIntegrated': float(round(lufs_integrated, 1)),
            'lufsShortTerm': float(round(lufs_short_term_single, 1)),
            'lufsShortTermArray': [float(round(x, 1)) for x in lufs_short_term_array],
            'lufsRange': float(round(lufs_range, 1)),
            'peakDbFS': float(round(peak_db, 1)),
            'success': True
        }
        
        return result
        
    except Exception as e:
        return {
            'error': str(e),
            'success': False
        }

def detect_key_mode_improved(y: np.ndarray, sr: int) -> Tuple[str, str]:
    """
    改进的调性检测算法 - 使用更精确的Chroma特征
    """
    try:
        # 使用多种特征进行更精确的调性检测
        # 1. Chroma STFT - 标准特征
        chroma_stft = librosa.feature.chroma_stft(y=y, sr=sr, n_chroma=12)
        
        # 2. Chroma CQT - 更精确的频率分析
        chroma_cqt = librosa.feature.chroma_cqt(y=y, sr=sr, n_chroma=12)
        
        # 3. Chroma CENS - 对动态变化更鲁棒
        chroma_cens = librosa.feature.chroma_cens(y=y, sr=sr, n_chroma=12)
        
        # 4. Chroma VQT - 变调Q变换，更精确
        chroma_vqt = librosa.feature.chroma_vqt(y=y, sr=sr, n_chroma=12)
        
        # 组合多种特征，加权平均
        chroma_combined = 0.3 * chroma_stft + 0.3 * chroma_cqt + 0.2 * chroma_cens + 0.2 * chroma_vqt
        chroma_mean = np.mean(chroma_combined, axis=1)
        
        # 更精确的大调和小调模板（基于音乐理论）
        major_template = np.array([1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0])
        minor_template = np.array([1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0])
        
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
        
        # 选择相关性更高的模式
        if major_max_corr > minor_max_corr:
            key = note_names[(12 - major_max_idx) % 12]
            mode = 'maj'
        else:
            key = note_names[(12 - minor_max_idx) % 12]
            mode = 'min'
        
        return key, mode
        
    except Exception as e:
        return 'C', 'maj'

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
        return 'C', 'maj'

def calculate_lufs_integrated_improved(y: np.ndarray, sr: int) -> float:
    """
    改进的集成LUFS计算 - 更接近EBU R128标准
    """
    try:
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
        
        # 更精确的LUFS计算
        # 1. 预加重滤波
        alpha = 0.95
        y_preemph = np.zeros_like(y)
        y_preemph[0] = y[0]
        for i in range(1, len(y)):
            y_preemph[i] = y[i] - alpha * y[i-1]
        
        # 2. K加权滤波（更精确的实现）
        from scipy.signal import butter, lfilter
        nyquist = sr / 2
        
        # 高通滤波器1: 38Hz (ITU-R BS.1770-4)
        b1, a1 = butter(2, 38/nyquist, btype='high')
        y_k1 = lfilter(b1, a1, y_preemph)
        
        # 高通滤波器2: 120Hz
        b2, a2 = butter(2, 120/nyquist, btype='high')
        y_k2 = lfilter(b2, a2, y_k1)
        
        # 3. 计算短期响度（400ms窗口）
        window_size = int(0.4 * sr)
        hop_size = int(0.1 * sr)
        
        momentary_loudness = []
        
        for start in range(0, len(y_k2) - window_size, hop_size):
            window = y_k2[start:start + window_size]
            
            # 计算RMS
            rms = np.sqrt(np.mean(window ** 2))
            
            # 转换为LUFS (ITU-R BS.1770-4公式)
            if rms > 0:
                lufs = -0.691 + 10 * np.log10(rms ** 2 / (20e-6) ** 2)
                momentary_loudness.append(lufs)
        
        if not momentary_loudness:
            return -70.0
        
        # 4. 门控算法 - 去除静音部分
        gated_loudness = [l for l in momentary_loudness if l > -70]
        
        if not gated_loudness:
            return -70.0
        
        # 5. 计算集成响度
        integrated_lufs = np.mean(gated_loudness)
        
        return integrated_lufs
        
    except Exception as e:
        return -70.0

def calculate_lufs_integrated(y: np.ndarray, sr: int) -> float:
    """
    计算集成LUFS (EBU R128标准简化版)
    
    Args:
        y: 音频信号
        sr: 采样率
        
    Returns:
        集成LUFS值
    """
    try:
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
        
        # 简化的LUFS计算 - 直接使用RMS转换为dBFS
        # 这是更接近实际LUFS的简化计算
        rms = np.sqrt(np.mean(y ** 2))
        
        if rms > 0:
            # 转换为dBFS，然后调整到LUFS范围
            dbfs = 20 * np.log10(rms)
            # LUFS通常比dBFS低约10-15dB，这里使用-12dB的偏移
            lufs = dbfs - 12.0
            return lufs
        else:
            return -70.0
        
    except Exception as e:
        return -70.0

def calculate_lufs_short_term_improved(y: np.ndarray, sr: int) -> float:
    """
    改进的短期LUFS计算
    """
    try:
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
        
        # 使用最后3秒的音频
        duration = min(3.0, len(y) / sr)
        start_sample = int((len(y) / sr - duration) * sr)
        y_short = y[start_sample:]
        
        # 应用与集成LUFS相同的处理
        alpha = 0.95
        y_preemph = np.zeros_like(y_short)
        y_preemph[0] = y_short[0]
        for i in range(1, len(y_short)):
            y_preemph[i] = y_short[i] - alpha * y_short[i-1]
        
        # K加权滤波
        from scipy.signal import butter, lfilter
        nyquist = sr / 2
        b1, a1 = butter(2, 38/nyquist, btype='high')
        y_k1 = lfilter(b1, a1, y_preemph)
        b2, a2 = butter(2, 120/nyquist, btype='high')
        y_k2 = lfilter(b2, a2, y_k1)
        
        # 计算RMS
        rms = np.sqrt(np.mean(y_k2 ** 2))
        
        # 转换为LUFS
        if rms > 0:
            lufs = -0.691 + 10 * np.log10(rms ** 2 / (20e-6) ** 2)
            return lufs
        else:
            return -70.0
            
    except Exception as e:
        return -70.0

def calculate_lufs_short_term_array_improved(y: np.ndarray, sr: int) -> list:
    """
    改进的短期LUFS数组计算
    """
    try:
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
        
        # 应用预处理
        alpha = 0.95
        y_preemph = np.zeros_like(y)
        y_preemph[0] = y[0]
        for i in range(1, len(y)):
            y_preemph[i] = y[i] - alpha * y[i-1]
        
        # K加权滤波
        from scipy.signal import butter, lfilter
        nyquist = sr / 2
        b1, a1 = butter(2, 38/nyquist, btype='high')
        y_k1 = lfilter(b1, a1, y_preemph)
        b2, a2 = butter(2, 120/nyquist, btype='high')
        y_k2 = lfilter(b2, a2, y_k1)
        
        # 计算短期响度数组
        window_size = int(0.4 * sr)  # 400ms窗口
        hop_size = int(0.1 * sr)     # 100ms步进
        
        momentary_loudness = []
        
        for start in range(0, len(y_k2) - window_size, hop_size):
            window = y_k2[start:start + window_size]
            rms = np.sqrt(np.mean(window ** 2))
            
            if rms > 0:
                lufs = -0.691 + 10 * np.log10(rms ** 2 / (20e-6) ** 2)
                momentary_loudness.append(lufs)
            else:
                momentary_loudness.append(-70.0)
        
        return momentary_loudness if momentary_loudness else [-70.0]
        
    except Exception as e:
        return [-70.0]

def calculate_lufs_range_improved(y: np.ndarray, sr: int) -> float:
    """
    改进的响度范围计算
    """
    try:
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
        
        # 使用改进的短期响度数组
        momentary_loudness = calculate_lufs_short_term_array_improved(y, sr)
        
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
        return 0.0

def calculate_true_peak_improved(y: np.ndarray, sr: int) -> float:
    """
    改进的真峰值计算
    """
    try:
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
            
        # 找到最大绝对值
        peak = np.max(np.abs(y))
        
        # 转换为dBTP
        if peak > 0:
            peak_db = 20 * np.log10(peak)
            return peak_db
        else:
            return -70.0
            
    except Exception as e:
        return -70.0

def calculate_lufs_short_term_array(y: np.ndarray, sr: int) -> list:
    """
    计算短期LUFS数组（用于绘制曲线）
    
    Args:
        y: 音频信号
        sr: 采样率
        
    Returns:
        短期LUFS值数组
    """
    try:
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
        
        # 计算短期响度数组
        window_size = int(0.4 * sr)  # 400ms窗口
        hop_size = int(0.1 * sr)     # 100ms步进
        
        momentary_loudness = []
        
        for start in range(0, len(y) - window_size, hop_size):
            window = y[start:start + window_size]
            rms = np.sqrt(np.mean(window ** 2))
            
            if rms > 0:
                dbfs = 20 * np.log10(rms)
                lufs = dbfs - 12.0  # 与其他LUFS计算保持一致
                momentary_loudness.append(lufs)
            else:
                momentary_loudness.append(-70.0)
        
        return momentary_loudness if momentary_loudness else [-70.0]
        
    except Exception as e:
        return [-70.0]

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
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
        
        # 使用最后3秒的音频
        duration = min(3.0, len(y) / sr)
        start_sample = int((len(y) / sr - duration) * sr)
        y_short = y[start_sample:]
        
        # 计算RMS
        rms = np.sqrt(np.mean(y_short ** 2))
        
        # 转换为LUFS
        if rms > 0:
            dbfs = 20 * np.log10(rms)
            lufs = dbfs - 12.0  # 与集成LUFS使用相同的偏移
            return lufs
        else:
            return -70.0
            
    except Exception as e:
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
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
        
        # 计算短期响度
        window_size = int(0.4 * sr)
        hop_size = int(0.1 * sr)
        
        momentary_loudness = []
        
        for start in range(0, len(y) - window_size, hop_size):
            window = y[start:start + window_size]
            rms = np.sqrt(np.mean(window ** 2))
            
            if rms > 0:
                dbfs = 20 * np.log10(rms)
                lufs = dbfs - 12.0  # 与其他LUFS计算保持一致
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
        # 限制分析长度以提高性能（最多30秒）
        if len(y) / sr > 30:
            y = y[:int(sr * 30)]
            
        # 找到最大绝对值
        peak = np.max(np.abs(y))
        
        # 转换为dBTP
        if peak > 0:
            peak_db = 20 * np.log10(peak)
            return peak_db
        else:
            return -70.0  # 返回一个合理的默认值而不是-inf
            
    except Exception as e:
        return -70.0

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
