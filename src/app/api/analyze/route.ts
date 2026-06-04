import { randomUUID } from 'crypto';
import { execFile } from 'child_process';
import { access, constants } from 'fs/promises';
import { unlink, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  'audio/flac',
  'audio/m4a',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
  'audio/x-wav',
]);

function getSafeTempFilePath(file: File) {
  const extension = path.extname(file.name).replace(/[^a-zA-Z0-9.]/g, '') || '.audio';
  return path.join(os.tmpdir(), `fuelmusic-${randomUUID()}${extension}`);
}

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

    if (!ALLOWED_FILE_TYPES.has(audioFile.type)) {
      return new Response(JSON.stringify({ error: '不支持的音频格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (audioFile.size > MAX_FILE_SIZE_BYTES) {
      return new Response(JSON.stringify({ error: '文件过大，最大支持 100MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 将文件保存到临时目录
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    tempFilePath = getSafeTempFilePath(audioFile);

    await writeFile(tempFilePath, buffer);
    console.log(`临时文件已保存: ${tempFilePath}`);

    const pythonScriptPath = path.join(process.cwd(), 'scripts', 'audio_analyzer_essentia.py');

    // 确保Python脚本存在
    try {
      await access(pythonScriptPath, constants.F_OK);
    } catch {
      console.error(`Python脚本不存在: ${pythonScriptPath}`);
      return new Response(JSON.stringify({ error: `Python脚本不存在: ${pythonScriptPath}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 调用Python脚本进行分析
    const { stdout, stderr } = await execFileAsync('python3', [pythonScriptPath, tempFilePath], {
      timeout: 300000,
      maxBuffer: 1024 * 1024 * 10,
    });

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

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error || '分析失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
