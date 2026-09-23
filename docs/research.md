# Research first

调研日期：2026-09-21。区分实际读取、搜索索引与访问受限；不把未打开的网站写成完成了视觉审查。以下均为公开页面，未抓取人像、音频或动画画面。

## 官方资料与内容结构

| 来源 | 实际观察 / 对本项目的影响 |
| --- | --- |
| [I'm Enterprise：早見沙織](https://www.imenterprise.jp/profile.php?id=74) | 假名、罗马字、生日月日、出生地、角色、广播、旁白和声音样本分组完整。生日没有年份；不得自行补全。 |
| [大沢事務所：花澤香菜](https://osawa-inc.co.jp/women/hanazawakana/) | 姓名、生日、出身地、声音样本及出演清单；资料密度高，适合作为事实来源，而非照搬其表格排版。 |
| [青二：悠木碧](https://www.aoni.co.jp/search/yuki-aoi.html) / [野沢雅子](https://www.aoni.co.jp/search/nozawa-masako.html) | 动画、游戏、广播、旁白可以共存；同一个人物不是单一职业标签。两者仅列生日月日。 |
| [81 Produce：高橋李依](https://www.81produce.co.jp/dcms_plusdb/index.php/item?id=236) | 列出声音样本、生日、出身和奖项，展示多种音声工作。 |
| [津田健次郎官网](https://tsudaken.jp/) | VOICE / ACT / OTHER 体现跨媒体职业；声优、演员、导演需在扩展模型中共存。公开生日仅月日。 |
| [宫野真守官网 Profile](https://miyanomamoru.com/s/mm0608/page/profile) / [研音](https://www.ken-on.co.jp/artists/miyano/) | 当前所属应核验研音，不能延续旧资料的剧团向日葵。官网明确声优出道为 2001，艺人出道为 2007；不同口径不能混为一谈。 |
| [緒方恵美 Profile](https://www.emou.net/profile/) / [首页](https://emou.net/) | 从舞台到声优、音乐和广播的职业路径。官网声明自由链接仅限首页，因此产品入口使用首页；精确取证 URL 仍在内部来源中保存。 |
| [早见沙织 Biography](https://hayamisaoriofficial.com/biography/) / [GARDEN](https://hayamisaoriofficial.com/discography/post-12/) | 音乐出道与单曲发行日可由本人官网核实，时间轴应记录具体事件，不写主观的“重大突破”。 |
| [声优奖第十届](https://www.seiyuawards.jp/winning/winning_10/index.php) | 奖项保留届次和当年的正式分类，不能把年度与颁奖日期混用。 |
| [SPY×FAMILY](https://spy-family.net/tvseries/) / [聲の形](https://koenokatachi-movie.com/) / [鬼滅の刃](https://kimetsu.com/anime/risshihen/character/) / [呪術廻戦](https://jujutsukaisen.jp/character/) / [薬屋のひとりごと](https://kusuriyanohitorigoto.jp/season1/) | 演员—角色关系以事务所履历和官方 Cast 交叉核查，系列与单季分开；首播年份不能从当前续作页推断。 |

## 聚合资料与竞品

| 来源 | 用途、优点与限制 |
| --- | --- |
| [MyAnimeList People](https://myanimelist.net/people.php) | 人物与配音关系的候选参考。本轮直读受限，未声称审查其当前交互，不作为本版事实来源。 |
| [AniList](https://anilist.co/) / [API 条款](https://docs.anilist.co/guide/terms-of-use) | 主站返回 403。官方 API 条款可由索引读取，明确限制囤积 / 批量采集，以及竞品使用；不拿它当免费数据库镜像。 |
| [ANN Encyclopedia](https://www.animenewsnetwork.com/encyclopedia/) | 候选英文交叉核验源，本轮直读受限。不从搜索摘要编造生涯事实。 |
| [Bangumi 人物](https://bgm.tv/person) | 已读取：现实人物与虚构角色分开，生日月份、姓名与作品关联有实用价值。避免复制密集的论坛式布局和热度排序。 |
| [日文 Wikipedia](https://ja.wikipedia.org/wiki/早見沙織)、[中文](https://zh.wikipedia.org/wiki/早見沙織)、[英文](https://en.wikipedia.org/wiki/Saori_Hayami) | 已读取或查看索引：多语名称、参考文献和不同年表有价值；仅作低优先级交叉参考，不搬运传记段落。 |
| [萌娘百科](https://zh.moegirl.org.cn/声优) | 返回 JavaScript 要求，未读取内容。社区昵称可以是待核验搜索别名，不进入权威人物介绍。 |
| 官方社交账号 | 从本人官网外链认定身份，不能仅凭显示名或蓝标。本轮读到官网关联 X、YouTube 等入口；不内嵌追踪脚本、不自动采集帖子。Blog、Instagram 的内容与授权另行确认。 |

## 视觉与信息架构参考

| 参考 | 观察与转化 |
| --- | --- |
| [The Gentlewoman Library](https://thegentlewoman.co.uk/library) | 已在真实浏览器观察：低干扰导航、人物优先、目录按字母组织。借鉴人物即入口与编辑留白，不复制杂志摄影或标识。 |
| [21_21 DESIGN SIGHT](https://2121designsight.jp/ch/) | 已读取展览及文化机构信息架构；展览—时间—人物层级支持档案式分组。初次带下划线的域名错误已纠正，未据其进行像素级视觉分析。 |
| [东京国际电影节 2026](https://2026.tiff-jp.net/ja/) | 已读取：跨语种入口、时间和作品是关键导航，不应把所有内容等权展示。 |
| [津田健次郎](https://tsudaken.jp/)、[宫野真守](https://miyanomamoru.com/) | 艺人自我呈现的职业分类和编年组织，启发 profile 与 biography 的分层。 |
| [CSS Design Awards](https://www.cssdesignawards.com/) | 已读取其 UI / UX / Innovation 分项与作品目录。审美、可用性、原创性需分别验证，奖项名称不构成质量证明。 |
| [Awwwards 日本目录](https://www.awwwards.com/websites/japan/) | 本轮直读受限，仅列为后续视觉参考入口，不声称已分析具体获奖作品。 |
| [NOWNESS](https://www.nowness.com/) | 页面只返回加载外壳，未据此臆测当下动画。其电影式编辑方向作为研究候选保留。 |

## 转化为 Seiyuu 的原则

1. 日文细衬线展示人格，中文正文和界面使用系统无衬线保证可读性；数字等宽，纵排只用于封面。
2. 首页由非对称影像、人物选辑、墨色关系带、札记组成。不同段落不同构图，共用边距和细线。
3. 声纹是装饰，并非某个真人的声纹测量；不能伪造音频、播放进度或时间码。
4. 搜索支持 NFKC、片假名转平假名、空格和大小写归一、姓名词序与人工中文别名。
5. 手机重排 hero，纵排封面缩短，筛选放到原生 details；不做桌面缩小版。页面不劫持滚动。
6. Motion 用短距离、透明度和细线变化；reduced-motion 下立即呈现。系统字体避免 CJK 下载阻塞。
7. 禁止伪排行、伪统计、无来源名言、模板 CTA、重复三列功能块、角色立绘盗链。

## 数据与版权策略

先人工核验八人，所有事实带 source ID，源对象保留 URL、类型、retrieved_at、核验状态和置信度。事实冲突另存，不覆盖；未核实资料不显示为确定事实。事实与原创编辑文字分开。引用限必要信息，不复制成段简介。

官方可查看不等于可再分发。照片、音频、角色画面分别取得授权；有疑问使用文字封面。开发图像为原创生成的空录音室，明确是意象而非某人的真实工作室。详情见 image-policy.md。

## 技术依据

[Next.js 安装](https://nextjs.org/docs/app/getting-started/installation)、[国际化](https://nextjs.org/docs/app/guides/internationalization)、[Google 多地区 / 多语言](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)。当前 npm 核验 Next 16.3.5、React 19.3.0、Node 22.23.1。实际安装以 lockfile 固定。选择静态内容与 App Router，不引入数据库、CMS、GSAP 或外部搜索服务。

## 补充取证

- [Breathe Arts：緒方恵美](https://breathearts.jp/talent-list/ogata)：核实 6 月 6 日、东京、事务所与官方社交外链；不猜出生年。
- [宫野真守 2008 年履历](https://miyanomamoru.com/s/mm0608/diary/works/list?dy=2008)：核实《机动战士高达 00 第二季》与刹那·F·清英的配音关系。2008 属于第二季，不作为原系列起点。
