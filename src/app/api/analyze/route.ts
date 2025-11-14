import { writeFile, unlink } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  let tempFilePath = '';
  
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audioFile') as File;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: '没有找到音频文件' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 将文件保存到临时目录
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempFileName = `${Date.now()}-${audioFile.name}`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);

    await writeFile(tempFilePath, buffer);
    console.log(`临时文件已保存: ${tempFilePath}`);

    let pythonScriptPath = '';
    // 检查是否在开发环境
    if (process.env.NODE_ENV === 'development') {
      // 开发环境路径
      pythonScriptPath = path.join(process.cwd(), 'scripts', 'audio_analyzer_essentia.py');
    } else {
      // 生产环境路径 (假设部署时脚本在项目根目录下的scripts文件夹)
      pythonScriptPath = path.join(process.cwd(), 'scripts', 'audio_analyzer_essentia.py');
    }

    // 确保Python脚本存在
    try {
      await promisify(require('fs').access)(pythonScriptPath, require('fs').constants.F_OK);
    } catch (err) {
      console.error(`Python脚本不存在: ${pythonScriptPath}`);
      return new Response(JSON.stringify({ error: `Python脚本不存在: ${pythonScriptPath}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 调用Python脚本进行分析
    const { stdout, stderr } = await execAsync(`python3 "${pythonScriptPath}" "${tempFilePath}"`);

    if (stderr) {
      console.error('Python脚本错误输出:', stderr);
      // 过滤掉INFO级别的日志，只处理真正的错误
      const errorLines = stderr.split('\n').filter(line => 
        line.includes('ERROR') || line.includes('FATAL') || line.includes('Exception') || 
        line.includes('Traceback') || line.includes('Error:')
      );
      
      if (errorLines.length > 0) {
        throw new Error(`Python脚本错误: ${errorLines.join('\n')}`);
      }
    }

    const result = JSON.parse(stdout);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API处理失败:', error);
    return new Response(JSON.stringify({ error: `分析过程出现错误: ${error?.message || error}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    // 清理临时文件
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log(`清理临时文件: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error('清理临时文件失败:', cleanupError);
      }
    }
  }
}