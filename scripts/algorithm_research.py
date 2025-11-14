#!/usr/bin/env python3
"""
算法调研脚本 - 测试Essentia的各种响度算法
"""

import essentia
import essentia.standard as es
import numpy as np
import json
import sys
import os
from typing import Dict, Any, List, Tuple

def test_essentia_algorithms(audio: np.ndarray, sample_rate: int) -> Dict[str, Any]:
    """
    测试Essentia的各种响度算法
    """
    results = {}
    
    try:
        # 1. LoudnessEBUR128 (当前使用)
        try:
            loudness_ebur128 = es.LoudnessEBUR128(sampleRate=sample_rate)
            stereo_audio = np.array([audio, audio]).T
            momentary, short_term, integrated, lra = loudness_ebur128(stereo_audio)
            
            results['LoudnessEBUR128'] = {
                'momentary': [float(x) for x in momentary[:10]],  # 前10个值
                'short_term': [float(x) for x in short_term[:10]],
                'integrated': float(integrated),
                'lra': float(lra),
                'status': 'success'
            }
        except Exception as e:
            results['LoudnessEBUR128'] = {'status': 'failed', 'error': str(e)}
        
        # 2. RMS算法
        try:
            rms = es.RMS()
            rms_values = []
            
            # 分段计算RMS
            window_size = int(0.4 * sample_rate)  # 400ms窗口
            hop_size = int(0.1 * sample_rate)     # 100ms步长
            
            for i in range(0, len(audio) - window_size, hop_size):
                window = audio[i:i + window_size]
                rms_val = rms(window)
                rms_values.append(float(rms_val))
            
            # 计算平均RMS
            avg_rms = np.mean(rms_values)
            
            results['RMS'] = {
                'values': rms_values[:10],
                'average': float(avg_rms),
                'status': 'success'
            }
        except Exception as e:
            results['RMS'] = {'status': 'failed', 'error': str(e)}
        
        # 3. Loudness算法
        try:
            loudness = es.Loudness()
            loudness_values = []
            
            # 分段计算Loudness
            window_size = int(0.4 * sample_rate)
            hop_size = int(0.1 * sample_rate)
            
            for i in range(0, len(audio) - window_size, hop_size):
                window = audio[i:i + window_size]
                loudness_val = loudness(window)
                loudness_values.append(float(loudness_val))
            
            avg_loudness = np.mean(loudness_values)
            
            results['Loudness'] = {
                'values': loudness_values[:10],
                'average': float(avg_loudness),
                'status': 'success'
            }
        except Exception as e:
            results['Loudness'] = {'status': 'failed', 'error': str(e)}
        
        # 4. Energy算法
        try:
            energy = es.Energy()
            energy_values = []
            
            window_size = int(0.4 * sample_rate)
            hop_size = int(0.1 * sample_rate)
            
            for i in range(0, len(audio) - window_size, hop_size):
                window = audio[i:i + window_size]
                energy_val = energy(window)
                energy_values.append(float(energy_val))
            
            avg_energy = np.mean(energy_values)
            
            results['Energy'] = {
                'values': energy_values[:10],
                'average': float(avg_energy),
                'status': 'success'
            }
        except Exception as e:
            results['Energy'] = {'status': 'failed', 'error': str(e)}
        
        # 5. SpectralCentroid算法
        try:
            spectral_centroid = es.SpectralCentroid()
            centroid_values = []
            
            window_size = int(0.4 * sample_rate)
            hop_size = int(0.1 * sample_rate)
            
            for i in range(0, len(audio) - window_size, hop_size):
                window = audio[i:i + window_size]
                centroid_val = spectral_centroid(window)
                centroid_values.append(float(centroid_val))
            
            avg_centroid = np.mean(centroid_values)
            
            results['SpectralCentroid'] = {
                'values': centroid_values[:10],
                'average': float(avg_centroid),
                'status': 'success'
            }
        except Exception as e:
            results['SpectralCentroid'] = {'status': 'failed', 'error': str(e)}
        
        # 6. SpectralRolloff算法
        try:
            spectral_rolloff = es.SpectralRolloff()
            rolloff_values = []
            
            window_size = int(0.4 * sample_rate)
            hop_size = int(0.1 * sample_rate)
            
            for i in range(0, len(audio) - window_size, hop_size):
                window = audio[i:i + window_size]
                rolloff_val = spectral_rolloff(window)
                rolloff_values.append(float(rolloff_val))
            
            avg_rolloff = np.mean(rolloff_values)
            
            results['SpectralRolloff'] = {
                'values': rolloff_values[:10],
                'average': float(avg_rolloff),
                'status': 'success'
            }
        except Exception as e:
            results['SpectralRolloff'] = {'status': 'failed', 'error': str(e)}
        
        return results
        
    except Exception as e:
        return {'error': str(e)}

