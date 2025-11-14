#!/usr/bin/env python3
"""
高级校准系统 - 基于音频特征动态调整参数
"""

import numpy as np
import librosa
from typing import Dict, Any, Tuple
from scipy import signal

class AdvancedCalibrationSystem:
    """
    高级校准系统
    基于音频特征动态调整校准参数
    """
    
    def __init__(self):
        # 基础校准参数
        self.base_integrated_offset = -2.863
        self.base_range_multiplier = 0.507
        self.base_peak_offset = 0.013
        
        # 动态调整参数
        self.dynamic_adjustments = {
            'loudness_level': {
                'low': (-8.0, -12.0),      # 低响度范围
                'medium': (-6.0, -8.0),    # 中等响度范围
                'high': (-3.0, -6.0)       # 高响度范围
            },
            'frequency_content': {
                'bass_heavy': 0.8,         # 低频重
                'balanced': 1.0,           # 平衡
                'treble_heavy': 1.2        # 高频重
            },
            'dynamic_range': {
                'low': 0.7,               # 低动态范围
                'medium': 1.0,            # 中等动态范围
                'high': 1.3               # 高动态范围
            }
        }
    
    def analyze_audio_characteristics(self, audio: np.ndarray, sample_rate: int) -> Dict[str, Any]:
        """
        分析音频特征
        """
        characteristics = {}
        
        # 1. 分析响度水平
        rms = np.sqrt(np.mean(audio**2))
        db_level = 20 * np.log10(rms) if rms > 0 else -70
        
        if db_level < -8.0:
            characteristics['loudness_level'] = 'low'
        elif db_level < -6.0:
            characteristics['loudness_level'] = 'medium'
        else:
            characteristics['loudness_level'] = 'high'
        
        # 2. 分析频率内容
        # 计算频谱质心
        spectral_centroid = librosa.feature.spectral_centroid(y=audio, sr=sample_rate)[0]
        avg_centroid = np.mean(spectral_centroid)
        
        # 计算低频能量比例
        stft = librosa.stft(audio)
        freqs = librosa.fft_frequencies(sr=sample_rate)
        low_freq_mask = freqs < 1000
        mid_freq_mask = (freqs >= 1000) & (freqs < 4000)
        high_freq_mask = freqs >= 4000
        
        low_energy = np.sum(np.abs(stft[low_freq_mask])**2)
        mid_energy = np.sum(np.abs(stft[mid_freq_mask])**2)
        high_energy = np.sum(np.abs(stft[high_freq_mask])**2)
        total_energy = low_energy + mid_energy + high_energy
        
        if total_energy > 0:
            low_ratio = low_energy / total_energy
            high_ratio = high_energy / total_energy
            
            if low_ratio > 0.4:
                characteristics['frequency_content'] = 'bass_heavy'
            elif high_ratio > 0.3:
                characteristics['frequency_content'] = 'treble_heavy'
            else:
                characteristics['frequency_content'] = 'balanced'
        else:
            characteristics['frequency_content'] = 'balanced'
        
        # 3. 分析动态范围
        # 计算RMS的变化范围
        window_size = int(0.1 * sample_rate)  # 100ms窗口
        hop_size = int(0.05 * sample_rate)    # 50ms步长
        
        rms_values = []
        for i in range(0, len(audio) - window_size, hop_size):
            window = audio[i:i + window_size]
            rms_val = np.sqrt(np.mean(window**2))
            if rms_val > 0:
                rms_values.append(20 * np.log10(rms_val))
        
        if len(rms_values) > 1:
            dynamic_range = np.max(rms_values) - np.min(rms_values)
            
            if dynamic_range < 10:
                characteristics['dynamic_range'] = 'low'
            elif dynamic_range < 20:
                characteristics['dynamic_range'] = 'medium'
            else:
                characteristics['dynamic_range'] = 'high'
        else:
            characteristics['dynamic_range'] = 'medium'
        
        return characteristics
    
    def calculate_dynamic_adjustments(self, characteristics: Dict[str, Any]) -> Dict[str, float]:
        """
        计算动态调整参数
        """
        adjustments = {
            'integrated_offset': self.base_integrated_offset,
            'range_multiplier': self.base_range_multiplier,
            'peak_offset': self.base_peak_offset
        }
        
        # 基于响度水平调整
        loudness_level = characteristics['loudness_level']
        if loudness_level == 'low':
            adjustments['integrated_offset'] += 1.0
        elif loudness_level == 'high':
            adjustments['integrated_offset'] -= 0.5
        
        # 基于频率内容调整
        frequency_content = characteristics['frequency_content']
        freq_multiplier = self.dynamic_adjustments['frequency_content'][frequency_content]
        adjustments['range_multiplier'] *= freq_multiplier
        
        # 基于动态范围调整
        dynamic_range = characteristics['dynamic_range']
        dynamic_multiplier = self.dynamic_adjustments['dynamic_range'][dynamic_range]
        adjustments['range_multiplier'] *= dynamic_multiplier
        
        return adjustments
    
    def apply_dynamic_calibration(self, audio: np.ndarray, sample_rate: int) -> Dict[str, float]:
        """
        应用动态校准
        """
        # 分析音频特征
        characteristics = self.analyze_audio_characteristics(audio, sample_rate)
        
        # 计算动态调整
        adjustments = self.calculate_dynamic_adjustments(characteristics)
        
        return adjustments

def test_dynamic_calibration():
    """
    测试动态校准系统
    """
    print("🔧 动态校准系统测试")
    print("=" * 60)
    
    calibration_system = AdvancedCalibrationSystem()
    
    # 测试文件列表
    test_files = [
        "public/demos/144BPM-C minor 集成响度 -7.6LUFS | 短期响度 -5.6LUFS | 真峰值 0.0dBTP | 响度范围 0.7LU.mp3",
        "public/demos/130 BPM Eb minor 集成响度 -8.6LUFS | 短期响度 -6.5LUFS | 真峰值 0.2dBTP | 响度范围 0.8LU.mp3",
        "public/demos/87 BPM F# major、集成响度-10.1LUFS、短期响度-8.2LUFS、真峰值0.2dBTP、响度范围0.7LU.mp3"
    ]
    
    for i, file_path in enumerate(test_files, 1):
        try:
            # 加载音频
            audio, sr = librosa.load(file_path, sr=44100)
            
            # 应用动态校准
            adjustments = calibration_system.apply_dynamic_calibration(audio, sr)
            
            print(f"📊 歌曲 {i}: {file_path.split('/')[-1]}")
            print(f"   集成响度偏移: {adjustments['integrated_offset']:.3f} LUFS")
            print(f"   响度范围倍数: {adjustments['range_multiplier']:.3f}")
            print(f"   真峰值偏移: {adjustments['peak_offset']:.3f} dBTP")
            print()
            
        except Exception as e:
            print(f"❌ 处理文件 {file_path} 时出错: {str(e)}")
            print()

if __name__ == '__main__':
    test_dynamic_calibration()
