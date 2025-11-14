# /tools 页面手机端水平滚动修复

## 问题描述
在手机端浏览 `/tools` 页面时，页面可以向右滑动，影响用户体验。

## 问题原因
主要原因是平台响度目标校验表格设置了 `min-w-[600px]`，在手机端（宽度通常小于600px）会导致水平滚动。

## 修复方案

### 1. 双重布局设计
- **手机端**：使用卡片式布局，每个平台一个卡片
- **桌面端**：保持原有的表格布局

### 2. 具体修改内容

#### 添加手机端卡片布局
```tsx
{/* 手机端：卡片式布局 */}
<div className="block sm:hidden space-y-3">
  {Object.entries(platformReport).map(([name, info], index) => (
    <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white/90 font-semibold text-sm">{name}</h4>
        {/* 状态标签 */}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* 数据展示 */}
      </div>
    </div>
  ))}
</div>
```

#### 优化桌面端表格布局
```tsx
{/* 桌面端：表格布局 */}
<div className="hidden sm:block overflow-x-auto -mx-2 sm:mx-0">
  <table className="w-full min-w-[600px]">
    {/* 表格内容 */}
  </table>
</div>
```

#### 防止水平滚动
```tsx
<div className="min-h-screen bg-black text-white relative overflow-x-hidden pt-0.5">
```

### 3. 优化特点

#### 手机端卡片布局
- **响应式网格**：使用 `grid-cols-2` 在手机端显示数据
- **清晰层次**：平台名称和状态标签在顶部，数据在下方
- **触摸友好**：卡片间距适中，便于触摸操作
- **信息完整**：包含所有表格中的信息

#### 桌面端表格布局
- **保持原样**：桌面端继续使用表格布局
- **水平滚动**：只在桌面端允许表格水平滚动
- **数据密度**：表格形式在桌面端更高效

### 4. 响应式断点
- **手机端**：`< 640px` (sm breakpoint)
- **桌面端**：`≥ 640px`

## 修复效果

### 手机端
- ✅ 无水平滚动
- ✅ 卡片式布局，信息清晰
- ✅ 触摸友好的界面
- ✅ 所有信息完整显示

### 桌面端
- ✅ 保持原有表格布局
- ✅ 数据密度高
- ✅ 水平滚动（仅在需要时）

## 文件修改清单
- `src/app/tools/page.tsx` - 主要修复文件
  - 添加手机端卡片布局
  - 优化桌面端表格布局
  - 添加 `overflow-x-hidden` 防止水平滚动

## 测试方法
1. 启动开发服务器：`npm run dev`
2. 打开浏览器开发者工具，切换到手机端视图
3. 访问 `/tools` 页面
4. 确认页面无法向右滑动
5. 检查平台响度目标校验部分显示为卡片式布局
