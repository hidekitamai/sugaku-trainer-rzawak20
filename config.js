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
// 予想テスト（過去のテストをもとに作成したら、ここに追加する）
window.YOSOU = [];
