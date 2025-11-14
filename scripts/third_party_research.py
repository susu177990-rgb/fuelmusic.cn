#!/usr/bin/env python3
"""
第三方EBU R128实现测试脚本
"""

import pyebur128
import numpy as np
import json
import sys
import os
from typing import Dict, Any, List

def test_pyebur128(file_path: str) -> Dict[str, Any]:
    """
    测试pyebur128库
    """
    results = {}
    
    try:
        # 测试pyebur128
        meter = pyebur128.Meter(44100, pyebur128.CHANNEL_LAYOUT_STEREO)
        
        # 读取音频文件
        with open(file_path, 'rb') as f:
            audio_data = f.read()
        
        # 分析音频
        meter.add_frames(audio_data)
        
        # 获取结果
        integrated_loudness = meter.get_loudness()
        loudness_range = meter.get_loudness_range()
        
        results['pyebur128'] = {
            'integrated_loudness': float(integrated_loudness),
            'loudness_range': float(loudness_range),
            'status': 'success'
        }
        
    except Exception as e:
        results['pyebur128'] = {
            'status': 'failed',
            'error': str(e)
        }
    
    return results

def test_librosa_loudness(file_path: str) -> Dict[str, Any]:
    """
    测试librosa的响度计算
    """
    results = {}
    
    try:
        import librosa
        
        # 加载音频
        audio, sr = librosa.load(file_path, sr=44100)
        
        # 计算RMS
        rms = librosa.feature.rms(y=audio, frame_length=2048, hop_length=512)[0]
        
        # 转换为dB
        rms_db = librosa.amplitude_to_db(rms)
        
        # 计算统计信息
        mean_rms = np.mean(rms_db)
        std_rms = np.std(rms_db)
        min_rms = np.min(rms_db)
        max_rms = np.max(rms_db)
        
        results['librosa_rms'] = {
            'mean': float(mean_rms),
            'std': float(std_rms),
            'min': float(min_rms),
            'max': float(max_rms),
            'range': float(max_rms - min_rms),
            'status': 'success'
        }
        
    except ImportError:
        results['librosa_rms'] = {
            'status': 'failed',
            'error': 'librosa not installed'
        }
    except Exception as e:
        results['librosa_rms'] = {
            'status': 'failed',
            'error': str(e)
        }
    
    return results

def test_custom_rms_loudness(file_path: str) -> Dict[str, Any]:
    """
    测试自定义RMS响度计算
    """
    results = {}
    
    try:
        import librosa
        
        # 加载音频
        audio, sr = librosa.load(file_path, sr=44100)
        
        # 预加重滤波器
        pre_emphasis = 0.97
        emphasized_audio = np.append(audio[0], audio[1:] - pre_emphasis * audio[:-1])
        
        # K-weighting滤波器 (简化版)
        # 这里使用一个简化的高通滤波器
        from scipy import signal
        nyquist = sr / 2
        high_cutoff = 1000 / nyquist  # 1kHz高通
        b, a = signal.butter(2, high_cutoff, btype='high')
        k_weighted = signal.lfilter(b, a, emphasized_audio)
        
        # 计算RMS
        window_size = int(0.4 * sr)  # 400ms窗口
        hop_size = int(0.1 * sr)     # 100ms步长
        
        momentary_loudness = []
        for i in range(0, len(k_weighted) - window_size, hop_size):
            window = k_weighted[i:i + window_size]
            rms = np.sqrt(np.mean(window**2))
            if rms > 0:
                momentary_loudness.append(20 * np.log10(rms))
            else:
                momentary_loudness.append(-70)
        
        # 计算短期响度（3秒窗口）
        short_term_window = int(3.0 * sr / hop_size)
        short_term_loudness = []
        
        for i in range(0, len(momentary_loudness) - short_term_window):
            window = momentary_loudness[i:i + short_term_window]
            short_term_loudness.append(np.mean(window))
        
        # 计算集成响度
        integrated_loudness = np.mean(short_term_loudness)
        
        # 计算响度范围
        p10 = np.percentile(short_term_loudness, 10)
        p95 = np.percentile(short_term_loudness, 95)
        loudness_range = p95 - p10
        
        results['custom_rms'] = {
            'integrated_loudness': float(integrated_loudness),
            'loudness_range': float(loudness_range),
            'momentary_samples': len(momentary_loudness),
            'short_term_samples': len(short_term_loudness),
            'momentary_range': float(max(momentary_loudness) - min(momentary_loudness)),
            'status': 'success'
        }
        
    except ImportError as e:
        results['custom_rms'] = {
            'status': 'failed',
            'error': f'Missing dependency: {str(e)}'
        }
    except Exception as e:
        results['custom_rms'] = {
            'status': 'failed',
            'error': str(e)
        }
    
    return results

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 third_party_research.py <audio_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)
    
    print(f"Testing third-party implementations on: {file_path}")
    print("=" * 60)
    
    # 测试各种实现
    all_results = {}
    
    # 测试pyebur128
    print("Testing pyebur128...")
    pyebur128_results = test_pyebur128(file_path)
    all_results.update(pyebur128_results)
    
    # 测试librosa
    print("Testing librosa...")
    librosa_results = test_librosa_loudness(file_path)
    all_results.update(librosa_results)
    
    # 测试自定义RMS
    print("Testing custom RMS...")
    custom_results = test_custom_rms_loudness(file_path)
    all_results.update(custom_results)
    
    # 输出结果
    print("\nThird-party Implementation Results:")
    print("=" * 60)
    
    for implementation, data in all_results.items():
        print(f"\n{implementation}:")
        if data.get('status') == 'success':
            print(f"  Status: ✅ Success")
            for key, value in data.items():
                if key != 'status':
                    print(f"  {key}: {value}")
        else:
            print(f"  Status: ❌ Failed - {data.get('error', 'Unknown error')}")
    
    # 保存结果
    output_file = f"third_party_research_{os.path.basename(file_path)}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'file': file_path,
            'results': all_results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: {output_file}")

if __name__ == '__main__':
    main()
