# PerfKpiViewDemo01

企业级性能数据展示台（Performance Data Aggregator）前端 Demo。

## 技术栈

- Vue 3 + Vite
- Element Plus
- ECharts
- Pinia
- Tailwind CSS

## 本地运行

```bash
npm install
npm run dev
```

默认访问：`http://localhost:5173`

## 一键部署

### 方案 A：Vercel 一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jinemmaking/PerfKpiViewDemo01)

Vercel 导入时建议构建配置：

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### 方案 B：Netlify 一键部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/jinemmaking/PerfKpiViewDemo01)

Netlify 导入时建议构建配置：

- Build command: `npm run build`
- Publish directory: `dist`

## 手动构建与部署

```bash
npm run build
```

构建产物位于 `dist/`，可部署到任意静态站点服务（Nginx、Vercel、Netlify、GitHub Pages 等）。

## 常见问题

### 1. `ENOENT: no such file or directory, open '.../package.json'`

请先进入项目根目录再执行 npm 命令：

```bash
cd /path/to/PerfKpiViewDemo01
```

### 2. `Permission denied (publickey)` 推送失败

说明 SSH key 尚未配置成功。请在 GitHub 账号设置中添加 SSH 公钥后重试。