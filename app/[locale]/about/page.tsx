import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, isLocale, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { Arrow, Wave } from "@/components/icons";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(
    locale,
    "/about",
    dictionaries[locale].about,
    dictionaries[locale].footerNote,
  );
}
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictionaries[locale];
  return (
    <main id="main" className="shell about-page">
      <div className="about-heading">
        <span className="eyebrow">ABOUT SEIYUU</span>
        <h1>{d.aboutTitle}</h1>
        <Wave />
      </div>
      <div className="about-body">
        <p className="about-lead">
          {tr(
            locale,
            "从记住一个角色，走向认识赋予它声音的人。",
            "キャラクターを覚えることから、その声を演じる人を知ることへ。",
            "From remembering a character to knowing the person behind the voice.",
          )}
        </p>
        <section>
          <h2>
            {tr(
              locale,
              "一份持续生长的档案",
              "育ち続けるアーカイブ",
              "An archive that grows",
            )}
          </h2>
          <p>
            {tr(
              locale,
              "Seiyuu 是一座关于人、声音与记忆的独立数字档案馆。第一辑收录八位日本声优，以精选出演连接人物与作品。这里的编辑选择不是排名，精选履历也不代表全部工作。",
              "Seiyuuは、人と声と記憶のための独立したデジタルアーカイブです。第一輯には8人の日本の声優を収録。編集上の選択はランキングではなく、掲載作品は全経歴の一部です。",
              "Seiyuu is an independent digital archive of people, voices and memory. Its opening selection includes eight Japanese voice actors. Editorial selection is not a ranking, and selected credits do not represent a complete career.",
            )}
          </p>
        </section>
        <section>
          <h2>
            {tr(
              locale,
              "事实有出处，未知有留白",
              "事実には出典を、未知には余白を",
              "Sources for facts. Space for uncertainty.",
            )}
          </h2>
          <p>
            {tr(
              locale,
              "本人、事务所、动画与奖项官方资料优先。每个档案都保留来源与核验日期。只公开月日的生日不会补上年份；尚未核实的资料也不会被写成确定事实。中文名称与英文译名用于索引，不声称是权利人指定译法。",
              "本人、事務所、作品、賞の公式情報を優先し、出典と確認日を残します。月日だけの誕生日に年を補いません。翻訳名は検索のための表記で、権利者の指定表記を意味しません。",
              "Artist, agency, production and award sources come first. Each profile retains references and a review date. A birthday published without a year stays that way. Translated names serve discovery; they are not claimed to be rights-holder-approved localisations.",
            )}
          </p>
        </section>
        <section>
          <h2>
            {tr(
              locale,
              "关于影像与声音",
              "画像と音声について",
              "Images and sound",
            )}
          </h2>
          <p>
            {tr(
              locale,
              "人物封面与角色图版采用本站原创文字设计。首页的空录音室是 AI 生成的意象，不属于任何声优的真实工作空间。装饰线条不是生物识别声纹。本站不保存官方样本录音，也没有克隆声音；聆听入口前往官方页面。",
              "人物と役柄はオリジナルの文字デザインで紹介します。トップの録音室はAI生成のイメージで、実在の声優の仕事場ではありません。線は装飾です。音源の保存や声のクローンは行わず、公式ページへ案内します。",
              "Portrait covers and character panels are original typographic designs. The empty studio on the homepage is AI-generated imagery, not a real actor's workplace. Lines are decorative, not biometric voiceprints. We do not host official recordings or clone voices; listening links go to official pages.",
            )}
          </p>
        </section>
        <section>
          <h2>
            {tr(
              locale,
              "阅读与隐私",
              "閲覧とプライバシー",
              "Reading and privacy",
            )}
          </h2>
          <p>{d.privacy}</p>
        </section>
        <Link className="text-link" href={`/${locale}/seiyuu`}>
          {d.openArchive}
          <Arrow />
        </Link>
      </div>
    </main>
  );
}