def analyze_algorithm_quality(results: Dict[str, Any]) -> Dict[str, Any]:
    """
    分析算法质量
    """
    analysis = {}
    
    for algorithm, data in results.items():
        if data.get('status') == 'success':
            # 检查数据范围是否合理
            if 'values' in data:
                values = data['values']
                min_val = min(values)
                max_val = max(values)
                range_val = max_val - min_val
                
                # 判断数据质量
                quality_score = 0
                
                # 检查是否在合理范围内
                if -20 <= min_val <= -5 and -20 <= max_val <= -5:
                    quality_score += 3
                elif -30 <= min_val <= 0 and -30 <= max_val <= 0:
                    quality_score += 2
                else:
                    quality_score += 1
                
                # 检查变化范围
                if 0.1 <= range_val <= 5.0:
                    quality_score += 2
                elif 0.05 <= range_val <= 10.0:
                    quality_score += 1
                
                # 检查异常值
                outliers = sum(1 for v in values if v < -50 or v > 10)
                if outliers == 0:
                    quality_score += 2
                elif outliers <= len(values) * 0.1:
                    quality_score += 1
                
                analysis[algorithm] = {
                    'quality_score': quality_score,
                    'range': range_val,
                    'min': min_val,
                    'max': max_val,
                    'outliers': outliers,
                    'recommendation': 'excellent' if quality_score >= 6 else 'good' if quality_score >= 4 else 'poor'
                }
    
    return analysis

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 algorithm_research.py <audio_file>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)
    
    try:
        # 加载音频文件
        loader = es.MonoLoader(filename=file_path, sampleRate=44100)
        audio = loader()
        
        print(f"Testing algorithms on: {file_path}")
        print(f"Audio length: {len(audio)} samples ({len(audio)/44100:.2f} seconds)")
        print("=" * 60)
        
        # 测试算法
        results = test_essentia_algorithms(audio, 44100)
        
        # 分析质量
        analysis = analyze_algorithm_quality(results)
        
        # 输出结果
        print("Algorithm Test Results:")
        print("=" * 60)
        
        for algorithm, data in results.items():
            print(f"\n{algorithm}:")
            if data.get('status') == 'success':
                print(f"  Status: ✅ Success")
                if 'integrated' in data:
                    print(f"  Integrated: {data['integrated']:.3f}")
                if 'average' in data:
                    print(f"  Average: {data['average']:.3f}")
                if 'values' in data:
                    print(f"  Sample values: {data['values'][:5]}")
                
                if algorithm in analysis:
                    quality = analysis[algorithm]
                    print(f"  Quality Score: {quality['quality_score']}/7")
                    print(f"  Range: {quality['range']:.3f}")
                    print(f"  Recommendation: {quality['recommendation']}")
            else:
                print(f"  Status: ❌ Failed - {data.get('error', 'Unknown error')}")
        
        # 推荐最佳算法
        print("\n" + "=" * 60)
        print("RECOMMENDATIONS:")
        print("=" * 60)
        
        best_algorithms = sorted(
            [(alg, analysis[alg]) for alg in analysis.keys()],
            key=lambda x: x[1]['quality_score'],
            reverse=True
        )
        
        for i, (algorithm, quality) in enumerate(best_algorithms[:3]):
            print(f"{i+1}. {algorithm} (Score: {quality['quality_score']}/7)")
            print(f"   Range: {quality['range']:.3f}, Recommendation: {quality['recommendation']}")
        
        # 保存详细结果
        output_file = f"algorithm_research_{os.path.basename(file_path)}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'file': file_path,
                'results': results,
                'analysis': analysis,
                'recommendations': best_algorithms[:3]
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\nDetailed results saved to: {output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
