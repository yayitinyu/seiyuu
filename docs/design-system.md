# Design system — 静かな記録

## 视觉定稿

采用同目录 `design/` 中的首页、人物、探索概念作为方向；执行由项目自主设计权确定，无需逐项确认。概念中的装饰性虚构引言、未核实人物、书籍植物插画不进入产品。所有封面以原生文字与声纹实现，正文只保留核验事实及明确原创编辑文字。

暖纸白 `#f5f3ee`；墨 `#252722`；正文次级灰 `#696b63`；细线 `#d5d3ca`；酒红 `#743b45`。夜间采用深墨绿纸面 `#191e1c`、暖灰白文字 `#edeae2`、浅玫瑰强调色 `#dba8ac`，封面保留各自配色。无玻璃、渐变光球或卡片外框。

## 排版

日文 display：本地嵌入少量首页主句字形的 Noto Serif JP（SIL OFL）；其余 `Yu Mincho / Hiragino Mincho ProN / Noto Serif CJK JP / serif`。中文 serif 用 `Songti SC / SimSun / serif`；body 和 UI 用系统字体 `Segoe UI / PingFang SC / Microsoft YaHei / sans-serif`。Latin logotype Georgia；数字 ui-monospace。每段原文注明 lang，避免依赖错误 glyph。

Desktop display 88–112px，profile 52–76px，section 32–44px，body 15–17px，metadata 11–13px；mobile display 48–64px、section 28px、body 15px。正文行高 1.85，UI 1.5，日文 heading 1.5。首屏主句不随机断字。主字体子集仅有限字符，font-display swap，不整包下载 CJK。

## 布局与组件

最大宽度 1440，桌面边距 56，平板 32，手机 22。间距基数 8；section 80–112 / mobile 56。细分割线，角半径只用于搜索对话框。Navigation / Footer / Search / SeiyuuPortrait / ProfileHeader / Metadata / CharacterCard / AnimeCard / Timeline / AgencyBadge / SourceCitation / LanguageSwitcher 各自单一职责。

首页允许首屏文字：seiyuu. 声優；探索声优 / 声音札记 / 关于；搜索、语言、主题；声を知る。人を知る。；每一个被记住的角色背后，都有一个值得认识的人。；翻开声音档案；A living archive of Japanese voices.；001 — 声音的入口。原始影像不加色调遮罩。

人物书封：姓名、档案号、罗马字、非生物识别的装饰线谱；不使用真人替身。角色展示用字体、编号与媒介，不使用未经许可的剧照。箭头与图标使用 1.5px SVG strokes。

## 交互与可访问性

主要触控按钮 44px，次级文本控件至少 24px，明显 focus-visible，skip link，语义标题。原生 dialog 提供焦点限制 / Escape / 返回焦点；搜索方向键与回车可用。筛选原生 select + details。没有自动声音和滚动劫持。hover 180ms，入场 450ms 一次，不循环移动正文。手机及 reduced-motion 禁用非必要动效。颜色不单独承载选中状态。

Lighthouse 四项 ≥95 是验收目标，必须记录实测，不能从设计推定。WCAG 2.2 AA 的完整合规还需要辅助技术人工复核。

## 实现与概念对照

以 `design/homepage.png`、`profile.png`、`continuation.png`、`explore.png` 为设计方向。实际页面与概念均通过图像查看工具对照；检查了 1440 / 1280 / 768 / 390px，并将首页与目录浏览器视口设为概念的 1505 × 1045。IAB 图片捕获受宿主面板限制，导出的该档截图为 1498 × 883，因此不宣称逐像素完整画布复刻；页面下半部通过滚动另行观察。

| 项目 | 概念证据 | 实现选择与差异处理 |
| --- | --- | --- |
| 首页文案与层级 | homepage：双行日文主句、中文引言、单一档案 CTA | 保留完整主句与 CTA；竖排补充句是本站原创编辑文案，不作为人物引言。与初始允许清单相比，该句补充列为有意差异；没有新增产品口号或虚构事实。 |
| 排版与留白 | homepage / profile：左字右图、人物左右双栏、细线节奏 | 保留构图与章法；系统字体回退不逐字复制概念字形。手机重排为单栏，封面改短横版，避免长姓名换列。 |
| 色彩与图片 | homepage：暖纸白、酒红强调、自然光影像 | 采用固定纸白与墨色，无渐变光球和图片蒙版；独立生成录音室源图，非概念截图裁图。 |
| 人物封面 | profile / continuation / explore：姓名书封、低饱和色 | 统一为代码原生姓名与装饰线谱。保留酒红、鼠尾草、米色、蓝灰；有意去除书籍实体阴影、植物插画、纹理及虚构引言，保证八人一致且不冒充肖像。 |
| 章节与关系 | continuation：选辑、墨色人物关系带、札记 | 保留三段顺序和容器形式；履历短文改为核验介绍或编辑短句，保留生日入口这一原始需求。 |
| 图标与控件 | explore：细线搜索、箭头、轻量筛选、搜索浮层 | 一致的自定义 SVG；加入用户要求的性别与具体出道年；浮层采用原生模态 dialog，居中显示以保证键盘焦点，未照搬右下示意浮层。 |
| 人物内容与来源 | profile：姓名、元信息、角色、页内导航 | 姓名与生日等由官方资料驱动；先放人物介绍再放角色，缺失事实留空。角色小字移除透明度，目录标题改为 h2，保持视觉同时修正可访问性。 |

已核对主句、导航、CTA、排版层级、纸色、图像裁切、线性图标和各章节间距。以上是有意设计差异；未发现阻挡阅读、内容溢出或不可操作的视觉问题。较完整的真人摄影方案仍取决于授权，不用假照片填补。
