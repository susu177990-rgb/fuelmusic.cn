#!/usr/bin/env python3
"""
精准度分析脚本 - 分析当前误差模式并优化参数
"""

import numpy as np
import json
import sys
import os
from typing import Dict, Any, List, Tuple
from scipy import signal
import librosa

class PrecisionAnalyzer:
    """
    精准度分析器
    分析当前误差模式并优化参数
    """
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.nyquist = sample_rate / 2
        
        # 测试数据
        self.test_cases = [
            {
                'file': '144BPM-C minor 集成响度 -7.6LUFS | 短期响度 -5.6LUFS | 真峰值 0.0dBTP | 响度范围 0.7LU.mp3',
                'target': {'integrated': -7.6, 'range': 0.7, 'peak': 0.0}
            },
            {
                'file': '130 BPM Eb minor 集成响度 -8.6LUFS | 短期响度 -6.5LUFS | 真峰值 0.2dBTP | 响度范围 0.8LU.mp3',
                'target': {'integrated': -8.6, 'range': 0.8, 'peak': 0.2}
            },
            {
                'file': '87 BPM F# major、集成响度-10.1LUFS、短期响度-8.2LUFS、真峰值0.2dBTP、响度范围0.7LU.mp3',
                'target': {'integrated': -10.1, 'range': 0.7, 'peak': 0.2}
            }
        ]
        
        # 当前检测结果
        self.current_results = [
            {'integrated': -6.19, 'range': 1.29, 'peak': 0.03},
            {'integrated': -6.46, 'range': 1.54, 'peak': -0.05},
            {'integrated': -5.06, 'range': 1.51, 'peak': 0.38}
        ]
    
    def analyze_error_patterns(self) -> Dict[str, Any]:
        """
        分析误差模式
        """
        integrated_errors = []
        range_errors = []
        peak_errors = []
        
        for i, (test_case, current_result) in enumerate(zip(self.test_cases, self.current_results)):
            target = test_case['target']
            
            # 计算误差
            integrated_error = current_result['integrated'] - target['integrated']
            range_error = current_result['range'] - target['range']
            peak_error = current_result['peak'] - target['peak']
            
            integrated_errors.append(integrated_error)
            range_errors.append(range_error)
            peak_errors.append(peak_error)
            
            print(f"歌曲 {i+1}: {test_case['file']}")
            print(f"  集成响度误差: {integrated_error:.2f} LUFS")
            print(f"  响度范围误差: {range_error:.2f} LU")
            print(f"  真峰值误差: {peak_error:.2f} dBTP")
            print()
        
        # 统计分析
        analysis = {
            'integrated': {
                'errors': integrated_errors,
                'mean_error': np.mean(integrated_errors),
                'std_error': np.std(integrated_errors),
                'max_error': np.max(np.abs(integrated_errors)),
                'trend': 'positive' if np.mean(integrated_errors) > 0 else 'negative'
            },
            'range': {
                'errors': range_errors,
                'mean_error': np.mean(range_errors),
                'std_error': np.std(range_errors),
                'max_error': np.max(np.abs(range_errors)),
                'trend': 'positive' if np.mean(range_errors) > 0 else 'negative'
            },
            'peak': {
                'errors': peak_errors,
                'mean_error': np.mean(peak_errors),
                'std_error': np.std(peak_errors),
                'max_error': np.max(np.abs(peak_errors)),
                'trend': 'positive' if np.mean(peak_errors) > 0 else 'negative'
            }
        }
        
        return analysis
    
    def calculate_optimal_adjustments(self, analysis: Dict[str, Any]) -> Dict[str, float]:
        """
        计算最优调整参数
        """
        adjustments = {}
        
        # 集成响度调整
        integrated_mean_error = analysis['integrated']['mean_error']
        adjustments['integrated_offset'] = -integrated_mean_error
        
        # 响度范围调整
        range_mean_error = analysis['range']['mean_error']
        range_ratio = 1.0 - (range_mean_error / np.mean([r['range'] for r in self.current_results]))
        adjustments['range_multiplier'] = max(0.1, min(2.0, range_ratio))
        
        # 真峰值调整
        peak_mean_error = analysis['peak']['mean_error']
        adjustments['peak_offset'] = -peak_mean_error
        
        return adjustments
    
    def test_adjustments(self, adjustments: Dict[str, float]) -> Dict[str, Any]:
        """
        测试调整效果
        """
        print("测试调整效果:")
        print("=" * 50)
        
        results = []
        for i, (test_case, current_result) in enumerate(zip(self.test_cases, self.current_results)):
            target = test_case['target']
            
            # 应用调整
            adjusted_integrated = current_result['integrated'] + adjustments['integrated_offset']
            adjusted_range = current_result['range'] * adjustments['range_multiplier']
            adjusted_peak = current_result['peak'] + adjustments['peak_offset']
            
            # 计算新误差
            new_integrated_error = adjusted_integrated - target['integrated']
            new_range_error = adjusted_range - target['range']
            new_peak_error = adjusted_peak - target['peak']
            
            result = {
                'song': i + 1,
                'adjusted_integrated': adjusted_integrated,
                'adjusted_range': adjusted_range,
                'adjusted_peak': adjusted_peak,
                'integrated_error': new_integrated_error,
                'range_error': new_range_error,
                'peak_error': new_peak_error,
                'integrated_improvement': abs(current_result['integrated'] - target['integrated']) - abs(new_integrated_error),
                'range_improvement': abs(current_result['range'] - target['range']) - abs(new_range_error),
                'peak_improvement': abs(current_result['peak'] - target['peak']) - abs(new_peak_error)
            }
            
            results.append(result)
            
            print(f"歌曲 {i+1}:")
            print(f"  调整后集成响度: {adjusted_integrated:.2f} LUFS (误差: {new_integrated_error:.2f})")
            print(f"  调整后响度范围: {adjusted_range:.2f} LU (误差: {new_range_error:.2f})")
            print(f"  调整后真峰值: {adjusted_peak:.2f} dBTP (误差: {new_peak_error:.2f})")
            print(f"  改进幅度: 集成{result['integrated_improvement']:.2f}, 范围{result['range_improvement']:.2f}, 峰值{result['peak_improvement']:.2f}")
            print()
        
        # 计算总体改进
        total_improvement = {
            'integrated': sum(r['integrated_improvement'] for r in results),
            'range': sum(r['range_improvement'] for r in results),
            'peak': sum(r['peak_improvement'] for r in results)
        }
        
        print("总体改进:")
        print(f"  集成响度总改进: {total_improvement['integrated']:.2f} LUFS")
        print(f"  响度范围总改进: {total_improvement['range']:.2f} LU")
        print(f"  真峰值总改进: {total_improvement['peak']:.2f} dBTP")
        
        return {
            'results': results,
            'total_improvement': total_improvement,
            'adjustments': adjustments
        }

