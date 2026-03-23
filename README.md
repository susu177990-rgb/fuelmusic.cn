# Fuel Music Studio Web

福乐音乐工作室官网与在线音频分析工具项目。

这个仓库承载了 `fuelmusic.cn` 的现行站点版本，包含品牌展示、服务介绍、案例试听、联系表单，以及面向音乐人的在线音频分析页面。项目同时保留了 Python 音频分析脚本、部署配置和若干算法研究结果，适合继续迭代官网内容与工具能力。

## 项目定位

Fuel Music Studio 是福乐音乐工作室的官方网站，核心目标有两部分：

- 对外展示工作室品牌、服务能力、价格体系与案例作品
- 提供一个可直接上传音频并查看分析结果的在线工具页

当前站点面向的主要使用场景包括：

- 音乐人查看混音、母带、编曲等服务内容
- 访客试听案例作品并发起合作咨询
- 用户上传音频文件，查看 BPM、调性、LUFS、真峰值等分析结果

## 业务内容

站点当前承载的工作室业务信息包括：

- 单曲混音
- 编曲定制
- 母带处理
- 封面制作
- 商业发行版与制作人深度参与服务

案例区目前展示了多首公开作品，并支持封面与音频试听。联系模块包含邮箱、微信与电话信息，便于客户直接发起合作。

## 主要功能

- 首页品牌展示与服务介绍
- 项目案例展示与试听
- 混音服务价格与合作说明
- FAQ 与联系表单
- 在线音频分析工具页
- 音频分析 API
- Python + Essentia 音频分析脚本
- Docker、PM2、Nginx 部署配置

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Resend
- Python 3
- Essentia

## 目录结构

```text
.
├── src/
│   ├── app/                  # App Router 页面、API 路由、站点配置
│   ├── components/           # 通用 React 组件
│   └── lib/                  # 前端分析逻辑与工具函数
├── public/                   # 品牌图片、案例封面、试听音频、站点静态资源
├── scripts/                  # Python 音频分析脚本与研究脚本
├── deploy/                   # PM2 / Nginx 部署配置
├── Dockerfile                # 容器化部署
└── package.json              # Node.js 脚本与依赖
```

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认端口为 `4000`。

### 3. 构建生产版本

```bash
npm run build
npm run start
```

## 环境变量

联系表单邮件发送依赖以下环境变量：

```bash
RESEND_API_KEY=your_resend_api_key
CONTACT_TO_EMAIL=your_email@example.com
```

如果未配置上述变量，联系接口会在开发环境下降级为本地日志输出，不会真的发送邮件。

## 音频分析说明

在线工具页依赖 `src/app/api/analyze/route.ts` 调用 Python 脚本：

- Python 脚本位置：`scripts/audio_analyzer_essentia.py`
- 上传文件会先写入系统临时目录
- 服务端执行 Python 脚本后返回 JSON 结果
- 分析指标包含 BPM、调性、Integrated LUFS、Short-term LUFS、LRA、True Peak 等

如果要让音频分析功能在本地或服务器可用，需要额外准备：

- Python 3
- `pip`
- `scripts/requirements.txt` 中的依赖
- Essentia 运行环境

## 部署方式

项目当前仓库内已经包含多种部署资料：

- `Dockerfile`
  适合容器化部署，构建时会安装 Node.js 依赖与 Python 依赖。
- `deploy/ecosystem.config.js`
  适合使用 PM2 托管 `npm run start`。
- `deploy/nginx.conf`
  适合传统 Linux + Nginx 反向代理部署。
- `scripts/deploy.sh`
  包含一份面向 Linux 服务器的 Essentia 环境安装示例脚本。

生产环境默认以 `4000` 端口运行，再由 Nginx 反向代理到域名。

## 维护建议

- 品牌文案、价格、案例和联系方式集中维护在 `src/app/lib/site-data.ts`
- 站点页面主要位于 `src/app/`
- 在线工具页主要位于 `src/app/tools/page.tsx`
- Python 音频分析能力主要位于 `scripts/`

如果后续继续替换官网内容，建议优先同步更新：

- `src/app/lib/site-data.ts`
- `public/brand/`
- `public/covers/`
- `public/demos/`
- `README.md`

## 联系方式

- 工作室名称：福乐音乐工作室 / Fuel Music Studio
- 微信：`fuelmusic`
- 邮箱：`1779916397@qq.com`
- 电话：`13565685912`

## 许可证

当前仓库 `package.json` 标记为 `MIT`。
