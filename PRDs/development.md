企业级性能数据展示台 - 技术实施文档

1. 技术栈选型 (Technology Stack)
坚持“成熟、稳定、本地化”原则，严禁 Cursor 自写复杂的底层组件。

- 基础框架: Vue 3 (SFC) + Vite (前端构建基石)
- UI 组件库: Element Plus (直接使用其 Tree, Table, Select, Radio, Message 等组件)
- 可视化引擎: ECharts 5.x (行业标准，自带高性能聚合与大数据处理)
- 状态管理: Pinia (用于管理跨组件的“已选端口”和“全局配置”)
- 样式处理: Tailwind CSS (用于布局与微调，避免写冗长的 CSS 文件)
- 本地存储: Browser LocalStorage (用于持久化保存“视图组合”，无需数据库服务)
- 工具库: dayjs (处理时间格式化), lodash-es (处理高性能数据求和与平均运算)
  

---

2. 架构设计 (System Architecture)

2.1 纯本地运行逻辑
- 无云端依赖: 所有库通过 NPM 安装。
- 模拟后端: 在 src/api/ 目录下创建一个 mockService.js，通过 Promise 模拟网络请求延迟（500ms），实现数据获取与聚合逻辑。
- 计算下沉: 
  - 原始值模式: Mock Service 返回 N 组时序数据。
  - 求和/平均模式: Mock Service 在内部完成 map/reduce 计算，仅返回 1 组结果给前端渲染。
    
2.2 目录结构
/src
  /api          # 模拟后端接口与聚合算法逻辑
  /store        # Pinia 状态（存储选中的 10 个端口、已存视图）
  /components   # 封装好的 ECharts 组件、设备树组件
  /views        # 主页面布局
  /utils        # 流量单位转换 (bps->Mbps)、统计学计算 (Max/Min/Avg)


---

3. 核心功能实现逻辑 (禁止造轮子)

3.1 资源选择 (Device Tree)
- 组件: 直接使用 el-tree-v2 (虚拟列表树)，即便有上万个端口也不会卡顿。
- 逻辑: 
  - 设置 show-checkbox。
  - 在 check 事件中判断 getCheckedNodes().length > 10。
  - 若超过 10，调用 setChecked 取消当前操作并弹出 ElMessage。
    
3.2 聚合算法实现 (Aggregation)
使用 lodash-es 提高计算可靠性：
- 求和 (Sum): 针对同一时间戳 t，执行 _.sumBy(portsData, (d) => d.valueAtT)。
- 平均 (Avg): 执行 sum / selectedPorts.length。
- 统计值: 直接对结果数组使用 Math.max(...values) 和 Math.min(...values)。
  
3.3 图表渲染 (ECharts)
- 配置: 使用 dataset 模式管理数据，解耦数据处理与图形渲染。
- 性能: 开启 animation: true 实现平滑切换，开启 dataZoom 支持鼠标滚轮缩放查看细节。
  

---

4. 给 Cursor 的“拒造轮子”指令集

请按以下顺序给 Cursor 下达指令，以确保它调用成熟组件：

阶段一：搭建工程环境与 Layout
"请基于 Vue3 和 Vite 创建项目。引入 Element Plus, Tailwind CSS 和 ECharts。
页面采用左侧 280px 固定，右侧自适应的布局。
左侧使用 el-tree-v2 展示设备端口树，右侧使用 el-card 作为图表容器。"

阶段二：接入成熟的 Tree 逻辑
"请实现设备树。要求从本地 JSON 模拟数据加载，支持搜索过滤。
必须使用 Element Plus 的 check 事件限制最多勾选 10 个端口，超过时需通过 ElMessage.warning 提醒。
选中的端口 ID 请存储在 Pinia store 中以便全局访问。"

阶段三：数据聚合与 ECharts 渲染
"请在 src/api 下写一个数据服务。它接收选中的端口 ID 列表和计算模式（原始、求和、平均）。
1. 如果是求和模式，请使用 lodash 将多个端口在相同时间戳的数据进行累加，返回单条数据。
2. 使用 ECharts 渲染结果，要求包含 areaStyle 阴影，且 tooltip 能够显示所有对比项。
3. 图表下方使用 el-table 展示统计：名称、最大值、最小值、平均值。"

阶段四：本地持久化 (Saved Views)
"实现‘保存视图’功能。将当前选中的端口 ID 列表、指标和模式保存到 localStorage 中。
在页面顶部增加一个 el-select，可以一键切换已保存的视图组合。"


---

5. 关键非功能性要求
- 离线可用: 确保所有资源（JS/CSS/字体）都在 node_modules 中，不加载任何外部 CDN 链接。
- 单位处理: 必须实现一个 formatTraffic 工具函数，自动将 1024bps 转换为 1Kbps 等。
- 异常处理: 如果后端（模拟接口）返回空数据，前端必须显示 el-empty。