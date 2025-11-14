#!/usr/bin/env python3
"""
响度曲线优化算法 - 过滤歌曲末尾的下降趋势
"""

import numpy as np
from typing import List, Tuple, Dict, Any

class LoudnessCurveOptimizer:
    """
    响度曲线优化器
    用于过滤歌曲末尾的下降趋势，只影响曲线绘制
    """
    
    def __init__(self):
        # 下降趋势检测参数
        self.decline_threshold = 0.5  # LUFS，连续下降的最小阈值
        self.min_samples = 10         # 最少需要多少个样本点来检测趋势
        self.smoothing_window = 5     # 平滑窗口大小
        
    def detect_decline_start(self, loudness_values: List[float]) -> int:
        """
        检测下降趋势的开始位置
        返回应该截断的位置（保留到该位置之前的数据）
        """
        if len(loudness_values) < self.min_samples:
            return len(loudness_values)
        
        # 1. 对数据进行平滑处理，减少噪声影响
        smoothed_values = self._smooth_data(loudness_values)
        
        # 2. 计算移动平均的斜率
        slopes = self._calculate_slopes(smoothed_values)
        
        # 3. 检测连续下降趋势
        decline_start = self._find_decline_start(slopes, smoothed_values)
        
        return decline_start
    
    def _smooth_data(self, values: List[float]) -> List[float]:
        """
        对数据进行平滑处理
        """
        if len(values) < self.smoothing_window:
            return values
        
        smoothed = []
        for i in range(len(values)):
            start = max(0, i - self.smoothing_window // 2)
            end = min(len(values), i + self.smoothing_window // 2 + 1)
            window = values[start:end]
            smoothed.append(np.mean(window))
        
        return smoothed
    
    def _calculate_slopes(self, values: List[float]) -> List[float]:
        """
        计算相邻点之间的斜率
        """
        slopes = []
        for i in range(1, len(values)):
            slope = values[i] - values[i-1]
            slopes.append(slope)
        return slopes
    
    def _find_decline_start(self, slopes: List[float], values: List[float]) -> int:
        """
        找到下降趋势的开始位置
        """
        # 从后往前查找，找到第一个明显下降的位置
        consecutive_decline = 0
        decline_start = len(values)
        
        for i in range(len(slopes) - 1, -1, -1):
            if slopes[i] < -self.decline_threshold:
                consecutive_decline += 1
                if consecutive_decline >= 3:  # 连续3个点下降
                    decline_start = i + 1
                    break
            else:
                consecutive_decline = 0
        
        # 额外检查：如果末尾有大幅下降（超过2 LUFS），也要截断
        if len(values) >= 5:
            last_5_avg = np.mean(values[-5:])
            if len(values) >= 10:
                prev_5_avg = np.mean(values[-10:-5])
                if prev_5_avg - last_5_avg > 2.0:  # 末尾5个点比前5个点低2 LUFS以上
                    decline_start = min(decline_start, len(values) - 5)
        
        return decline_start
    
    def optimize_curve_data(self, loudness_values: List[float]) -> Dict[str, Any]:
        """
        优化曲线数据
        返回优化后的数据和相关信息
        """
        if len(loudness_values) == 0:
            return {
                'optimized_values': loudness_values,
                'original_length': 0,
                'optimized_length': 0,
                'decline_detected': False,
                'decline_start': 0
            }
        
        # 检测下降趋势开始位置
        decline_start = self.detect_decline_start(loudness_values)
        
        # 如果检测到下降趋势，截断数据
        if decline_start < len(loudness_values):
            optimized_values = loudness_values[:decline_start]
            decline_detected = True
        else:
            optimized_values = loudness_values
            decline_detected = False
        
        return {
            'optimized_values': optimized_values,
            'original_length': len(loudness_values),
            'optimized_length': len(optimized_values),
            'decline_detected': decline_detected,
            'decline_start': decline_start
        }

def test_curve_optimizer():
    """
    测试曲线优化器
    """
    # 模拟一个包含末尾下降的响度数据
    test_data = [
        -10.0, -9.5, -9.0, -8.5, -8.0,  # 正常部分
        -7.5, -7.0, -6.5, -6.0, -5.5,  # 正常部分
        -5.0, -4.5, -4.0, -3.5, -3.0,  # 正常部分
        -3.5, -4.0, -4.5, -5.0, -5.5,  # 开始下降
        -6.0, -6.5, -7.0, -7.5, -8.0,  # 继续下降
        -8.5, -9.0, -9.5, -10.0, -10.5, # 大幅下降
        -11.0, -11.5, -12.0, -12.5, -13.0 # 断崖式下降
    ]
    
    optimizer = LoudnessCurveOptimizer()
    result = optimizer.optimize_curve_data(test_data)
    
    print("🎵 曲线优化测试结果:")
    print(f"原始数据长度: {result['original_length']}")
    print(f"优化后长度: {result['optimized_length']}")
    print(f"检测到下降趋势: {result['decline_detected']}")
    print(f"下降开始位置: {result['decline_start']}")
    print(f"截断的数据点: {result['original_length'] - result['optimized_length']}")
    
    print("\n📊 数据对比:")
    print("原始末尾数据:", test_data[-10:])
    print("优化后末尾数据:", result['optimized_values'][-10:] if len(result['optimized_values']) >= 10 else result['optimized_values'])

if __name__ == '__main__':
    test_curve_optimizer()

