import type { Locale } from "@/lib/types";
export const journal: Record<Locale, { title: string; body: string }[]> = {
  "zh-CN": [
    {
      title: "先记住角色，再认识名字",
      body: "我们常常先记住一段台词，然后才在片尾的演职员表里，看见那个名字。Seiyuu 想在这两个瞬间之间，留一条可以走回去的路。点开一个角色，就能找到赋予它声音的人；沿着另一部作品，又能遇见一个新的名字。",
    },
    {
      title: "履历，也可以慢慢读",
      body: "档案不必从出生日期开始。你可以从一部看过的电影开始，从一张唱片开始，或从一个电台节目的名字开始。这里的时间轴只选取已经有来源的事件。没有记录的年份，不代表那一年没有故事，只表示我们还没有足够的资料。",
    },
    {
      title: "留白，是一种诚实",
      body: "一张漂亮的肖像、一段熟悉的声音，都有创作者和权利人。在获得许可前，我们用姓名与线条构成人物封面，让角色以文字出现。封面上的线条是装饰，并不是任何人的真实声纹。这些留白，也属于档案的一部分。",
    },
    {
      title: "让每条路都有出处",
      body: "重要信息的出处收在人物页末尾。你可以把档案当作阅读的起点，再前往本人、事务所或作品的官方页面。我们保留日文原名，提供中文与英文的阅读入口，也保留资料未公开或尚未核实的状态。一个值得留下来的档案，应该让人知道它从哪里来。",
    },
  ],
  "ja-JP": [
    {
      title: "キャラクターから、名前へ",
      body: "台詞を覚え、そのあとでエンドロールに名前を見つける。Seiyuuは、そのふたつの瞬間をつなぐ道を残したいと考えています。役柄から演じた人へ、そして別の作品へ。ひとつの声が、新しい出会いの入口になります。",
    },
    {
      title: "経歴を、ゆっくり読む",
      body: "誕生日から読む必要はありません。観た映画、聴いたレコード、ラジオの番組名からでも始められます。年表には出典を確認できた出来事だけを載せています。空白の年は、何もなかった年ではなく、まだ十分な資料がない年です。",
    },
    {
      title: "余白という誠実さ",
      body: "写真にも、録音にも、作り手と権利者がいます。許可を得るまでは、名前と線で人物の表紙をつくり、キャラクターは文字で紹介します。線は装飾であり、誰かの実際の声紋ではありません。この余白もアーカイブの一部です。",
    },
    {
      title: "出典へ続く道",
      body: "重要な情報の出典は人物ページの末尾にまとめています。ここを入口に、本人、事務所、作品の公式ページへ。日本語の名前を残し、中国語と英語でも読めるようにする。未公開や未確認という状態も、そのまま記録します。",
    },
  ],
  en: [
    {
      title: "From a character to a name",
      body: "We often remember a line before we notice a name in the end credits. Seiyuu keeps a path between those two moments. Follow a character to the person who voices them, then another work to a new name. A familiar voice becomes a place to begin.",
    },
    {
      title: "A career, read slowly",
      body: "You need not start with a birthday. Begin with a film you have seen, a record you have heard, or the title of a radio programme. Our timelines include only events supported by a source. An empty year means we do not yet have enough information, rather than that nothing happened.",
    },
    {
      title: "The honesty of empty space",
      body: "Portraits and recordings have creators and rights holders. Until we have permission, we build covers from names and lines, and present characters through typography. Those lines are decorative; they are not anyone's real voiceprint. These spaces are part of the archive, too.",
    },
    {
      title: "A path back to the source",
      body: "Important facts lead to references at the foot of each profile. Use the archive as a starting point, then visit the artist, agency or production's official pages. We preserve Japanese names and offer Chinese and English reading paths. We also preserve uncertainty: a lasting archive should show where its information comes from.",
    },
  ],
};
