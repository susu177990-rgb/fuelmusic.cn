/**
 * 音频分析工具 - 后端API实现
 * 使用Python + librosa进行专业级音频分析
 */

/**
 * 使用后端API进行音频分析
 */
export async function analyzeAudio(file: File): Promise<{
  bpm: number | null;
  key: string | null;
  scale: 'maj' | 'min' | null;
  lufsIntegrated: number | null;
  peakDbFS: number | null;  // True Peak in dBTP
  lufsRange: number | null;
         lufsShortTerm: number | null;  // 平均短期响度
         lufsShortTermArray: number[] | null;  // 数组用于绘制曲线
         lufsMomentaryArray: number[] | null;  // 瞬时响度数组用于绘制曲线
}> {
  try {
    console.warn('开始后端音频分析...');
    console.warn('文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // 创建FormData
    const formData = new FormData();
    formData.append('audioFile', file);
    
    // 调用后端API
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Analysis failed');
    }
    
    console.warn('后端分析结果:', result);
    
    return {
      bpm: result.bpm,
      key: result.key,
      scale: result.scale,
      lufsIntegrated: result.lufsIntegrated,
      peakDbFS: result.peakDbFS,
             lufsRange: result.lufsRange,
             lufsShortTerm: result.lufsShortTerm,
             lufsShortTermArray: result.lufsShortTermArray,
             lufsMomentaryArray: result.lufsMomentaryArray
    };
    
  } catch (error) {
    console.error('后端音频分析失败:', error);
    throw error;
  }
}


