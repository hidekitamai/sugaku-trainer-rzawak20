// 類題ジェネレータ（中1数学）
// どの問題も「先に答えを決めてから問題を組み立てる」ので、答えは必ず正しい。
// 各問題は py（検算用の式）を持ち、tests\verify.py が sympy で全件を検算する。
'use strict';

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const NZ = (a, b) => { let v; do v = R(a, b); while (v === 0); return v; };
const P = arr => arr[R(0, arr.length - 1)];
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const frac = (n, d) => { if (d < 0) n = -n, d = -d; const g = gcd(n, d); n /= g; d /= g; return d === 1 ? `${n}` : `${n}/${d}`; };
const par = n => (n < 0 ? `(${n})` : `${n}`);              // 負の数はかっこ
const term = (a, v) => (a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`);
const lin = (a, b, v = 'x') => {                           // ax+b を教科書の書き方で
  if (a === 0) return `${b}`;
  const t = term(a, v);
  return b === 0 ? t : `${t}${b > 0 ? '+' : ''}${b}`;
};
const plusTerm = (a, v) => (a > 0 ? `+${term(a, v)}` : term(a, v)); // 2項目以降
const plusNum = b => (b > 0 ? `+${b}` : `${b}`);
const NAMES = ['りんご', 'みかん', 'ノート', 'ペン', 'パン', 'ジュース', 'ケーキ', 'ボール'];

// kind: solve（x=数）/ num（数）/ expr（文字式）/ func（y=式）/ choice（記号）/ rel（等式・不等式）
const SKILLS = [
  // ---------------- 1章 正の数・負の数 ----------------
  { id: 'c1-add', ch: '1', name: '正負の数の加法・減法', tiers: [
    () => { const a = NZ(-12, 12), b = NZ(-12, 12), op = P(['+', '-']);
      return { instr: '次の計算をしなさい。', q: `${par(a)}${op}${par(b)}`, kind: 'num', ans: `${op === '+' ? a + b : a - b}`, hint: 'ひく数の符号を変えて、たし算に直そう。' }; },
    () => { const n = [NZ(-15, 15), NZ(-15, 15), NZ(-15, 15), NZ(-15, 15)]; let q = `${n[0]}`, v = n[0];
      for (const x of n.slice(1)) { const op = P(['+', '-']); q += `${op}${par(x)}`; v += op === '+' ? x : -x; }
      return { instr: '次の計算をしなさい。', q, kind: 'num', ans: `${v}`, hint: '「-(-5)」は「+5」。かっこをはずして、正の項と負の項をそれぞれまとめよう。' }; },
    () => { const d1 = P([2, 3, 4, 6]), d2 = P([2, 3, 4, 6]); let a, b; do a = NZ(-5, 5); while (gcd(a, d1) !== 1); do b = NZ(-5, 5); while (gcd(b, d2) !== 1);
      return { instr: '次の計算をしなさい。', q: `${a < 0 ? '-' : ''}${Math.abs(a)}/${d1}-${b < 0 ? `(-${Math.abs(b)}/${d2})` : `${b}/${d2}`}`,
        py: `${a}/${d1}-(${b})/${d2}`, kind: 'num', ans: frac(a * d2 - b * d1, d1 * d2), hint: '通分してから計算しよう。答えは約分しておこう。' }; },
  ]},
  { id: 'c1-mul', ch: '1', name: '正負の数の乗法・除法', tiers: [
    () => { const a = NZ(-9, 9), b = NZ(-9, 9);
      return P([
        { instr: '次の計算をしなさい。', q: `${par(a)}×${par(b)}`, kind: 'num', ans: `${a * b}`, hint: '負の数が1個ならマイナス、2個ならプラス。' },
        { instr: '次の計算をしなさい。', q: `${par(a * b)}÷${par(b)}`, py: `(${a * b})/(${b})`, kind: 'num', ans: `${a}`, hint: '符号を先に決めてから、数を計算しよう。' }]); },
    () => { const a = NZ(-6, 6), b = NZ(-6, 6), c = NZ(-6, 6), p = a * b * c;
      return { instr: '次の計算をしなさい。', q: `${par(p)}÷${par(c)}×${par(1)}÷${par(b)}`.replace('×1', ''), py: `(${p})/(${c})/(${b})`, kind: 'num', ans: `${a}`, hint: '負の数がいくつあるかで、答えの符号が決まるよ。' }; },
    () => { const a = R(2, 5), k = NZ(-3, 3); const f = P([0, 1, 2]);
      if (f === 0) return { instr: '次の計算をしなさい。', q: `(-${a})^2×${par(k)}`, py: `(-${a})**2*(${k})`, kind: 'num', ans: `${a * a * k}`, hint: '(-3)²は(-3)×(-3)。' };
      if (f === 1) return { instr: '次の計算をしなさい。', q: `-${a}^2×${par(k)}`, py: `-(${a}**2)*(${k})`, kind: 'num', ans: `${-a * a * k}`, hint: '-3²は-(3×3)。(-3)²とのちがいに注意。' };
      return { instr: '次の計算をしなさい。', q: `(-${a})^3`, py: `(-${a})**3`, kind: 'num', ans: `${-(a ** 3)}`, hint: '負の数を3回かけると、符号はマイナス。' }; },
  ]},
  { id: 'c1-mix', ch: '1', name: '四則の混じった計算', tiers: [
    () => { const a = NZ(-10, 10), b = NZ(-6, 6), c = NZ(-6, 6);
      return { instr: '次の計算をしなさい。', q: `${a}+${par(b)}×${par(c)}`, py: `${a}+(${b})*(${c})`, kind: 'num', ans: `${a + b * c}`, hint: 'かけ算を先に計算しよう。' }; },
    () => { const a = NZ(-8, 8), b = NZ(-8, 8), c = NZ(-4, 4), e = NZ(-5, 5), d = e * NZ(-4, 4);
      return { instr: '次の計算をしなさい。', q: `(${a}-${par(b)})×${par(c)}-${par(d)}÷${par(e)}`, py: `((${a})-(${b}))*(${c})-(${d})/(${e})`, kind: 'num', ans: `${(a - b) * c - d / e}`, hint: 'かっこの中→かけ算・わり算→たし算・ひき算の順。' }; },
    () => { const a = NZ(-10, 10), b = R(2, 4), c = NZ(-3, 3);
      return { instr: '次の計算をしなさい。', q: `${a}-(-${b})^2×${par(c)}`, py: `${a}-(-${b})**2*(${c})`, kind: 'num', ans: `${a - b * b * c}`, hint: '累乗→かけ算→ひき算の順。' }; },
  ]},
  // ---------------- 2章 文字の式 ----------------
  { id: 'c2-hyouki', ch: '2', name: '文字式の表し方', tiers: [
    () => P([
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: 'x×x×x', py: 'x*x*x', kind: 'expr', ans: 'x^3', hint: '同じ文字の積は累乗の指数を使う。' },
      (() => { const k = NZ(-9, 9); return { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: `a×${par(k)}`, py: `a*(${k})`, kind: 'expr', ans: term(k, 'a'), hint: '数は文字の前に書く。1は省く。' }; })(),
      (() => { const k = R(2, 9); return { instr: '次の式を、分数の形で表しなさい。', q: `a÷${k}`, py: `a/${k}`, kind: 'expr', ans: `a/${k}`, hint: 'わり算は分数の形で書く。' }; })(),
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: 'y×x×(-1)', py: 'y*x*(-1)', kind: 'expr', ans: '-xy', hint: '-1は「-」だけ書く。文字はアルファベット順。' },
    ]),
    () => { const k = R(2, 7); return P([
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: `a×b÷${k}`, py: `a*b/${k}`, kind: 'expr', ans: `ab/${k}`, hint: '×は省いて、÷は分数に。' },
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: `(x+y)÷${k}`, py: `(x+y)/${k}`, kind: 'expr', ans: `(x+y)/${k}`, hint: '分子のかっこはつけたままでよい。' },
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: `x×${k}-y÷3`, py: `x*${k}-y/3`, kind: 'expr', ans: `${k}x-y/3`, hint: '項ごとに書き直そう。' }]); },
  ]},
  { id: 'c2-ryou', ch: '2', name: '数量を文字式で表す', tiers: [
    () => { const n = R(2, 8), m = R(2, 5), it = P(NAMES); return P([
      { instr: '次の数量を表す式を書きなさい。', q: `1個a円の${it}を${n}個買い、1000円出したときのおつり（円）`, py: `1000-${n}*a`, kind: 'expr', ans: `1000-${n}a`, hint: 'おつり＝出したお金－代金。' },
      { instr: '次の数量を表す式を書きなさい。', q: `1本x円のペン${n}本と、1冊y円のノート${m}冊の代金（円）`, py: `${n}*x+${m}*y`, kind: 'expr', ans: `${n}x+${m}y`, hint: '（1つの値段）×（個数）をそれぞれ求めてたす。' },
      { instr: '次の数量を表す式を書きなさい。', q: `時速a kmで${n}時間進んだときの道のり（km）`, py: `${n}*a`, kind: 'expr', ans: `${n}a`, hint: '道のり＝速さ×時間。' },
      { instr: '次の数量を表す式を書きなさい。', q: `x mのひもを${n}人で等しく分けたときの1人分の長さ（m）`, py: `x/${n}`, kind: 'expr', ans: `x/${n}`, hint: 'わり算は分数で表す。' }]); },
    () => { const p = R(1, 4), pc = P([3, 5, 8, 15, 20, 45]); return P([
      { instr: '次の数量を表す式を書きなさい。', q: `x円の品物を${p}割引きで買ったときの代金（円）`, py: `x*(10-${p})/10`, kind: 'expr', ans: frac(10 - p, 10).replace(/^(\d+)\/(\d+)$/, '$1x/$2').replace(/^(\d+)$/, '$1x'), hint: `${p}割引き＝もとの${10 - p}割。` },
      { instr: '次の数量を表す式を書きなさい。', q: `a人の${pc}%の人数（人）`, py: `a*${pc}/100`, kind: 'expr', ans: frac(pc, 100).replace(/^(\d+)\/(\d+)$/, '$1a/$2').replace(/^1a/, 'a'), hint: `${pc}%は${pc}/100。` },
      { instr: '次の数量を、[ ]の中の単位で表しなさい。', q: 'x kgの重さ [g]', py: '1000*x', kind: 'expr', ans: '1000x', hint: '1kg＝1000g。' },
      { instr: '次の数量を表す式を書きなさい。', q: 'x mの道のりを y分で歩いたときの速さ（分速 m）', py: 'x/y', kind: 'expr', ans: 'x/y', hint: '速さ＝道のり÷時間。' }]); },
    () => { const a = P([1000, 2000, 3000]), n = R(2, 6); return P([
      { instr: '次の数量を表す式を書きなさい。', q: `${a}円持っていて、1個x円の品物を${n}個と、y円の品物を1個買ったときの残りの金額（円）`, py: `${a}-${n}*x-y`, kind: 'expr', ans: `${a}-${n}x-y`, hint: '使ったお金をすべてひく。' },
      { instr: '次の数量を表す式を書きなさい。', q: '国語a点、数学b点、英語c点の3教科の平均点（点）', py: '(a+b+c)/3', kind: 'expr', ans: '(a+b+c)/3', hint: '平均＝合計÷個数。' },
      { instr: '次の数量を表す式を書きなさい。', q: `十の位の数がa、一の位の数がbの2けたの自然数`, py: '10*a+b', kind: 'expr', ans: '10a+b', hint: '45は10×4＋5と表せる。' }]); },
  ]},
  { id: 'c2-atai', ch: '2', name: '式の値', tiers: [
    () => { const x = NZ(-6, 6), a = NZ(-5, 5), b = NZ(-9, 9);
      return { instr: `x=${x}のとき、次の式の値を求めなさい。`, q: lin(a, b), py: `${a}*(${x})+(${b})`, kind: 'num', ans: `${a * x + b}`, hint: 'xに数を代入するとき、負の数はかっこをつけよう。' }; },
    () => { const x = NZ(-5, 5), f = P([0, 1, 2]);
      if (f === 0) return { instr: `x=${x}のとき、次の式の値を求めなさい。`, q: 'x^2', py: `(${x})**2`, kind: 'num', ans: `${x * x}`, hint: '(-3)²＝9。' };
      if (f === 1) return { instr: `x=${x}のとき、次の式の値を求めなさい。`, q: '-x^2', py: `-((${x})**2)`, kind: 'num', ans: `${-x * x}`, hint: '-x²は-(x²)。先にx²を計算。' };
      const k = NZ(-12, 12) * x; return { instr: `x=${x}のとき、次の式の値を求めなさい。`, q: `${k}/x`, py: `(${k})/(${x})`, kind: 'num', ans: `${k / x}`, hint: '分数はわり算。' }; },
    () => { const x = NZ(-4, 4), y = NZ(-4, 4), a = NZ(-5, 5), b = NZ(-5, 5);
      return { instr: `x=${x}、y=${y}のとき、次の式の値を求めなさい。`, q: `${term(a, 'x')}${plusTerm(b, 'y')}`, py: `${a}*(${x})+(${b})*(${y})`, kind: 'num', ans: `${a * x + b * y}`, hint: 'それぞれの文字に、かっこをつけて代入しよう。' }; },
  ]},
  { id: 'c2-kagen', ch: '2', name: '1次式の加法・減法', tiers: [
    () => { let a, b, c, d; do { a = NZ(-9, 9); b = NZ(-9, 9); c = NZ(-9, 9); d = NZ(-9, 9); } while (a + c === 0);
      return P([{ instr: '次の計算をしなさい。', q: `${term(a, 'x')}${plusTerm(c, 'x')}`, kind: 'expr', ans: lin(a + c, 0), hint: '同じ文字の項は係数をたす。' },
        { instr: '次の計算をしなさい。', q: `${lin(a, b)}${plusTerm(c, 'x')}${plusNum(d)}`, kind: 'expr', ans: lin(a + c, b + d), hint: '文字の項どうし、数の項どうしをまとめる。' }]); },
    () => { let a, b, c, d; do { a = NZ(-9, 9); b = NZ(-9, 9); c = NZ(-9, 9); d = NZ(-9, 9); } while (a - c === 0);
      const op = P(['+', '-']); const A = op === '+' ? a + c : a - c, B = op === '+' ? b + d : b - d;
      return { instr: '次の計算をしなさい。', q: `(${lin(a, b)})${op}(${lin(c, d)})`, kind: 'expr', ans: lin(A, B), hint: op === '-' ? '-( )をはずすと、中の符号がすべて変わる。' : '+( )はそのままかっこをはずせる。' }; },
    () => { const p = P([2, 3, 4]), q2 = P([3, 5, 6].filter(v => v !== p)); let a, b; do a = NZ(-3, 3); while (gcd(a, p) !== 1); do b = NZ(-3, 3); while (gcd(b, q2) !== 1);
      const fx = (c, d) => `${Math.abs(c) === 1 ? '' : Math.abs(c)}x/${d}`;
      return { instr: '次の計算をしなさい。', q: `${a < 0 ? '-' : ''}${fx(a, p)}${b > 0 ? '+' : '-'}${fx(b, q2)}`, py: `(${a})*x/${p}+(${b})*x/${q2}`, kind: 'expr', ans: (() => { const f = frac(a * q2 + b * p, p * q2); return f === '0' ? '0' : f.includes('/') ? f.replace(/^(-?)(\d+)\//, (m, s, n) => `${s}${n === '1' ? '' : n}x/`) : lin(+f, 0); })(), hint: '係数どうしを通分して計算しよう。' }; },
  ]},
  { id: 'c2-jouj', ch: '2', name: '1次式と数の乗法・除法', tiers: [
    () => { let k; do k = NZ(-9, 9); while (Math.abs(k) === 1); const a = NZ(-9, 9), b = NZ(-9, 9); return P([
      { instr: '次の計算をしなさい。', q: `${par(k)}×${term(a, 'x')}`.replace(/×(-.*)$/, '×($1)'), py: `(${k})*(${a})*x`, kind: 'expr', ans: lin(k * a, 0), hint: '数どうしをかけて、文字はそのまま。' },
      { instr: '次の計算をしなさい。', q: `${k}(${lin(a, b)})`, kind: 'expr', ans: lin(k * a, k * b), hint: '分配法則：かっこの中のすべての項にかける。' }]); },
    () => { const k = NZ(-6, 6), a = NZ(-5, 5), b = NZ(-5, 5); const p = R(2, 4), q2 = R(1, 5);
      return P([
        { instr: '次の計算をしなさい。', q: `(${lin(a, b)})×${par(k)}`, kind: 'expr', ans: lin(a * k, b * k), hint: '符号に注意して、両方の項にかける。' },
        { instr: '次の計算をしなさい。', q: `(${lin(a * k, b * k)})÷${par(k)}`, py: `(${a * k}*x+(${b * k}))/(${k})`, kind: 'expr', ans: lin(a, b), hint: 'わる数で、それぞれの項をわる。' },
        (() => { if (gcd(p, q2) !== 1) return { instr: '次の計算をしなさい。', q: `(${lin(a * 2, b * 2)})÷2`, py: `(${a * 2}*x+(${b * 2}))/2`, kind: 'expr', ans: lin(a, b), hint: 'それぞれの項を2でわる。' };
          return { instr: '次の計算をしなさい。', q: `(${lin(a * p, b * p)})÷${q2 === 1 ? p : `${p}/${q2}`}`, py: `(${a * p}*x+(${b * p}))/(${p}/${q2})`, kind: 'expr', ans: lin(a * q2, b * q2), hint: '分数でわるときは、逆数をかける。' }; })()]); },
    () => { const d = P([2, 3, 4, 5, 6]), m = NZ(-3, 3), a = NZ(-6, 6), b = NZ(-6, 6), k = d * m;
      return P([
        { instr: '次の計算をしなさい。', q: `(${lin(a, b)})/${d}×${par(k)}`, py: `(${a}*x+(${b}))/${d}*(${k})`, kind: 'expr', ans: lin(a * m, b * m), hint: '先に約分してから、分配法則を使おう。' },
        { instr: '次の計算をしなさい。', q: `${k}×(${lin(a, b)})/${d}`, py: `(${k})*(${a}*x+(${b}))/${d}`, kind: 'expr', ans: lin(a * m, b * m), hint: '先に約分しよう。' }]); },
  ]},
  { id: 'c2-mix', ch: '2', name: 'いろいろな1次式の計算', tiers: [
    () => { const m = R(2, 5), n = R(2, 5), a = NZ(-5, 5), b = NZ(-6, 6), c = NZ(-5, 5), d = NZ(-6, 6);
      return { instr: '次の計算をしなさい。', q: `${m}(${lin(a, b)})+${n}(${lin(c, d)})`, kind: 'expr', ans: lin(m * a + n * c, m * b + n * d), hint: 'かっこをはずしてから、同類項をまとめる。' }; },
    () => { let m, n, a, b, c, d; do { m = R(2, 5); n = -R(2, 5); a = NZ(-5, 5); b = NZ(-6, 6); c = NZ(-5, 5); d = NZ(-6, 6); } while (m * a + n * c === 0);
      return { instr: '次の計算をしなさい。', q: `${m}(${lin(a, b)})${n}(${lin(c, d)})`, kind: 'expr', ans: lin(m * a + n * c, m * b + n * d), hint: '-3( )は、中のすべての項に-3をかける。符号に注意。' }; },
    () => { const p = P([2, 3, 4]), q2 = P([3, 5, 6].filter(v => v !== p)), a = NZ(-4, 4), b = NZ(-4, 4), c = NZ(-4, 4), d = NZ(-4, 4);
      const L = p * q2 / gcd(p, q2), A = a * L / p - c * L / q2, B = b * L / p - d * L / q2, g = gcd(gcd(A, B), L);
      const num = lin(A / g, B / g), den = L / g;
      return { instr: '次の計算をしなさい。', q: `(${lin(a, b)})/${p}-(${lin(c, d)})/${q2}`, py: `(${a}*x+(${b}))/${p}-(${c}*x+(${d}))/${q2}`, kind: 'expr', ans: den === 1 ? num : (/[+-]/.test(num.slice(1)) ? `(${num})/${den}` : `${num}/${den}`), hint: '通分して、分子どうしを計算。ひく式の分子にはかっこを。' }; },
  ]},
  { id: 'c2-kankei', ch: '2', name: '関係を等式・不等式で表す', tiers: [
    () => { const n = R(2, 6), it = P(NAMES); return P([
      { instr: '次の数量の関係を、等式に表しなさい。', q: `1個x円の${it}を${n}個買って1000円出すと、おつりはy円だった。`, py: `Eq(1000-${n}*x,y)`, kind: 'rel', ans: `1000-${n}x=y`, hint: 'おつり＝出したお金－代金、を式にする。' },
      { instr: '次の数量の関係を、等式に表しなさい。', q: `a個のあめを、1人${n}個ずつb人に配ると、3個余った。`, py: `Eq(a,${n}*b+3)`, kind: 'rel', ans: `a=${n}b+3`, hint: '全部の数＝配った数＋余り。' }]); },
    () => { const n = R(2, 6), t = P([500, 1000, 1500]); return P([
      { instr: '次の数量の関係を、不等式に表しなさい。', q: `1個x円のパンを${n}個買うと、代金は${t}円より高い。`, py: `${n}*x>${t}`, kind: 'rel', ans: `${n}x>${t}`, hint: '「より高い」は＞。等号はつかない。' },
      { instr: '次の数量の関係を、不等式に表しなさい。', q: `x円のノート${n}冊と、y円のペン1本の代金の合計は、${t}円以下である。`, py: `${n}*x+y<=${t}`, kind: 'rel', ans: `${n}x+y≦${t}`, hint: '「以下」は≦（等しい場合もふくむ）。' }]); },
    () => { const k = R(3, 7); return P([
      { instr: '次の数量の関係を、等式に表しなさい。', q: `正の整数aを${k}でわったときの商はb、余りは2である。`, py: `Eq(a,${k}*b+2)`, kind: 'rel', ans: `a=${k}b+2`, hint: 'わられる数＝わる数×商＋余り。' },
      { instr: '次の数量の関係を、不等式に表しなさい。', q: `時速${k} kmでx時間歩いた道のりは、y kmより短い。`, py: `${k}*x<y`, kind: 'rel', ans: `${k}x<y`, hint: '道のり＝速さ×時間。「より短い」は＜。' }]); },
  ]},
  // ---------------- 3章 方程式 ----------------
  { id: 'c3-kai', ch: '3', name: '方程式の解', tiers: [
    () => { const s = NZ(-5, 5); const make = sol => { const a = NZ(-4, 4), b = NZ(-6, 6); return `${lin(a, b)}=${a * sol + b}`; };
      const opts = ['ア', 'イ', 'ウ', 'エ'], right = R(0, 3), others = [s + 1, s - 1, s + 2, -s || 3].filter(v => v !== s);
      const eqs = opts.map((o, i) => `${o}　${make(i === right ? s : others[i % others.length])}`);
      return { instr: `次のア〜エの方程式のうち、${s}が解であるものを選びなさい。`, q: eqs.join('\n'), kind: 'choice', ans: [opts[right]], opts, hint: 'xに数を代入して、左辺と右辺が等しくなるか確かめる。' }; },
  ]},
  { id: 'c3-basic', ch: '3', name: '方程式の解き方（基本）', tiers: [
    () => { const x = NZ(-9, 9), a = NZ(-9, 9), k = NZ(-6, 6); return P([
      { instr: '次の方程式を解きなさい。', q: `x${plusNum(a)}=${x + a}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: '両辺から同じ数をひいて（たして）、xだけにする。' },
      { instr: '次の方程式を解きなさい。', q: `${term(k, 'x')}=${k * x}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: '両辺をxの係数でわる。符号に注意。' }]); },
    () => { const x = NZ(-9, 9), a = NZ(-6, 6), b = NZ(-9, 9);
      return { instr: '次の方程式を解きなさい。', q: `${lin(a, b)}=${a * x + b}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: `数の項を移項してから、xの係数でわる。` }; },
    () => { const n = NZ(-9, 9), d = R(2, 9), a = NZ(-5, 5); if (gcd(n, d) !== 1) return { instr: '次の方程式を解きなさい。', q: `${term(d, 'x')}=${n}`, kind: 'solve', var: 'x', ans: `x=${frac(n, d)}` , hint: '両辺をxの係数でわる。答えは約分しよう。'};
      return P([{ instr: '次の方程式を解きなさい。', q: `${term(d * (a < 0 ? -1 : 1), 'x')}=${n * (a < 0 ? -1 : 1)}`, kind: 'solve', var: 'x', ans: `x=${frac(n, d)}`, hint: 'わり切れないときは分数で答える。' },
        { instr: '次の方程式を解きなさい。', q: `-x/${d}=${a}`, py: `Eq(-x/${d},${a})`, kind: 'solve', var: 'x', ans: `x=${-a * d}`, hint: '両辺に-' + d + 'をかける。' }]); },
  ]},
  { id: 'c3-both', ch: '3', name: '方程式の解き方（両辺にx）', tiers: [
    () => { let a, c; do { a = NZ(-8, 8); c = NZ(-8, 8); } while (a === c); const x = NZ(-6, 6), b = (c - a) * x;
      return { instr: '次の方程式を解きなさい。', q: `${lin(a, b)}=${term(c, 'x')}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'xの項を左辺に、数の項を右辺に移項する。移項すると符号が変わる。' }; },
    () => { let a, c; do { a = NZ(-8, 8); c = NZ(-8, 8); } while (a === c); const x = NZ(-8, 8), b = NZ(-12, 12), d = a * x + b - c * x;
      return { instr: '次の方程式を解きなさい。', q: `${lin(a, b)}=${lin(c, d)}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'ax＋b＝cx＋d → ax－cx＝d－b。' }; },
    () => { let a, c; do { a = NZ(-6, 6); c = NZ(-6, 6); } while (a === c); const x = NZ(-6, 6), b = NZ(-9, 9), d = a * x + b - c * x;
      const s = v => (v / 10).toString();
      return { instr: '次の方程式を解きなさい。', q: `${s(a)}x${b > 0 ? '+' : ''}${s(b)}=${s(c)}x${d >= 0 ? '+' : ''}${s(d)}`.replace(/^1x/, 'x'), py: `Eq(${a / 10}*x+${b / 10},${c / 10}*x+${d / 10})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: '両辺を10倍して、小数をなくそう。' }; },
  ]},
  { id: 'c3-kakko', ch: '3', name: 'かっこのある方程式', tiers: [
    () => { const k = NZ(-5, 5), x = NZ(-8, 8), b = NZ(-6, 6);
      return { instr: '次の方程式を解きなさい。', q: `${k}(x${plusNum(b)})=${k * (x + b)}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'かっこをはずすか、両辺をかっこの外の数でわる。' }; },
    () => { let k, m; do { k = NZ(-5, 5); m = NZ(-5, 5); } while (k === m); const x = NZ(-6, 6), b = NZ(-5, 5), d = NZ(-5, 5), e = k * (x + b) - m * (x + d);
      return { instr: '次の方程式を解きなさい。', q: `${k}(x${plusNum(b)})=${m}(x${plusNum(d)})${e ? plusNum(e) : ''}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'まずかっこをはずす。-( )の符号に注意。' }; },
    () => { let k, a, m, c; do { k = NZ(-4, 4); a = NZ(-3, 3); m = NZ(-4, 4); c = NZ(-3, 3); } while (k * a - m * c === 0); const x = NZ(-5, 5), b = NZ(-5, 5), d = NZ(-5, 5), g = k * (a * x + b) - m * (c * x + d);
      return { instr: '次の方程式を解きなさい。', q: `${k}(${lin(a, b)})${m > 0 ? '-' : '+'}${Math.abs(m)}(${lin(c, d)})=${g}`, py: `Eq(${k}*(${a}*x+(${b}))-(${m})*(${c}*x+(${d})),${g})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'かっこを2つともはずして、同類項をまとめてから移項。' }; },
  ]},
  { id: 'c3-frac', ch: '3', name: '分数をふくむ方程式', tiers: [
    () => { const d = R(2, 6), x = d * NZ(-5, 5), b = NZ(-6, 6);
      return { instr: '次の方程式を解きなさい。', q: `x/${d}${plusNum(b)}=${x / d + b}`, py: `Eq(x/${d}+(${b}),${x / d + b})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: `両辺に${d}をかけて、分母をはらう。` }; },
    () => { const p = P([2, 3, 4]), q2 = P([3, 5, 6].filter(v => v !== p)), L = p * q2 / gcd(p, q2), x = L * NZ(-4, 4), c = x / p - x / q2;
      return { instr: '次の方程式を解きなさい。', q: `x/${p}-x/${q2}=${c}`, py: `Eq(x/${p}-x/${q2},${c})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: `分母の最小公倍数${L}を両辺にかける。` }; },
    () => { let p, q2, a, c; do { p = R(2, 5); q2 = R(2, 6); a = NZ(-6, 6); c = NZ(-6, 6); } while (p === q2 || q2 - p === 0); const x = NZ(-6, 6);
      // (x+a)/p=(x+c)/q → q(x+a)=p(x+c) → x=(pc-qa)/(q-p)
      const num = p * c - q2 * a, den = q2 - p;
      return { instr: '次の方程式を解きなさい。', q: `(x${plusNum(a)})/${p}=(x${plusNum(c)})/${q2}`, py: `Eq((x+(${a}))/${p},(x+(${c}))/${q2})`, kind: 'solve', var: 'x', ans: `x=${frac(num, den)}`, hint: '両辺に分母の最小公倍数をかける。分子にはかっこを。', _x: x }; },
  ]},
  { id: 'c3-hirei', ch: '3', name: '比例式', tiers: [
    () => { const a = R(2, 9), b = R(2, 9), k = R(2, 6);
      return { instr: '次の比例式を解きなさい。', q: `${a}:${b}=x:${b * k}`, py: `Eq(${a}*${b * k},${b}*x)`, kind: 'solve', var: 'x', ans: `x=${a * k}`, hint: 'a:b=c:d ならば ad=bc。' }; },
    () => { const a = R(2, 9), b = R(2, 9), c = R(2, 9);
      return { instr: '次の比例式を解きなさい。', q: `x:${a}=${b}:${c}`, py: `Eq(x*${c},${a}*${b})`, kind: 'solve', var: 'x', ans: `x=${frac(a * b, c)}`, hint: '外側どうしの積＝内側どうしの積。' }; },
    () => { const b = R(2, 6), c = R(2, 6), a = NZ(-4, 4); let x; do x = NZ(-6, 8); while (x + a === 0); if ((x + a) * c % b) return { instr: '次の比例式を解きなさい。', q: `(x${plusNum(a)}):${b}=${(x + a) * c}:${b * c}`, py: `Eq((x+(${a}))*${b * c},${b}*${(x + a) * c})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'ad=bcを使い、かっこをはずして解く。' };
      return { instr: '次の比例式を解きなさい。', q: `(x${plusNum(a)}):${b}=${(x + a) * c / b}:${c}`, py: `Eq((x+(${a}))*${c},${b}*${(x + a) * c / b})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'ad=bcを使い、かっこをはずして解く。' }; },
  ]},
  { id: 'c3-riyou', ch: '3', name: '方程式の利用（文章題）', tiers: [
    () => { const a = P([60, 80, 90, 120, 150]), n = R(3, 9), b = P([100, 150, 200, 250]), it = P(['ペン', 'ノート', 'パン', 'ドーナツ']);
      return { instr: '方程式をつくって答えを求めなさい（答えだけ入力）。', q: `1個${a}円の${it}を何個かと、${b}円の箱を1つ買ったら、代金の合計は${a * n + b}円でした。${it}は何個買いましたか。`, py: `solve(Eq(${a}*x+${b},${a * n + b}),x)`, kind: 'num', ans: `${n}`, unit: '個', hint: `買った個数をx個として、${a}x＋${b}＝（代金）。` }; },
    () => { let a, b, c, d, n; do { a = R(2, 5); b = a + R(1, 3); n = R(5, 12); c = R(1, 9); d = b * n - (a * n + c); } while (d <= 0 || d > 15);
      return { instr: '方程式をつくって答えを求めなさい（答えだけ入力）。', q: `何人かの子どもにあめを配ります。1人に${a}個ずつ配ると${c}個余り、${b}個ずつ配ると${d}個たりません。子どもの人数は何人ですか。`, py: `solve(Eq(${a}*x+${c},${b}*x-${d}),x)`, kind: 'num', ans: `${n}`, unit: '人', hint: 'あめの数を2通りの式で表すと、等しい。' }; },
    () => { let v1, v2, m, t; do { v1 = P([50, 60, 70, 80]); v2 = P([100, 120, 150, 200, 240]); m = R(4, 15); t = v1 * m / (v2 - v1); } while (!(Number.isInteger(t) && t > 0 && t <= 30));
      return { instr: '方程式をつくって答えを求めなさい（答えだけ入力）。', q: `弟が分速${v1}mで家を出ました。その${m}分後に、兄が分速${v2}mで同じ道を追いかけました。兄は家を出てから何分後に弟に追いつきますか。`, py: `solve(Eq(${v2}*x,${v1}*(x+${m})),x)`, kind: 'num', ans: `${t}`, unit: '分後', hint: '追いつくとき、2人の進んだ道のりは等しい。兄がx分歩いたとすると、弟は（x＋' + m + '）分。' }; },
  ]},
  // ---------------- 4章 比例と反比例 ----------------
  { id: 'c4-hirei', ch: '4', name: '比例の式', tiers: [
    () => { const a = NZ(-6, 6), x = NZ(-5, 5);
      return { instr: 'yはxに比例し、次の条件を満たします。yをxの式で表しなさい。', q: `x=${x}のとき y=${a * x}`, py: `${a * x}/(${x})*x`, kind: 'func', ans: `y=${term(a, 'x')}`, hint: 'y=axに代入して、aを求める。' }; },
    () => { const a = NZ(-6, 6), x = NZ(-5, 5), x2 = NZ(-6, 6);
      return { instr: `yはxに比例し、x=${x}のとき y=${a * x} です。`, q: `x=${x2}のときのyの値を求めなさい。`, py: `${a * x}/(${x})*(${x2})`, kind: 'num', ans: `${a * x2}`, hint: 'まず式を求めてから、xを代入する。' }; },
    () => { let n, d; do { n = NZ(-5, 5); d = R(2, 4); } while (gcd(n, d) !== 1); const k = NZ(-2, 2), x = d * k;
      return { instr: 'yはxに比例し、次の条件を満たします。yをxの式で表しなさい。', q: `x=${x}のとき y=${n * k}`, py: `${n * k}/(${x})*x`, kind: 'func', ans: `y=${n < 0 ? '-' : ''}${Math.abs(n)}/${d}x`, hint: '比例定数が分数になることもある。' }; },
  ]},
  { id: 'c4-hanpi', ch: '4', name: '反比例の式', tiers: [
    () => { const a = NZ(-24, 24), xs = [1, 2, 3, 4, 6].filter(v => a % v === 0), x = P(xs) * P([1, -1]);
      return { instr: 'yはxに反比例し、次の条件を満たします。yをxの式で表しなさい。', q: `x=${x}のとき y=${a / x}`, py: `(${x})*(${a / x})/x`, kind: 'func', ans: `y=${a}/x`, hint: 'y=a/xなので、a=xy。' }; },
    () => { const a = P([12, 18, 24, 36, -12, -18, -24, -36]), d = [1, 2, 3, 4, 6, 9, 12].filter(v => a % v === 0), x = P(d), x2 = P(d) * P([1, -1]);
      return { instr: `yはxに反比例し、x=${x}のとき y=${a / x} です。`, q: `x=${x2}のときのyの値を求めなさい。`, py: `(${x})*(${a / x})/(${x2})`, kind: 'num', ans: `${a / x2}`, hint: 'まずa=xyを求めて、y=a/xにxを代入。' }; },
    () => { const a = NZ(-5, 5) * P([1, 2, 3]), f = P(['hirei', 'hanpi']);
      const xs = [1, 2, 3, 4], ys = xs.map(x => (f === 'hirei' ? a * x : frac(a * 12, x * 1)));
      if (f === 'hanpi') return { instr: '次の表は、yがxに比例または反比例する関係を表しています。yをxの式で表しなさい。', q: `x : 1, 2, 3, 4\ny : ${xs.map(x => frac(12 * a, x)).join(', ')}`, py: `${12 * a}/x`, kind: 'func', ans: `y=${12 * a}/x`, hint: 'xyが一定なら反比例、y/xが一定なら比例。' };
      return { instr: '次の表は、yがxに比例または反比例する関係を表しています。yをxの式で表しなさい。', q: `x : 1, 2, 3, 4\ny : ${ys.join(', ')}`, py: `${a}*x`, kind: 'func', ans: `y=${term(a, 'x')}`, hint: 'xyが一定なら反比例、y/xが一定なら比例。' }; },
  ]},
];

