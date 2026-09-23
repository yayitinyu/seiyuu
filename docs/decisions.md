# Architecture decisions

- 2026-09-21：目录初始为空且没有 Git。新增项目，不触碰其他路径代码，不主动发布。
- Next.js App Router + TypeScript + React。人物页 SSG，页面服务器组件优先，客户端仅导航控制、搜索和筛选。原生 CSS variables 代替 Tailwind：该定制编辑排版用 CSS 更直接，少一项构建依赖。
- JSON 内容层和纯函数索引，部署无需数据库。来源 / evidence 独立；允许缺失、冲突、局部日期。
- 三语 URL 前缀，中文兼容路由由 redirect 配置处理。语言路径稳定，不用客户端换字冒充国际化。
- 全局搜索是原生 dialog，检索实体归一化。轻量本地索引足够 8 人；后续服务端检索可替换纯函数边界。
- 不采用 GSAP / Motion；CSS transform 和 opacity 足够。没有滚动监听驱动的复杂动效。
- 摄影版权未取得。主动采用文字肖像封面与原创生成录音室意象；不能将生成真人冒充声优。
- 不复用 AniList / MAL 全量数据库，不创建抓取器。来源人工核查，不把数据接口可用等同授权。
- 默认 canonical 是建议域名 seiyuu.page，可配置；没有生产部署，发布时需确认主域和环境。公开日期功能采用日本时区和客户端当前日期，避免静态构建日期冒充今天。
- 2026-09-22：语言切换使用完整页面导航，保留 query / hash，确保根 HTML 的 lang 和主题初始化在三语之间正确更新。
- 日文主标题字体仅嵌入 21 KB TTF 子集，使用真实文件格式和 font preload；其他文字由系统字体回退。完整 SIL OFL 随文件提供。
- 装饰线谱的数值统一保留两位小数，消除 Node 与 Chromium 浮点差异导致的 hydration 警告；已有回归测试。
- 人物卡片不再导入完整内容库；服务器传入编号和所属，客户端只取得必要数据。目录姓名使用二级标题，章节内卡片使用三级标题；角色小字保持完整前景色以满足对比度。
- 动态语言根布局启用本版本提供的 experimental.globalNotFound。人物和作品页使用 dynamicParams=false，未知 slug 在响应开始前被拒绝，避免 streamed notFound 返回 HTTP 200。HTTP 回归覆盖这一实际发现的问题。升级 Next 时需复核该实验选项。
- 分享图放在语言路由下，沿用对应 metadataBase；站点和人物分享图为服务器生成 PNG。所有部署 URL 在构建时通过 NEXT_PUBLIC_SITE_URL 配置。
