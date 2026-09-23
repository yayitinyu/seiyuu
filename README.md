# Seiyuu / 声優

关于人、声音与记忆的三语数字档案馆。以日文排版、文字档案封面和有出处的职业资料，连接声优、角色、作品与共演者。

## 本地运行

已验证环境：Node.js 22.23.1、npm 10.9.8、Next.js 16.3.5、React 19.3.0、TypeScript 5.9.3。依赖由 `package-lock.json` 固定。

```powershell
npm ci
npm run dev
```

开发地址为 `http://127.0.0.1:3000`。生产构建预览：

```powershell
npm run build
npm start -- --port 3001
```

打开 `http://127.0.0.1:3001/zh-CN`。另有 `/ja-JP`、`/en`；根路径重定向至中文。旧式 `/seiyuu/...` 永久重定向至中文档案路径。

## 功能范围

- 首页选辑、8 位人物、12 部作品、14 条角色关系、原创声音札记和关于页面。
- 全局搜索支持人物、角色、作品和事务所；姓名汉字、中文别名、平假名、片假名、全半角和罗马字词序归一；Ctrl / Cmd + K、方向键、Enter、Escape。
- 目录支持事务所、生日月份、性别、声优出道年代与年份、五十音筛选；条件写入 URL，可刷新、分享和跨语言保留。
- 人物页提供履历、精选出演、时间轴、跨媒体活动、官方声音样本外链、逐项资料出处与共演者入口。
- 三语独立 URL、明暗主题、键盘焦点、reduced-motion、手机重排；生日模块按日本时区计算。
- Canonical、hreflang、Person / Movie / TVSeries JSON-LD、站点地图、robots、manifest 和 1200 × 630 分享图。未知档案返回真实 HTTP 404。

页面以服务器组件和静态生成提供；目录筛选在客户端响应并同步路由。无需数据库、API key 或登录服务。没有后台编辑、账号、收藏、实际音频托管或全行业数据库。

## 配置与发布

`NEXT_PUBLIC_SITE_URL` 影响 canonical、站点地图和分享图 URL，需在构建时设置为实际主域；默认的 `https://seiyuu.page` 是建议地址，不代表已注册、部署或上线。

页脚备案信息默认隐藏。取得备案号后，在构建环境中按需设置 `NEXT_PUBLIC_ICP_BEIAN_NUMBER` 和 `NEXT_PUBLIC_MPS_BEIAN_NUMBER`（可只设置其中一项），例如复制 `.env.example` 为 `.env.local` 并填写真实号码。ICP备案号链接到工信部查询站；公安备案号中含有完整的 14 位数字时链接到对应的公安备案查询页，否则链接到公安备案搜索页。备案号会写入构建产物，修改后需要重新构建镜像；不要填写尚未核准的示例号码。

GitHub Actions 的 [镜像工作流](.github/workflows/image.yml) 在 `main` 更新、`v*` 标签推送或手动触发时，分别使用 GitHub 的 `ubuntu-24.04`（amd64）和 `ubuntu-24.04-arm`（arm64）原生运行器构建，并合成 `ghcr.io/yayitinyu/seiyuu` 多架构镜像。`main` 生成 `latest`，所有构建生成完整提交 SHA 标签，版本标签另生成原始 `v*` 和无 `v` 的版本标签。可在仓库 Actions Variables 中设置 `NEXT_PUBLIC_SITE_URL` 及两项备案号；留空则保持默认站点地址且不显示备案信息。工作流不会自动部署到服务器。

需要支持 Node.js 的 Next.js 托管环境；目录查询和分享图使用服务器路由，不能直接当作纯静态 `out/` 目录发布。域名、托管和备案取舍见 [域名策略](docs/domain-strategy.md)。本次交付为本地工程，不包含生产部署。

## 内容维护

事实在 `content/archive.json`，类型在 `lib/types.ts`，三语 UI 在 `lib/i18n.ts`，原创札记在 `content/journal.ts`。来源记录查阅日期、URL、类型与置信度，重要字段通过 `evidence` 映射回来源。

当前收录 21 个来源。无官方出生年时只显示月日；声优出道年份只有明确核实的值才进入筛选。缺失项不是零，也不据此推断年龄或职业起点。角色清单是精选履历。

新增内容应先查官方资料、登记来源和事实证据、补齐三语标签，再运行校验并构建。人物和作品的合法 URL 来自构建时内容，更新 JSON 后需要重新构建。

人物封面是原生文字和装饰线谱，`IMAGE_LICENSE_TODO` 表示真人照片尚待授权。首页录音室为 AI 生成意象，与真实人物或场所无对应关系；声音只跳转官方页面，不提供伪播放器。详见 [素材政策](docs/image-policy.md)。

## 验证

```powershell
npm test
npm run typecheck
npm run build
```

保持 3001 端口的生产预览运行，在另一个终端执行：

```powershell
npm run test:http
```

HTTP 回归验证全部 72 个三语内容页面、5 种 404、重定向、语言与 SEO 元信息、结构化数据、站点地图及分享图。非默认预览地址可设置 `TEST_BASE_URL`；验证自定义 canonical 时也应设置与构建一致的 `NEXT_PUBLIC_SITE_URL`。

本地浏览器已检查 1440、1280、768、390px，并实际验证搜索、筛选、语言切换、主题持久化和关系跳转。Lighthouse 是本地 Chromium 实验室结果，不能代替上线后的真实网络指标，也不代表完整 WCAG 认证。其他浏览器、实体设备和读屏软件仍需上线前复核。

已知框架日志：本版本 Next 在拒绝不存在的静态人物 / 作品 slug 时可能输出 `Internal: NoFallbackError`。已实际核验响应为 404、含 noindex，且定制页面与返回入口可用；没有隐藏或过滤该日志。升级 Next 时应复查 `globalNotFound` 与 `dynamicParams` 的组合行为。

## 项目说明

- [产品愿景](docs/vision.md) · [调研记录](docs/research.md) · [信息架构](docs/information-architecture.md)
- [设计系统与概念](docs/design-system.md) · [内容模型](docs/data-model.md) · [编辑规范](docs/content-guidelines.md)
- [架构决定](docs/decisions.md) · [路线图](docs/roadmap.md)

后续扩展重点是已授权肖像与音频、更多官方来源、人工三语审校、CMS 和来源版本审核。不要用虚构资料补齐数据。
