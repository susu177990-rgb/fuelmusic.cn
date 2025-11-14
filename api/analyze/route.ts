import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    console.log('收到音频分析请求');
    
    // 解析FormData
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      console.error('未提供音频文件');
      return NextResponse.json(
        { error: 'No audio file provided', success: false }, 
        { status: 400 }
      );
    }
    
    console.log(`音频文件信息: ${audioFile.name}, 大小: ${audioFile.size} bytes`);
    
    // 验证文件类型
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac'];
    if (!allowedTypes.includes(audioFile.type)) {
      console.error(`不支持的文件类型: ${audioFile.type}`);
      return NextResponse.json(
        { error: 'Unsupported file type', success: false }, 
        { status: 400 }
      );
    }
    
    // 验证文件大小 (限制100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (audioFile.size > maxSize) {
      console.error(`文件过大: ${audioFile.size} bytes`);
      return NextResponse.json(
        { error: 'File too large (max 100MB)', success: false }, 
        { status: 400 }
      );
    }
    
    // 保存临时文件
    const fileExtension = audioFile.name.split('.').pop() || 'mp3';
    tempFilePath = join(tmpdir(), `audio_${Date.now()}.${fileExtension}`);
    
    console.log(`保存临时文件: ${tempFilePath}`);
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(tempFilePath, buffer);
    
    // 调用Python脚本
    console.log('调用Python分析脚本...');
    const pythonScriptPath = join(process.cwd(), 'scripts', 'audio_analyzer.py');
    
    try {
      const { stdout, stderr } = await execAsync(
        `python3 "${pythonScriptPath}" "${tempFilePath}"`,
        { 
          timeout: 300000, // 5分钟超时
          maxBuffer: 1024 * 1024 * 10 // 10MB缓冲区
        }
      );
      
      if (stderr) {
        console.warn('Python脚本警告:', stderr);
      }
      
      console.log('Python脚本输出:', stdout);
      
      // 解析结果
      let result;
      try {
        result = JSON.parse(stdout);
      } catch (parseError) {
        console.error('解析Python输出失败:', parseError);
        console.error('原始输出:', stdout);
        return NextResponse.json(
          { error: 'Failed to parse analysis results', success: false }, 
          { status: 500 }
        );
      }
      
      if (!result.success) {
        console.error('Python分析失败:', result.error);
        return NextResponse.json(
          { error: result.error || 'Analysis failed', success: false }, 
          { status: 500 }
        );
      }
      
      console.log('分析成功:', result);
      
      // 返回结果
      return NextResponse.json({
        bpm: result.bpm,
        key: result.key,
        scale: result.scale,
        lufsIntegrated: result.lufsIntegrated,
        peakDbFS: result.peakDbFS,
        lufsRange: result.lufsRange,
        lufsShortTerm: [result.lufsShortTerm], // 转换为数组格式
        success: true
      });
      
    } catch (execError: any) {
      console.error('Python脚本执行失败:', execError);
      
      if (execError.code === 'TIMEOUT') {
        return NextResponse.json(
          { error: 'Analysis timeout (file too large or complex)', success: false }, 
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: 'Python script execution failed', success: false }, 
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('API处理错误:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false }, 
      { status: 500 }
    );
  } finally {
    // 清理临时文件
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log(`清理临时文件: ${tempFilePath}`);
      } catch (cleanupError) {
        console.warn('清理临时文件失败:', cleanupError);
      }
    }
  }
}

// 处理OPTIONS请求 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
