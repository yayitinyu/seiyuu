# Structured content model

内容独立于 React，放在 `content/archive.json`，TypeScript 约束与校验器在 `lib/` / `scripts/`。来源响应版本与人工审校分别记录在 `content/source-audit.json`、`content/locale-reviews.json`。文件格式就是未来数据库导入边界。

下表为目标逻辑模型。当前实现以 lib/types.ts 为准：Seiyuu 直接包含 introduction / tagline、timeline 和 activities；音乐、广播、舞台、游戏、旁白和奖项暂以带来源的 Activity 记录，无独立 Award / Radio / Music / Event 数据表；Evidence 保存 sourceIds / verified / confidence，字段值仍在人物对象。MediaAsset 有独立记录，肖像和音频通过人物 ID 关联；Relationship 从 Role 派生，未单独持久化。

| 实体 | 核心字段 / 关系 |
| --- | --- |
| Seiyuu | id, slug, names{ja,kana,romaji,zh}, aliases, agencyId, birth{month,day,year?}, birthplace, debutYear?, gender?, editorial{locale}, facts、timeline、activityIds、socialLinks |
| Agency | id, name, url；人物所属事实另带证据，后续增 membership 起止日期 |
| Character | id, names, animeId |
| Anime | id, slug, title{locale}, format, year?；系列和单季需要独立 ID |
| Role | id, seiyuuId, characterId, animeId, roleType?；官方未分类时只写配音，不能推断主役 |
| Award | id, name, edition, category, year?；由活动记录引用 |
| Radio / Music / Event | id, kind, title, role?, date?, url, evidence；事件覆盖舞台、演出和录音出版物 |
| Source | id, title, source_url, source_type, retrieved_at, verified, confidence；可有 public_url 用于遵守网站链接政策 |
| Evidence / Fact | value, sourceIds, verified, confidence；重要字段都有 field path 的证据映射 |
| Image | id, path, kind, creator, license, source, authorization?, alt, width, height；真人图为空时 imageStatus=IMAGE_LICENSE_TODO |
| MediaAsset（已实现） | id, personId, kind, filename, mimeType, sha256, rights{holder,authorizationRef,allowedUse,startsAt,endsAt,territories,attribution?}, reviewedBy, reviewedAt；肖像有三语 alt / width / height |
| SocialLink | platform, url, verifiedBySourceId；不要从用户名猜官网 |
| Relationship | fromType / fromId, toType / toId, relation, sourceIds；Graph 未来从 Role / affiliation 派生 |
| Conflict | entityId, field, assertions[{value,sourceId}], status, resolution?；不覆盖冲突 |

优先级：本人 > 事务所 > 作品官方 > 奖项官方 > 权威媒体 > Wikipedia > 数据库 > 社区。优先级不是自动消除冲突的算法。month/day 与完整 ISO 日期分开，只有年份已证实才输出 Person.birthDate；unknown 与 false 不混淆。

迁移到 PostgreSQL 时每实体独立表，role 外键连接，evidence(source_id, entity_type, entity_id, field_path) 多对多；localization 以 locale + entity_id 唯一键；JSONB 存原始取证摘要。检索别名进入规范化索引，可平滑替换当前纯函数检索。MVP 不接入 Supabase，因此不需要账户或环境凭据。

当前 `media` 数组为空，所有人物仍为 `IMAGE_LICENSE_TODO`。授权原件存仓库外，档案只保存可核对的引用。`source-audit.json` 保存每次不同的 HTTP 响应指纹和人工审核状态，不复制来源网页；三语审核摘要在共享内容变化时失效。详情见 [编辑工作流](editorial-workflow.md)。

初始 8 人：早見沙織（重点完整页，动画 / 音乐 / 广播 / 游戏）、津田健次郎（男性，旁白 / 真人表演）、花澤香菜（动画 / 广播 / 音乐）、宮野真守（男性，舞台 / 音乐 / 吹替）、悠木碧（动画 / 游戏）、高橋李依（较新世代、组合 / 动画）、緒方恵美（舞台转声优、音乐、跨性别角色表演）、野沢雅子（资深动画 / 旁白）。选择为检验模型，不是榜单。性别仅在来源明确时录入，不由角色或照片推断。
