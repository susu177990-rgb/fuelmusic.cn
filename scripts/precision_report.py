#!/usr/bin/env python3
"""
精准度验证报告生成器
"""

import json
from typing import Dict, Any

def generate_precision_report():
    """
    生成精准度验证报告
    """
    
    # 测试数据
    test_cases = [
        {
            'file': '144BPM-C minor',
            'target': {'integrated': -7.6, 'range': 0.7, 'peak': 0.0},
            'optimized': {'integrated': -9.05, 'range': 0.65, 'peak': 0.04}
        },
        {
            'file': '130 BPM Eb minor',
            'target': {'integrated': -8.6, 'range': 0.8, 'peak': 0.2},
            'optimized': {'integrated': -9.32, 'range': 0.78, 'peak': -0.04}
        },
        {
            'file': '87 BPM F# major',
            'target': {'integrated': -10.1, 'range': 0.7, 'peak': 0.2},
            'optimized': {'integrated': -7.93, 'range': 0.79, 'peak': 0.39}
        }
    ]
    
    print("🎯 精准度优化验证报告")
    print("=" * 80)
    print()
    
    total_improvement = {'integrated': 0, 'range': 0, 'peak': 0}
    
    for i, case in enumerate(test_cases, 1):
        print(f"📊 歌曲 {i}: {case['file']}")
        print("-" * 60)
        
        # 计算误差
        integrated_error = case['optimized']['integrated'] - case['target']['integrated']
        range_error = case['optimized']['range'] - case['target']['range']
        peak_error = case['optimized']['peak'] - case['target']['peak']
        
        # 计算误差绝对值
        integrated_abs_error = abs(integrated_error)
        range_abs_error = abs(range_error)
        peak_abs_error = abs(peak_error)
        
        print(f"🎵 集成响度:")
        print(f"   目标值: {case['target']['integrated']:.1f} LUFS")
        print(f"   检测值: {case['optimized']['integrated']:.2f} LUFS")
        print(f"   误差: {integrated_error:+.2f} LUFS (绝对值: {integrated_abs_error:.2f})")
        
        print(f"📈 响度范围:")
        print(f"   目标值: {case['target']['range']:.1f} LU")
        print(f"   检测值: {case['optimized']['range']:.2f} LU")
        print(f"   误差: {range_error:+.2f} LU (绝对值: {range_abs_error:.2f})")
        
        print(f"🔊 真峰值:")
        print(f"   目标值: {case['target']['peak']:.1f} dBTP")
        print(f"   检测值: {case['optimized']['peak']:.2f} dBTP")
        print(f"   误差: {peak_error:+.2f} dBTP (绝对值: {peak_abs_error:.2f})")
        
        # 评估精度
        integrated_grade = "优秀" if integrated_abs_error <= 0.5 else "良好" if integrated_abs_error <= 1.0 else "需改进"
        range_grade = "优秀" if range_abs_error <= 0.2 else "良好" if range_abs_error <= 0.5 else "需改进"
        peak_grade = "优秀" if peak_abs_error <= 0.2 else "良好" if peak_abs_error <= 0.5 else "需改进"
        
        print(f"📋 精度评估:")
        print(f"   集成响度: {integrated_grade}")
        print(f"   响度范围: {range_grade}")
        print(f"   真峰值: {peak_grade}")
        print()
        
        # 累计改进
        total_improvement['integrated'] += integrated_abs_error
        total_improvement['range'] += range_abs_error
        total_improvement['peak'] += peak_abs_error
    
    # 总体统计
    print("📊 总体统计")
    print("=" * 80)
    
    avg_integrated_error = total_improvement['integrated'] / len(test_cases)
    avg_range_error = total_improvement['range'] / len(test_cases)
    avg_peak_error = total_improvement['peak'] / len(test_cases)
    
    print(f"🎯 平均误差:")
    print(f"   集成响度: {avg_integrated_error:.2f} LUFS")
    print(f"   响度范围: {avg_range_error:.2f} LU")
    print(f"   真峰值: {avg_peak_error:.2f} dBTP")
    print()
    
    # 目标达成情况
    print("🎯 目标达成情况:")
    print("=" * 80)
    
    integrated_target_met = avg_integrated_error <= 0.5
    range_target_met = avg_range_error <= 0.2
    peak_target_met = avg_peak_error <= 0.2
    
    print(f"✅ 集成响度 (目标: ≤0.5 LUFS): {'达成' if integrated_target_met else '未达成'} ({avg_integrated_error:.2f} LUFS)")
    print(f"✅ 响度范围 (目标: ≤0.2 LU): {'达成' if range_target_met else '未达成'} ({avg_range_error:.2f} LU)")
    print(f"✅ 真峰值 (目标: ≤0.2 dBTP): {'达成' if peak_target_met else '未达成'} ({avg_peak_error:.2f} dBTP)")
    print()
    
    # 总体评估
    overall_score = 0
    if integrated_target_met:
        overall_score += 1
    if range_target_met:
        overall_score += 1
    if peak_target_met:
        overall_score += 1
    
    overall_grade = "优秀" if overall_score == 3 else "良好" if overall_score >= 2 else "需改进"
    
    print(f"🏆 总体评估: {overall_grade} ({overall_score}/3 项指标达标)")
    print()
    
    # 改进建议
    print("💡 进一步改进建议:")
    print("=" * 80)
    
    if not integrated_target_met:
        print(f"🔧 集成响度: 当前误差 {avg_integrated_error:.2f} LUFS，建议进一步调整校准参数")
    
    if not range_target_met:
        print(f"🔧 响度范围: 当前误差 {avg_range_error:.2f} LU，建议优化百分位数计算方法")
    
    if not peak_target_met:
        print(f"🔧 真峰值: 当前误差 {avg_peak_error:.2f} dBTP，建议增强过采样算法")
    
    if overall_score == 3:
        print("🎉 恭喜！所有指标均已达到目标精度，算法优化成功！")
    
    print()
    print("=" * 80)

if __name__ == '__main__':
    generate_precision_report()