// 教科書・ワークの該当ページ（ワークの「教科書 p.○」表示と目次から。1章は教科書ページ未確認）
const PAGES = {
  'c1-add': { work: '12〜17' }, 'c1-mul': { work: '18〜23' }, 'c1-mix': { work: '24〜26' },
  'c2-hyouki': { kyo: '62〜63', work: '37' }, 'c2-ryou': { kyo: '60〜65', work: '36〜39' }, 'c2-atai': { kyo: '66〜68', work: '40〜41' },
  'c2-kagen': { kyo: '70〜74', work: '42〜45' }, 'c2-jouj': { kyo: '75〜77', work: '46〜49' }, 'c2-mix': { kyo: '70〜77', work: '50〜51' },
  'c2-kankei': { kyo: '78〜83', work: '52〜53' },
  'c3-kai': { kyo: '90〜93', work: '58〜59' }, 'c3-basic': { kyo: '90〜95', work: '58〜61' }, 'c3-both': { kyo: '94〜95', work: '60〜61' },
  'c3-kakko': { kyo: '96〜97', work: '62〜63' }, 'c3-frac': { kyo: '96〜97', work: '62〜64' }, 'c3-hirei': { kyo: '99〜100', work: '65' },
  'c3-riyou': { kyo: '102〜109', work: '68〜71' },
  'c4-hirei': { kyo: '120〜123', work: '80〜81' }, 'c4-hanpi': { kyo: '131〜133', work: '86〜87' },
};
for (const s of SKILLS) s.pages = PAGES[s.id] || {};
const pageText = (sid, short) => { const g = (SKILLS.find(s => s.id === sid) || {}).pages || {};
  return short ? (g.kyo ? `教p.${g.kyo}` : g.work ? `ワークp.${g.work}` : '')
    : [g.kyo && `教科書 p.${g.kyo}`, g.work && `ワーク p.${g.work}`].filter(Boolean).join('　'); };
const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));
const CHAPTERS = { '1': '1章 正の数・負の数', '2': '2章 文字の式', '3': '3章 方程式', '4': '4章 変化と対応' };

function makeProblem(cardId) {
  const [sid, t] = cardId.split('.');
  const s = SKILL[sid], tier = Math.min(+t, s.tiers.length);
  const p = s.tiers[tier - 1]();
  return { ...p, card: `${sid}.${tier}`, skill: sid, tier, sname: s.name, ch: s.ch };
}
if (typeof module !== 'undefined') module.exports = { SKILLS, SKILL, CHAPTERS, makeProblem, pageText };
