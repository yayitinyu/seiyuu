# Domain strategy

2026-09-21：这是设计建议，不修改 DNS、不部署、不假定两个域名已经归属于本项目。

| 方案 | 品牌 / 认知 | SEO / 国际化 | 运营成本 |
| --- | --- | --- | --- |
| seiyuu.cn 中文，seiyuu.page 国际 | 中文地理联想明确，国际站用途清晰 | 两个主站要维护相互 hreflang、内容一致与独立站点信号 | 两套分发、监控与域名记忆成本 |
| seiyuu.page 三语主站，.cn 中文入口 301 | 单一品牌和链接；page 贴合数字刊物 | 一个 canonical 主机、按语言独立 URL，便于统一 sitemap | 较低，.cn 保留中文用户入口 |
| seiyuu.cn 三语主站，.page 301 | 中文核心强 | 国家域名地理信号更强，国际扩张需考虑 | 低，但国际定位不如通用域名自然 |

**建议第二种**：`seiyuu.page/zh-CN`、`/ja-JP`、`/en`；`.cn` 根路径跳中文首页，内部路径保留语义。初版中文默认，明确语言切换，不基于 IP 强行跳转。发布前由域名所有者确定主机，`NEXT_PUBLIC_SITE_URL` 可覆盖默认建议。

[Google 官方指南](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) 支持独立语言 URL 和 hreflang。每个翻译页面 self-canonical；不能把所有语言 canonical 到中文版。x-default 指向默认中文入口。

备案不能只由 .cn 后缀判断。实际服务主体、接入与部署地区应在上线前向接入商核实；中国境内非经营性互联网信息服务的备案要求参见[工信部管理办法](https://www.miit.gov.cn/gyhxxhb/jgsj/cyzcyfgs/bmgz/xxtxl/art/2024/art_84a0cfa0ebd049bbbe751dca9a008e56.html)。本轮未核查具体主体资格或主机服务，不承诺任何域名能自动完成备案。
