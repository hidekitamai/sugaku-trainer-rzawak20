// 設定（公開ページに載るので、氏名などの個人情報は書かない）
window.SUGAKU_CONFIG = {
  // Google フォームの送信先（作成後に記入。空なら記録は端末内だけ）
  formPostUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScI6PommdWOihmCuyPvwO2JdsrTY3zmca-j-i8peQiBo4JWjA/formResponse',
  formFields: { mode: 'entry.1635931720', score: 'entry.1652455196', log: 'entry.608954066' }, // 種類・点数・記録
  resendVer: 1, // 2026-10-10 フォーム未公開で届かなかった記録を全件送り直す
  // 既に使っている端末にも「リベンジ問題」を足す（ver を上げると次回起動時に1回だけ反映。1日4単元ずつ順に出す）
  // 2026-10-20 過去テスト（単元別・9月実施）の弱点5つ＝過去テスト±020　過去テスト読取メモ.md
  revengeAdd: { ver: 1, cards: [
    'c2-kagen.2', 'c1-add.1', 'c3-both.1', 'c1-add.2',                 // ①符号（ひく数・かっこ前のマイナス・移項）
    'c2-jouj.1', 'c2-mix.2', 'c3-kakko.1', 'c2-jouj.2', 'c3-kakko.2', 'c2-mix.1', // ②分配法則・かっこ外し
    'c2-atai.2', 'c1-mul.3',                                           // ③ −x² と (−x)²
    'c2-mix.3', 'c3-frac.1', 'c2-kagen.3', 'c3-frac.2', 'c3-both.3', 'c2-jouj.3', 'c3-frac.3', 'c3-hirei.2', // ④分数・小数
    'c2-ryou.3', 'c2-kankei.1', 'c3-riyou.1',                          // ⑤立式（ひく物をまとめる・関係式）
  ] },
  // 初回起動時に「リベンジ問題」として登録する単元（ワークで間違えた問題の型）
  seedRevenge: [
    'c2-ryou.1', 'c2-ryou.2', 'c2-kankei.1',             // 数量・関係を文字式で表す
    'c2-kagen.1', 'c2-kagen.2', 'c2-jouj.1', 'c2-jouj.3', // 符号のミス
    'c3-basic.1', 'c3-basic.3', 'c3-both.1', 'c3-both.2', 'c3-kakko.1', 'c3-frac.3',
  ],
};
// 2026-11-11 期末テストの範囲（2章 式の値〜／3章／4章 反比例まで／5章 1節 直線と図形）。新しい単元を「習った」に足し、範囲をそろえる
window.SUGAKU_CONFIG.learnAdd = { ver: 1, skills: ['c4-hirei', 'c4-hanpi', 'c4-zahyou', 'c5-chokusen'], range: ['2', '3', '4', '5'] };
// 予想テスト（過去のテストの型＝前半に計算の小問、後半に文章題・関数・図形。弱点の符号・かっこ・分数・−x² を多めに）
// 1問ごとに数字が変わる類題なので、同じ回を何度解いてもよい。
window.YOSOU = [
  { title: '期末 予想テスト 第1回', cards: [
    'c2-atai.2', 'c2-atai.3', 'c2-kagen.2', 'c2-jouj.1', 'c2-jouj.2', 'c2-mix.2', 'c2-mix.3',       // 文字の式
    'c3-basic.2', 'c3-both.2', 'c3-kakko.2', 'c3-frac.1', 'c3-frac.3', 'c3-hirei.2',                 // 方程式
    'c2-kankei.1', 'c3-riyou.1',                                                                    // 立式
    'c4-hirei.1', 'c4-hanpi.2', 'c4-zahyou.1', 'c4-zahyou.2',                                         // 比例・反比例
    'c5-chokusen.1', 'c5-chokusen.2', 'c5-chokusen.3'] },                                            // 平面図形
  { title: '期末 予想テスト 第2回', cards: [
    'c2-atai.1', 'c2-atai.2', 'c2-kagen.3', 'c2-jouj.3', 'c2-mix.1', 'c2-mix.2', 'c2-mix.3',
    'c3-basic.3', 'c3-both.3', 'c3-kakko.3', 'c3-frac.2', 'c3-hirei.1', 'c3-hirei.3',
    'c2-kankei.2', 'c3-riyou.2',
    'c4-hirei.2', 'c4-hanpi.1', 'c4-hanpi.3', 'c4-zahyou.3',
    'c5-chokusen.1', 'c5-chokusen.2', 'c5-chokusen.3'] },
  { title: '期末 予想テスト 第3回（仕上げ）', cards: [
    'c2-atai.2', 'c2-kagen.2', 'c2-jouj.2', 'c2-jouj.3', 'c2-mix.2', 'c2-mix.3', 'c2-kankei.3',
    'c3-both.1', 'c3-kakko.2', 'c3-kakko.3', 'c3-frac.1', 'c3-frac.3', 'c3-hirei.2',
    'c3-riyou.3', 'c3-riyou.1',
    'c4-hirei.3', 'c4-hanpi.2', 'c4-zahyou.2', 'c4-zahyou.3',
    'c5-chokusen.1', 'c5-chokusen.2', 'c5-chokusen.3'] },
];
