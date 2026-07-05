import type { Locale } from '@/i18n/config'

export const QUOTES = [
  'No one can move on without losing something',
  'I think, therefore I am — René Descartes',
  'Practice is the sole criterion for testing truth — Deng Xiaoping',
  'Everything has two sides — Vladimir Ilyich Lenin',
  'Stay hungry, Stay foolish — Steve Jobs',
  'You know who walks with you when the road gets rough',
  'Life is like the ocean; only those with a strong will can reach the other shore. — Karl Marx',
  'Til I reach the end, and then I will start again  — Zootopia',
  'In the infinite river of time, life is but a spark that vanishes in an instant',
  'The only impossible journey is the one you never begin — Tony Robbins',
  'Even the darkest night will end and the sun will rise — Les Misérables',
  'Only those who dare to fail greatly can ever achieve greatly — Robert F. Kennedy',
  'I am on my way to you, chasing after your name — Radwimps',
  'We are time fliers Scaling the walls of time, climber Tired of playing hide and seek with time and Always coming just short — Radwimps',
  'When you believe you can, the whole world conspires to help you — The Alchemist',
  'We shall never surrender — Winston Churchill',
  'I have nothing to offer but blood, toil, tears and sweat — Winston Churchill',
  'If what you have done yesterday still looks big to you, you haven\'t done much today — Mikhail Gorbachev',
  'Life is 10% what happens to you and 90% how you react to it — Charles R. Swindoll',
  'Be yourself; everyone else is already taken — Oscar Wilde',
  'The best time to plant a tree was 20 years ago. The second best time is now',
  'In the middle of difficulty lies opportunity — Albert Einstein',
  'The future belongs to those who believe in the beauty of their dreams — Eleanor Roosevelt',
  'Freedom has many difficulties and democracy is not perfect - John F. Kennedy',
  'Sometimes, letting go is the greatest courage. As long as the journey was brilliant, the journey itself is the ending. Ask me if I truly regret it — a little, yes. But the moment I turned away, that regret was scattered by the wind. — Anonymous',
] as const;

const QUOTES_ZH_HK = [
  '沒有人能在不失去些什麼的情況下繼續前行',
  '我思故我在 — 笛卡兒',
  '實踐是檢驗真理的唯一標準 — 鄧小平',
  '凡事皆有兩面 — 列寧',
  '求知若渴，虛懷若愚 — 史提夫·喬布斯',
  '路途艱難時，才知誰會真正與你同行',
  '人生猶如海洋，只有意志堅強者才能到達彼岸 — 馬克思',
  '走到盡頭，我會再重新出發 — 動物方城市',
  '在時間無盡的長河中，生命不過是一瞬即逝的火花',
  '唯一不可能的旅程，是你從未踏上的那段路 — 東尼·羅賓斯',
  '即使是最黑暗的夜晚也終將結束，太陽終將升起 — 悲慘世界',
  '唯有敢於大膽失敗的人，才能成就非凡 — 羅伯特·甘迺迪',
  '我正走向你，追尋著你的名字 — Radwimps',
  '我們是時間的飛翔者，攀越時間高牆，厭倦了與時間捉迷藏，卻總是差那麼一步 — Radwimps',
  '當你相信自己能做到，整個世界都會為你成全 — 牧羊少年奇幻之旅',
  '我們絕不投降 — 溫斯頓·邱吉爾',
  '我能奉獻的，只有鮮血、辛勞、淚水與汗水 — 溫斯頓·邱吉爾',
  '若昨日的成就今天看來仍顯偉大，那你今天做的還不夠 — 米哈伊爾·戈爾巴喬夫',
  '人生有一成取決於發生在你身上的事，另外九成取決於你如何應對 — 查爾斯·溫德爾',
  '做你自己；其他人都已有人在做了 — 奧斯卡·王爾德',
  '種樹最好的時機是二十年前，其次是現在',
  '困難之中蘊藏著機遇 — 愛因斯坦',
  '未來屬於那些相信夢想之美的人 — 愛蓮娜·羅斯福',
  '自由有諸多艱難，民主並非完美 — 約翰·甘迺迪',
  '有的時候 放棄才是最大的勇氣 只要過程是精彩的 那這個過程就是結局 你要問我真的很遺憾嗎 確實有點 當我掉頭 那種遺憾卻又被風吹散了 — 佚名',
] as const;

const QUOTES_JA_JP = [
  '何かを失わずして、前に進める者はいない',
  '我思う、ゆえに我あり — ルネ・デカルト',
  '実践は真理を検証する唯一の基準だ — 鄧小平',
  '物事にはすべて二面性がある — ウラジーミル・レーニン',
  'ハングリーであれ、愚直であれ — スティーブ・ジョブズ',
  '道が険しくなるとき、誰が本当に共に歩んでくれるかがわかる',
  '人生は海のようなもの、意志の強い者だけが対岸に辿り着ける — カール・マルクス',
  '終わりに辿り着いたら、また最初から始める — ズートピア',
  '無限の時の流れの中で、生命とはあっという間に消えゆく火花に過ぎない',
  '唯一不可能な旅は、始めることすらしない旅だ — トニー・ロビンズ',
  'どんなに暗い夜も必ず終わり、太陽は昇る — レ・ミゼラブル',
  '大きな失敗を恐れない者だけが、大きな成功を収めることができる — ロバート・ケネディ',
  '君のもとへ向かっている、君の名を追いかけながら — Radwimps',
  '僕らタイムフライヤー 時を駆け上がるクライマー 時のかくれんぼ はぐれっこはもういやなんだ — Radwimps',
  'できると信じれば、宇宙のすべてがあなたを助けようと動き出す — 錬金術師',
  '我々は決して降伏しない — ウィンストン・チャーチル',
  '私に提供できるのは、血と労苦と涙と汗だけだ — ウィンストン・チャーチル',
  '昨日の成果が今でも大きく見えるなら、今日はまだ十分にやっていない — ミハイル・ゴルバチョフ',
  '人生の10%は自分の身に起きることで、残りの90%はそれへの対応で決まる — チャールズ・スウィンドール',
  'あなた自身でありなさい。それ以外の人はもう誰かがやっている — オスカー・ワイルド',
  '木を植えるのに最良の時期は20年前。次に良いのは今だ',
  '困難の中にこそ、好機がある — アルベルト・アインシュタイン',
  '未来は、夢の美しさを信じる者たちのものだ — エレノア・ルーズベルト',
  '自由には多くの困難があり、民主主義は完璧ではない — ジョン・F・ケネディ',
  '時には、諦めることこそが最大の勇気だ。過程さえ輝いていれば、その過程こそが結末になる。本当に悔いはないかと訊かれれば、少しはある。だが振り返って歩き出した瞬間、その悔いは風に吹き散らされていた。 — 作者不詳',
] as const;

export const QUOTES_BY_LOCALE: Record<Locale, readonly string[]> = {
  'en-US': QUOTES,
  'zh-HK': QUOTES_ZH_HK,
  'ja-JP': QUOTES_JA_JP,
}

export const getRandomQuoteIndex = (): number => {
  return Math.floor(Math.random() * QUOTES.length);
};

export const getDifferentQuoteIndex = (currentIndex: number): number => {
  if (QUOTES.length <= 1) return currentIndex;

  let newIndex: number;
  do {
    newIndex = Math.floor(Math.random() * QUOTES.length);
  } while (newIndex === currentIndex);

  return newIndex;
};