def main():
    analyzer = PrecisionAnalyzer()
    
    print("精准度分析报告")
    print("=" * 60)
    
    # 分析误差模式
    analysis = analyzer.analyze_error_patterns()
    
    print("误差模式分析:")
    print("=" * 60)
    print(f"集成响度: 平均误差 {analysis['integrated']['mean_error']:.2f} LUFS, 最大误差 {analysis['integrated']['max_error']:.2f} LUFS")
    print(f"响度范围: 平均误差 {analysis['range']['mean_error']:.2f} LU, 最大误差 {analysis['range']['max_error']:.2f} LU")
    print(f"真峰值: 平均误差 {analysis['peak']['mean_error']:.2f} dBTP, 最大误差 {analysis['peak']['max_error']:.2f} dBTP")
    print()
    
    # 计算最优调整
    adjustments = analyzer.calculate_optimal_adjustments(analysis)
    
    print("计算的最优调整参数:")
    print("=" * 60)
    print(f"集成响度偏移: {adjustments['integrated_offset']:.3f} LUFS")
    print(f"响度范围倍数: {adjustments['range_multiplier']:.3f}")
    print(f"真峰值偏移: {adjustments['peak_offset']:.3f} dBTP")
    print()
    
    # 测试调整效果
    test_results = analyzer.test_adjustments(adjustments)
    
    # 保存结果
    output_file = "precision_analysis_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'analysis': analysis,
            'adjustments': adjustments,
            'test_results': test_results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n详细结果已保存到: {output_file}")

if __name__ == '__main__':
    main()
