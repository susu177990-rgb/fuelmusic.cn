#!/bin/bash

# Essentia音频分析服务部署脚本
# 适用于阿里云Linux系统 + 宝塔面板

echo "开始部署Essentia音频分析服务..."

# 1. 检查Python环境
echo "检查Python环境..."
python3 --version
pip3 --version

# 2. 安装系统依赖
echo "安装系统依赖..."
sudo yum update -y
sudo yum install -y python3-devel python3-pip gcc gcc-c++ make cmake

# 3. 安装Essentia依赖
echo "安装Essentia依赖..."
pip3 install --upgrade pip
pip3 install numpy scipy

# 4. 安装Essentia
echo "安装Essentia..."
pip3 install essentia

# 5. 验证安装
echo "验证Essentia安装..."
python3 -c "import essentia; print('Essentia版本:', essentia.__version__)"

# 6. 设置文件权限
echo "设置文件权限..."
chmod +x scripts/audio_analyzer_essentia.py

# 7. 创建测试
echo "创建测试..."
if [ -f "public/demos/1.mp3" ]; then
    echo "测试音频分析..."
    python3 scripts/audio_analyzer_essentia.py public/demos/1.mp3
else
    echo "警告: 测试文件 public/demos/1.mp3 不存在"
fi

echo "部署完成！"
echo "请确保："
echo "1. Node.js环境已安装"
echo "2. Next.js应用已构建"
echo "3. 宝塔面板已配置反向代理"
