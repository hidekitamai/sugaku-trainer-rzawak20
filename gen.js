// 類題ジェネレータ（中1数学）
// どの問題も「先に答えを決めてから問題を組み立てる」ので、答えは必ず正しい。
// 各問題は py（検算用の式）を持ち、tests\verify.py が sympy で全件を検算する。
// steps＝正しい解き方の途中式（間違えたときに1行ずつ見せ、本人に「自分とちがった行」を選ばせる）。
//   1行は '式|説明'。説明だけの行は '|説明'。'@12:式' は「分母を12にそろえたときの分子」の行。
//   最後の行が答えでないときは makeProblem が答えを足す。verify.py が各行を答えと照らして検算する。
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
// ---- 途中式づくりの部品 ----
const ST = (...ls) => { const out = []; for (const l of ls) { if (!l) continue; const e = l.split('|')[0]; if (e && out.length && out[out.length - 1].split('|')[0] === e) continue; out.push(l); } return out; };
const px = (a, v = 'x') => (a === 1 ? v : a === -1 ? `(-${v})` : a < 0 ? `(${a}${v})` : `${a}${v}`); // かけ算の中の ax
const rhs = (c, t) => (c === 0 ? `${t}` : t === 0 ? `${c}` : `${c}${plusNum(t)}`);                    // c＋t の並び
const divLine = (a, c) => (a === 1 ? null : a === -1 ? `x=${-c}|両辺に-1をかける` : `x=${c}÷${par(a)}|両辺を${a}でわる`);
const kp = k => (k === 1 ? '' : k === -1 ? '-' : `${k}`); // かっこの前の係数（1は書かない）
const sgnCount = (...ns) => ns.filter(n => n < 0).length;
const sgnNote = k => `まず符号を決める（負の数が${k}個 → ${k % 2 ? '−' : '＋'}）`;
const fxS = (n, d) => (n === 0 ? '0' : `${n < 0 ? '-' : ''}${Math.abs(n) === 1 ? '' : Math.abs(n)}x/${d}`);
const fS = (n, d) => (n === 0 ? '0' : `${n < 0 ? '-' : ''}${Math.abs(n)}/${d}`);

// ---- 図（SVG）づくりの部品。線と文字は currentColor（暗い画面でも見える）。図の中身は座標から計算して作るので、答えと必ず一致する ----
const SV = (w, h, body) => `<svg viewBox="-22 -22 ${w + 44} ${h + 44}" width="${w + 44}" height="${h + 44}" xmlns="http://www.w3.org/2000/svg" font-family="serif" font-size="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">${body}</svg>`;
const ln = (x1, y1, x2, y2, ex = '') => `<line x1="${+x1.toFixed(1)}" y1="${+y1.toFixed(1)}" x2="${+x2.toFixed(1)}" y2="${+y2.toFixed(1)}" ${ex}/>`;
const tx = (x, y, t, ex = '') => `<text x="${+x.toFixed(1)}" y="${+y.toFixed(1)}" fill="currentColor" stroke="none" text-anchor="middle" dominant-baseline="middle" ${ex}>${t}</text>`;
const dot = (x, y) => `<circle cx="${+x.toFixed(1)}" cy="${+y.toFixed(1)}" r="3.2" fill="currentColor" stroke="none"/>`;
const thin = 'stroke-width="0.7" opacity="0.35"';
const gridSV = (n, u, body) => { let g = ''; for (let i = 0; i <= n; i++) g += ln(i * u, 0, i * u, n * u, thin) + ln(0, i * u, n * u, i * u, thin); return SV(n * u, n * u, g + body); };
// 座標平面（-L〜L）。X,Y で数学の座標→画面の位置
const plane = (L, u, body) => { const X = x => (x + L) * u, Y = y => (L - y) * u; let g = '';
  for (let i = -L; i <= L; i++) g += ln(X(i), 0, X(i), 2 * L * u, thin) + ln(0, Y(i), 2 * L * u, Y(i), thin);
  g += ln(0, Y(0), 2 * L * u, Y(0)) + ln(X(0), 0, X(0), 2 * L * u) + tx(2 * L * u + 8, Y(0), 'x', 'font-style="italic"') + tx(X(0), -8, 'y', 'font-style="italic"') + tx(X(0) - 9, Y(0) + 10, 'O', 'font-size="12"');
  for (const i of [-L + 1, 1, L - 1]) g += tx(X(i), Y(0) + 11, `${i}`.replace('-', '−'), 'font-size="11"') + tx(X(0) - 11, Y(i), `${i}`.replace('-', '−'), 'font-size="11"');
  return SV(2 * L * u, 2 * L * u, g + body(X, Y)); };
const pick4 = (trues, falses, minT = 1) => { // 正しい文・まちがいの文から4つ（正しいものを1つ以上ふくむ）
  let t; do t = R(minT, Math.min(3, trues.length)); while (4 - t > falses.length);
  const sh = a => a.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(v => v[1]);
  return sh([...sh(trues).slice(0, t).map(s => [s, true]), ...sh(falses).slice(0, 4 - t).map(s => [s, false])]); };
const KANA = ['ア', 'イ', 'ウ', 'エ'];
const choiceOf = (items, instr, extra = {}) => ({ instr, q: items.map((it, i) => `${KANA[i]}　${it[0]}`).join('\n'), kind: 'choice', opts: KANA.slice(0, items.length), ans: items.map((it, i) => (it[1] ? KANA[i] : null)).filter(Boolean),
  steps: items.map((it, i) => `|${KANA[i]}　${it[0]} → ${it[1] ? '正しい' : 'まちがい'}${it[2] ? `（${it[2]}）` : ''}`), ...extra });
// 2本の線分（点の組）が垂直か・平行か（座標で判定）
const vec = (P, Q) => [Q[0] - P[0], Q[1] - P[1]];
const isPerp = (a, b) => Math.abs(a[0] * b[0] + a[1] * b[1]) < 1e-9;
const isPara = (a, b) => Math.abs(a[0] * b[1] - a[1] * b[0]) < 1e-9;

// kind: solve（x=数）/ num（数）/ expr（文字式）/ func（y=式）/ choice（記号）/ rel（等式・不等式）
const SKILLS = [
  // ---------------- 1章 正の数・負の数 ----------------
  { id: 'c1-add', ch: '1', name: '正負の数の加法・減法', tiers: [
    () => { const a = NZ(-12, 12), b = NZ(-12, 12), op = P(['+', '-']), v = op === '+' ? a + b : a - b;
      return { instr: '次の計算をしなさい。', q: `${par(a)}${op}${par(b)}`, kind: 'num', ans: `${v}`, hint: 'ひく数の符号を変えて、たし算に直そう。',
        steps: ST(op === '-' ? `${par(a)}+${par(-b)}|ひく数の符号を変えて、たし算にする` : null, `${a}${plusNum(op === '+' ? b : -b)}|かっこをはずす`, `${v}|計算する`) }; },
    () => { const n = [NZ(-15, 15), NZ(-15, 15), NZ(-15, 15), NZ(-15, 15)]; let q = `${n[0]}`, v = n[0]; const sg = [n[0]];
      for (const x of n.slice(1)) { const op = P(['+', '-']); q += `${op}${par(x)}`; const s = op === '+' ? x : -x; v += s; sg.push(s); }
      const pos = sg.filter(s => s > 0).reduce((a, b) => a + b, 0), neg = sg.filter(s => s < 0).reduce((a, b) => a + b, 0);
      return { instr: '次の計算をしなさい。', q, kind: 'num', ans: `${v}`, hint: '「-(-5)」は「+5」。かっこをはずして、正の項と負の項をそれぞれまとめよう。',
        steps: ST(`${sg[0]}${sg.slice(1).map(plusNum).join('')}|かっこをはずす（−(−○)は＋○、−(＋○)は−○）`, pos && neg ? `${pos}-${-neg}|正の項、負の項をそれぞれまとめる` : null, `${v}|計算する`) }; },
    () => { const d1 = P([2, 3, 4, 6]), d2 = P([2, 3, 4, 6]); let a, b; do a = NZ(-5, 5); while (gcd(a, d1) !== 1); do b = NZ(-5, 5); while (gcd(b, d2) !== 1);
      const L = d1 * d2 / gcd(d1, d2), A = a * L / d1, B = b * L / d2;
      return { instr: '次の計算をしなさい。', q: `${a < 0 ? '-' : ''}${Math.abs(a)}/${d1}-${b < 0 ? `(-${Math.abs(b)}/${d2})` : `${b}/${d2}`}`,
        py: `${a}/${d1}-(${b})/${d2}`, kind: 'num', ans: frac(a * d2 - b * d1, d1 * d2), hint: '通分してから計算しよう。答えは約分しておこう。',
        steps: ST(b < 0 ? `${fS(a, d1)}+${-b}/${d2}|ひく数の符号を変えて、たし算にする` : null, `${fS(A, L)}${b < 0 ? '+' : '-'}${Math.abs(B)}/${L}|通分する（分母を${L}にそろえる）`, `${fS(A - B, L)}|分子を計算する`, `${frac(A - B, L)}|約分する`) }; },
  ]},
  { id: 'c1-mul', ch: '1', name: '正負の数の乗法・除法', tiers: [
    () => { const a = NZ(-9, 9), b = NZ(-9, 9);
      return P([
        { instr: '次の計算をしなさい。', q: `${par(a)}×${par(b)}`, kind: 'num', ans: `${a * b}`, hint: '負の数が1個ならマイナス、2個ならプラス。',
          steps: ST(`${a * b < 0 ? '-' : ''}${Math.abs(a)}×${Math.abs(b)}|${sgnNote(sgnCount(a, b))}`, `${a * b}|計算する`) },
        { instr: '次の計算をしなさい。', q: `${par(a * b)}÷${par(b)}`, py: `(${a * b})/(${b})`, kind: 'num', ans: `${a}`, hint: '符号を先に決めてから、数を計算しよう。',
          steps: ST(`${a < 0 ? '-' : ''}${Math.abs(a * b)}÷${Math.abs(b)}|${sgnNote(sgnCount(a * b, b))}`, `${a}|計算する`) }]); },
    () => { const a = NZ(-6, 6), b = NZ(-6, 6), c = NZ(-6, 6), p = a * b * c;
      return { instr: '次の計算をしなさい。', q: `${par(p)}÷${par(c)}×${par(1)}÷${par(b)}`.replace('×1', ''), py: `(${p})/(${c})/(${b})`, kind: 'num', ans: `${a}`, hint: '負の数がいくつあるかで、答えの符号が決まるよ。',
        steps: ST(`${a < 0 ? '-' : ''}${Math.abs(p)}÷${Math.abs(c)}÷${Math.abs(b)}|${sgnNote(sgnCount(p, c, b))}`, `${a}|計算する`) }; },
    () => { const a = R(2, 5), k = NZ(-3, 3); const f = P([0, 1, 2]);
      if (f === 0) return { instr: '次の計算をしなさい。', q: `(-${a})^2×${par(k)}`, py: `(-${a})**2*(${k})`, kind: 'num', ans: `${a * a * k}`, hint: '(-3)²は(-3)×(-3)。',
        steps: ST(`${a * a}×${par(k)}|累乗を先に：(-${a})^2＝(-${a})×(-${a})＝${a * a}`, `${a * a * k}|計算する`) };
      if (f === 1) return { instr: '次の計算をしなさい。', q: `-${a}^2×${par(k)}`, py: `-(${a}**2)*(${k})`, kind: 'num', ans: `${-a * a * k}`, hint: '-3²は-(3×3)。(-3)²とのちがいに注意。',
        steps: ST(`-${a * a}×${par(k)}|累乗：-${a}^2＝-(${a}×${a})＝-${a * a}。(-${a})^2とはちがう`, `${-a * a * k}|計算する`) };
      return { instr: '次の計算をしなさい。', q: `(-${a})^3`, py: `(-${a})**3`, kind: 'num', ans: `${-(a ** 3)}`, hint: '負の数を3回かけると、符号はマイナス。',
        steps: ST(`(-${a})×(-${a})×(-${a})|累乗：負の数を3回かけるので、符号は−`, `${-(a ** 3)}|計算する`) }; },
  ]},
  { id: 'c1-mix', ch: '1', name: '四則の混じった計算', tiers: [
    () => { const a = NZ(-10, 10), b = NZ(-6, 6), c = NZ(-6, 6);
      return { instr: '次の計算をしなさい。', q: `${a}+${par(b)}×${par(c)}`, py: `${a}+(${b})*(${c})`, kind: 'num', ans: `${a + b * c}`, hint: 'かけ算を先に計算しよう。',
        steps: ST(`${a}+${par(b * c)}|かけ算を先に計算する`, `${a + b * c}|計算する`) }; },
    () => { const a = NZ(-8, 8), b = NZ(-8, 8), c = NZ(-4, 4), e = NZ(-5, 5), d = e * NZ(-4, 4);
      return { instr: '次の計算をしなさい。', q: `(${a}-${par(b)})×${par(c)}-${par(d)}÷${par(e)}`, py: `((${a})-(${b}))*(${c})-(${d})/(${e})`, kind: 'num', ans: `${(a - b) * c - d / e}`, hint: 'かっこの中→かけ算・わり算→たし算・ひき算の順。',
        steps: ST(`${par(a - b)}×${par(c)}-${par(d)}÷${par(e)}|先に（ ）の中を計算する`, `${par((a - b) * c)}-${par(d / e)}|かけ算・わり算を先にする`, `${(a - b) * c - d / e}|計算する`) }; },
    () => { const a = NZ(-10, 10), b = R(2, 4), c = NZ(-3, 3);
      return { instr: '次の計算をしなさい。', q: `${a}-(-${b})^2×${par(c)}`, py: `${a}-(-${b})**2*(${c})`, kind: 'num', ans: `${a - b * b * c}`, hint: '累乗→かけ算→ひき算の順。',
        steps: ST(`${a}-${b * b}×${par(c)}|累乗を先に：(-${b})^2＝${b * b}`, `${a}-${par(b * b * c)}|かけ算を先にする`, `${a - b * b * c}|計算する`) }; },
  ]},
  // ---------------- 2章 文字の式 ----------------
  { id: 'c2-hyouki', ch: '2', name: '文字式の表し方', tiers: [
    () => P([
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: 'x×x×x', py: 'x*x*x', kind: 'expr', ans: 'x^3', hint: '同じ文字の積は累乗の指数を使う。', steps: ['x^3|同じ文字の積は、指数を使って書く'] },
      (() => { const k = NZ(-9, 9); return { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: `a×${par(k)}`, py: `a*(${k})`, kind: 'expr', ans: term(k, 'a'), hint: '数は文字の前に書く。1は省く。', steps: [`${term(k, 'a')}|数は文字の前に書く。1は省く`] }; })(),
      (() => { const k = R(2, 9); return { instr: '次の式を、分数の形で表しなさい。', q: `a÷${k}`, py: `a/${k}`, kind: 'expr', ans: `a/${k}`, hint: 'わり算は分数の形で書く。', steps: [`a/${k}|わり算は分数の形で書く`] }; })(),
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: 'y×x×(-1)', py: 'y*x*(-1)', kind: 'expr', ans: '-xy', hint: '-1は「-」だけ書く。文字はアルファベット順。',
        steps: ['-1×x×y|数を前に、文字はアルファベット順に並べて書く', '-xy|1は省いて「−」だけ書く'] },
    ]),
    () => { const k = R(2, 7); return P([
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: `a×b÷${k}`, py: `a*b/${k}`, kind: 'expr', ans: `ab/${k}`, hint: '×は省いて、÷は分数に。', steps: [`ab÷${k}|×を省いて書く`, `ab/${k}|÷は分数の形で書く`] },
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: `(x+y)÷${k}`, py: `(x+y)/${k}`, kind: 'expr', ans: `(x+y)/${k}`, hint: '分子のかっこはつけたままでよい。', steps: [`(x+y)/${k}|÷は分数の形で書く（分子は x+y のまとまり）`] },
      { instr: '次の式を、文字式の表し方にしたがって書きなさい。', q: `x×${k}-y÷3`, py: `x*${k}-y/3`, kind: 'expr', ans: `${k}x-y/3`, hint: '項ごとに書き直そう。', steps: [`${k}x-y÷3|×を省いて、数を文字の前に書く`, `${k}x-y/3|÷は分数の形で書く`] }]); },
  ]},
  { id: 'c2-ryou', ch: '2', name: '数量を文字式で表す', tiers: [
    () => { const n = R(2, 8), m = R(2, 5), it = P(NAMES); return P([
      { instr: '次の数量を表す式を書きなさい。', q: `1個a円の${it}を${n}個買い、1000円出したときのおつり（円）`, py: `1000-${n}*a`, kind: 'expr', ans: `1000-${n}a`, hint: 'おつり＝出したお金－代金。',
        steps: ['|ことばの式：おつり＝出したお金−代金', `1000-${n}×a|代金は ${n}×a 円`] },
      { instr: '次の数量を表す式を書きなさい。', q: `1本x円のペン${n}本と、1冊y円のノート${m}冊の代金（円）`, py: `${n}*x+${m}*y`, kind: 'expr', ans: `${n}x+${m}y`, hint: '（1つの値段）×（個数）をそれぞれ求めてたす。',
        steps: ['|ことばの式：代金＝ペンの代金＋ノートの代金', `${n}×x+${m}×y|（1つの値段）×（個数）をたす`] },
      { instr: '次の数量を表す式を書きなさい。', q: `時速a kmで${n}時間進んだときの道のり（km）`, py: `${n}*a`, kind: 'expr', ans: `${n}a`, hint: '道のり＝速さ×時間。',
        steps: ['|ことばの式：道のり＝速さ×時間', `a×${n}|速さ a に時間 ${n} をかける`] },
      { instr: '次の数量を表す式を書きなさい。', q: `x mのひもを${n}人で等しく分けたときの1人分の長さ（m）`, py: `x/${n}`, kind: 'expr', ans: `x/${n}`, hint: 'わり算は分数で表す。',
        steps: ['|ことばの式：1人分＝全体÷人数', `x÷${n}|全体 x を ${n} 人でわる`, `x/${n}|÷は分数の形で書く`] }]); },
    () => { const p = R(1, 4), pc = P([3, 5, 8, 15, 20, 45]); return P([
      { instr: '次の数量を表す式を書きなさい。', q: `x円の品物を${p}割引きで買ったときの代金（円）`, py: `x*(10-${p})/10`, kind: 'expr', ans: frac(10 - p, 10).replace(/^(\d+)\/(\d+)$/, '$1x/$2').replace(/^(\d+)$/, '$1x'), hint: `${p}割引き＝もとの${10 - p}割。`,
        steps: [`|ことばの式：${p}割引きの代金＝もとの値段の${10 - p}割`, `x×${10 - p}/10|${10 - p}割は ${10 - p}/10`] },
      { instr: '次の数量を表す式を書きなさい。', q: `a人の${pc}%の人数（人）`, py: `a*${pc}/100`, kind: 'expr', ans: frac(pc, 100).replace(/^(\d+)\/(\d+)$/, '$1a/$2').replace(/^1a/, 'a'), hint: `${pc}%は${pc}/100。`,
        steps: [`|ことばの式：${pc}%の人数＝全体×${pc}/100`, `a×${pc}/100|${pc}%は ${pc}/100`] },
      { instr: '次の数量を、[ ]の中の単位で表しなさい。', q: 'x kgの重さ [g]', py: '1000*x', kind: 'expr', ans: '1000x', hint: '1kg＝1000g。',
        steps: ['|ことばの式：1kg＝1000g なので、g の数＝kg の数×1000', 'x×1000'] },
      { instr: '次の数量を表す式を書きなさい。', q: 'x mの道のりを y分で歩いたときの速さ（分速 m）', py: 'x/y', kind: 'expr', ans: 'x/y', hint: '速さ＝道のり÷時間。',
        steps: ['|ことばの式：速さ＝道のり÷時間', 'x÷y', 'x/y|÷は分数の形で書く'] }]); },
    () => { const a = P([1000, 2000, 3000]), n = R(2, 6); return P([
      { instr: '次の数量を表す式を書きなさい。', q: `${a}円持っていて、1個x円の品物を${n}個と、y円の品物を1個買ったときの残りの金額（円）`, py: `${a}-${n}*x-y`, kind: 'expr', ans: `${a}-${n}x-y`, hint: '使ったお金をすべてひく。',
        steps: ['|ことばの式：残り＝持っていたお金−使ったお金（使ったお金は全部ひく）', `${a}-${n}×x-y`] },
      { instr: '次の数量を表す式を書きなさい。', q: '国語a点、数学b点、英語c点の3教科の平均点（点）', py: '(a+b+c)/3', kind: 'expr', ans: '(a+b+c)/3', hint: '平均＝合計÷個数。',
        steps: ['|ことばの式：平均＝合計÷個数', '(a+b+c)÷3|合計 a+b+c をまとめて 3 でわる'] },
      { instr: '次の数量を表す式を書きなさい。', q: `十の位の数がa、一の位の数がbの2けたの自然数`, py: '10*a+b', kind: 'expr', ans: '10a+b', hint: '45は10×4＋5と表せる。',
        steps: ['|ことばの式：45＝10×4＋5 と同じ形にする', '10×a+b'] }]); },
  ]},
  { id: 'c2-atai', ch: '2', name: '式の値', tiers: [
    () => { const x = NZ(-6, 6), a = NZ(-5, 5), b = NZ(-9, 9);
      return { instr: `x=${x}のとき、次の式の値を求めなさい。`, q: lin(a, b), py: `${a}*(${x})+(${b})`, kind: 'num', ans: `${a * x + b}`, hint: 'xに数を代入するとき、負の数はかっこをつけよう。',
        steps: ST(`${a}×${par(x)}${plusNum(b)}|負の数は、かっこをつけて代入する`, `${a * x}${plusNum(b)}|かけ算を先にする`, `${a * x + b}|計算する`) }; },
    () => { const x = NZ(-5, 5), f = P([0, 1, 2]);
      if (f === 0) return { instr: `x=${x}のとき、次の式の値を求めなさい。`, q: 'x^2', py: `(${x})**2`, kind: 'num', ans: `${x * x}`, hint: '(-3)²＝9。',
        steps: ST(`${par(x)}^2|かっこをつけて代入する`, `${par(x)}×${par(x)}|累乗：2回かける`, `${x * x}|計算する`) };
      if (f === 1) return { instr: `x=${x}のとき、次の式の値を求めなさい。`, q: '-x^2', py: `-((${x})**2)`, kind: 'num', ans: `${-x * x}`, hint: '-x²は-(x²)。先にx²を計算。',
        steps: ST(`-${par(x)}^2|かっこをつけて代入する（−はかっこの外）`, `-(${par(x)}×${par(x)})|累乗：先に2乗して、そのあと−をつける`, `${-x * x}|計算する`) };
      const k = NZ(-12, 12) * x; return { instr: `x=${x}のとき、次の式の値を求めなさい。`, q: `${k}/x`, py: `(${k})/(${x})`, kind: 'num', ans: `${k / x}`, hint: '分数はわり算。',
        steps: ST(`${k}÷${par(x)}|かっこをつけて代入する（分数はわり算）`, `${k / x}|計算する`) }; },
    () => { const x = NZ(-4, 4), y = NZ(-4, 4), a = NZ(-5, 5), b = NZ(-5, 5);
      return { instr: `x=${x}、y=${y}のとき、次の式の値を求めなさい。`, q: `${term(a, 'x')}${plusTerm(b, 'y')}`, py: `${a}*(${x})+(${b})*(${y})`, kind: 'num', ans: `${a * x + b * y}`, hint: 'それぞれの文字に、かっこをつけて代入しよう。',
        steps: ST(`${a}×${par(x)}+${par(b)}×${par(y)}|それぞれの文字に、かっこをつけて代入する`, `${a * x}${plusNum(b * y)}|かけ算を先にする`, `${a * x + b * y}|計算する`) }; },
  ]},
  { id: 'c2-kagen', ch: '2', name: '1次式の加法・減法', tiers: [
    () => { let a, b, c, d; do { a = NZ(-9, 9); b = NZ(-9, 9); c = NZ(-9, 9); d = NZ(-9, 9); } while (a + c === 0);
      return P([{ instr: '次の計算をしなさい。', q: `${term(a, 'x')}${plusTerm(c, 'x')}`, kind: 'expr', ans: lin(a + c, 0), hint: '同じ文字の項は係数をたす。',
          steps: ST(`(${a}${plusNum(c)})x|同類項：係数どうしを計算する`, lin(a + c, 0)) },
        { instr: '次の計算をしなさい。', q: `${lin(a, b)}${plusTerm(c, 'x')}${plusNum(d)}`, kind: 'expr', ans: lin(a + c, b + d), hint: '文字の項どうし、数の項どうしをまとめる。',
          steps: ST(`${term(a, 'x')}${plusTerm(c, 'x')}${plusNum(b)}${plusNum(d)}|同類項を並べる（文字の項、数の項）`, `${lin(a + c, b + d)}|同類項をまとめる`) }]); },
    () => { let a, b, c, d; do { a = NZ(-9, 9); b = NZ(-9, 9); c = NZ(-9, 9); d = NZ(-9, 9); } while (a - c === 0);
      const op = P(['+', '-']); const A = op === '+' ? a + c : a - c, B = op === '+' ? b + d : b - d, s = op === '+' ? 1 : -1;
      return { instr: '次の計算をしなさい。', q: `(${lin(a, b)})${op}(${lin(c, d)})`, kind: 'expr', ans: lin(A, B), hint: op === '-' ? '-( )をはずすと、中の符号がすべて変わる。' : '+( )はそのままかっこをはずせる。',
        steps: ST(`${lin(a, b)}${plusTerm(s * c, 'x')}${plusNum(s * d)}|${op === '-' ? '−( )をはずすと、中の符号がすべて変わる' : '＋( )は、そのままかっこをはずす'}`,
          `${term(a, 'x')}${plusTerm(s * c, 'x')}${plusNum(b)}${plusNum(s * d)}|同類項を並べる`, `${lin(A, B)}|同類項をまとめる`) }; },
    () => { const p = P([2, 3, 4]), q2 = P([3, 5, 6].filter(v => v !== p)); let a, b; do a = NZ(-3, 3); while (gcd(a, p) !== 1); do b = NZ(-3, 3); while (gcd(b, q2) !== 1);
      const fx = (c, d) => `${Math.abs(c) === 1 ? '' : Math.abs(c)}x/${d}`, L = p * q2 / gcd(p, q2), A = a * L / p, B = b * L / q2;
      return { instr: '次の計算をしなさい。', q: `${a < 0 ? '-' : ''}${fx(a, p)}${b > 0 ? '+' : '-'}${fx(b, q2)}`, py: `(${a})*x/${p}+(${b})*x/${q2}`, kind: 'expr', ans: (() => { const f = frac(a * q2 + b * p, p * q2); return f === '0' ? '0' : f.includes('/') ? f.replace(/^(-?)(\d+)\//, (m, s, n) => `${s}${n === '1' ? '' : n}x/`) : lin(+f, 0); })(), hint: '係数どうしを通分して計算しよう。',
        steps: ST(`${fxS(A, L)}${B < 0 ? '-' : '+'}${fxS(Math.abs(B), L)}|通分する（分母を${L}にそろえる）`, `${fxS(A + B, L)}|分子を計算する`) }; },
  ]},
  { id: 'c2-jouj', ch: '2', name: '1次式と数の乗法・除法', tiers: [
    () => { let k; do k = NZ(-9, 9); while (Math.abs(k) === 1); const a = NZ(-9, 9), b = NZ(-9, 9); return P([
      { instr: '次の計算をしなさい。', q: `${par(k)}×${term(a, 'x')}`.replace(/×(-.*)$/, '×($1)'), py: `(${k})*(${a})*x`, kind: 'expr', ans: lin(k * a, 0), hint: '数どうしをかけて、文字はそのまま。',
        steps: [`${par(k)}×${par(a)}×x|数どうしをかけて、文字はそのまま`] },
      { instr: '次の計算をしなさい。', q: `${k}(${lin(a, b)})`, kind: 'expr', ans: lin(k * a, k * b), hint: '分配法則：かっこの中のすべての項にかける。',
        steps: [`${par(k)}×${px(a)}+${par(k)}×${par(b)}|分配法則：かっこの中のすべての項にかける`] }]); },
    () => { const k = NZ(-6, 6), a = NZ(-5, 5), b = NZ(-5, 5); const p = R(2, 4), q2 = R(1, 5);
      return P([
        { instr: '次の計算をしなさい。', q: `(${lin(a, b)})×${par(k)}`, kind: 'expr', ans: lin(a * k, b * k), hint: '符号に注意して、両方の項にかける。',
          steps: [`${px(a)}×${par(k)}+${par(b)}×${par(k)}|分配法則：両方の項にかける（符号に注意）`] },
        { instr: '次の計算をしなさい。', q: `(${lin(a * k, b * k)})÷${par(k)}`, py: `(${a * k}*x+(${b * k}))/(${k})`, kind: 'expr', ans: lin(a, b), hint: 'わる数で、それぞれの項をわる。',
          steps: [`${px(a * k)}÷${par(k)}+${par(b * k)}÷${par(k)}|分配法則：それぞれの項を${k}でわる`] },
        (() => { if (gcd(p, q2) !== 1) return { instr: '次の計算をしなさい。', q: `(${lin(a * 2, b * 2)})÷2`, py: `(${a * 2}*x+(${b * 2}))/2`, kind: 'expr', ans: lin(a, b), hint: 'それぞれの項を2でわる。',
            steps: [`${px(a * 2)}÷2+${par(b * 2)}÷2|分配法則：それぞれの項を2でわる`] };
          if (q2 === 1) return { instr: '次の計算をしなさい。', q: `(${lin(a * p, b * p)})÷${p}`, py: `(${a * p}*x+(${b * p}))/${p}`, kind: 'expr', ans: lin(a, b), hint: 'それぞれの項をわる。',
            steps: [`${px(a * p)}÷${p}+${par(b * p)}÷${p}|分配法則：それぞれの項を${p}でわる`] };
          return { instr: '次の計算をしなさい。', q: `(${lin(a * p, b * p)})÷${p}/${q2}`, py: `(${a * p}*x+(${b * p}))/(${p}/${q2})`, kind: 'expr', ans: lin(a * q2, b * q2), hint: '分数でわるときは、逆数をかける。',
            steps: [`(${lin(a * p, b * p)})×${q2}/${p}|分数でわるときは、逆数をかける`, `${px(a * p)}×${q2}/${p}+${par(b * p)}×${q2}/${p}|分配法則：両方の項にかける`] }; })()]); },
    () => { const d = P([2, 3, 4, 5, 6]), m = NZ(-3, 3), a = NZ(-6, 6), b = NZ(-6, 6), k = d * m;
      const st = [`(${lin(a, b)})×${par(m)}|まず${d}で約分する（${k}÷${d}＝${m}）`, `${px(a)}×${par(m)}+${par(b)}×${par(m)}|分配法則：両方の項にかける`];
      return P([
        { instr: '次の計算をしなさい。', q: `(${lin(a, b)})/${d}×${par(k)}`, py: `(${a}*x+(${b}))/${d}*(${k})`, kind: 'expr', ans: lin(a * m, b * m), hint: '先に約分してから、分配法則を使おう。', steps: st },
        { instr: '次の計算をしなさい。', q: `${k}×(${lin(a, b)})/${d}`, py: `(${k})*(${a}*x+(${b}))/${d}`, kind: 'expr', ans: lin(a * m, b * m), hint: '先に約分しよう。', steps: st }]); },
  ]},
  { id: 'c2-mix', ch: '2', name: 'いろいろな1次式の計算', tiers: [
    () => { const m = R(2, 5), n = R(2, 5), a = NZ(-5, 5), b = NZ(-6, 6), c = NZ(-5, 5), d = NZ(-6, 6);
      return { instr: '次の計算をしなさい。', q: `${m}(${lin(a, b)})+${n}(${lin(c, d)})`, kind: 'expr', ans: lin(m * a + n * c, m * b + n * d), hint: 'かっこをはずしてから、同類項をまとめる。',
        steps: ST(`${lin(m * a, m * b)}${plusTerm(n * c, 'x')}${plusNum(n * d)}|分配法則でかっこをはずす`, `${term(m * a, 'x')}${plusTerm(n * c, 'x')}${plusNum(m * b)}${plusNum(n * d)}|同類項を並べる`, `${lin(m * a + n * c, m * b + n * d)}|同類項をまとめる`) }; },
    () => { let m, n, a, b, c, d; do { m = R(2, 5); n = -R(2, 5); a = NZ(-5, 5); b = NZ(-6, 6); c = NZ(-5, 5); d = NZ(-6, 6); } while (m * a + n * c === 0);
      return { instr: '次の計算をしなさい。', q: `${m}(${lin(a, b)})${n}(${lin(c, d)})`, kind: 'expr', ans: lin(m * a + n * c, m * b + n * d), hint: '-3( )は、中のすべての項に-3をかける。符号に注意。',
        steps: ST(`${lin(m * a, m * b)}${plusTerm(n * c, 'x')}${plusNum(n * d)}|分配法則：${n}( )は、中のすべての項に${n}をかける（符号に注意）`, `${term(m * a, 'x')}${plusTerm(n * c, 'x')}${plusNum(m * b)}${plusNum(n * d)}|同類項を並べる`, `${lin(m * a + n * c, m * b + n * d)}|同類項をまとめる`) }; },
    () => { const p = P([2, 3, 4]), q2 = P([3, 5, 6].filter(v => v !== p)), a = NZ(-4, 4), b = NZ(-4, 4), c = NZ(-4, 4), d = NZ(-4, 4);
      const L = p * q2 / gcd(p, q2), A = a * L / p - c * L / q2, B = b * L / p - d * L / q2, g = gcd(gcd(A, B), L);
      const num = lin(A / g, B / g), den = L / g, P1 = L / p, Q1 = L / q2;
      return { instr: '次の計算をしなさい。', q: `(${lin(a, b)})/${p}-(${lin(c, d)})/${q2}`, py: `(${a}*x+(${b}))/${p}-(${c}*x+(${d}))/${q2}`, kind: 'expr', ans: den === 1 ? num : (/[+-]/.test(num.slice(1)) ? `(${num})/${den}` : `${num}/${den}`), hint: '通分して、分子どうしを計算。ひく式の分子にはかっこを。',
        steps: ST(`|通分する：分母を${L}にそろえる`, `@${L}:${P1 === 1 ? '' : P1}(${lin(a, b)})-${Q1 === 1 ? '' : Q1}(${lin(c, d)})|分子：ひく式にはかっこをつける`,
          `@${L}:${lin(a * P1, b * P1)}${plusTerm(-c * Q1, 'x')}${plusNum(-d * Q1)}|分子のかっこをはずす（−の後ろは符号が変わる）`, `@${L}:${lin(A, B)}|同類項をまとめる`, g > 1 ? `|${g}で約分する` : null) }; },
  ]},
  { id: 'c2-kankei', ch: '2', name: '関係を等式・不等式で表す', tiers: [
    () => { const n = R(2, 6), it = P(NAMES); return P([
      { instr: '次の数量の関係を、等式に表しなさい。', q: `1個x円の${it}を${n}個買って1000円出すと、おつりはy円だった。`, py: `Eq(1000-${n}*x,y)`, kind: 'rel', ans: `1000-${n}x=y`, hint: 'おつり＝出したお金－代金、を式にする。',
        steps: ['|ことばの式：出したお金−代金＝おつり', `1000-${n}×x=y`] },
      { instr: '次の数量の関係を、等式に表しなさい。', q: `a個のあめを、1人${n}個ずつb人に配ると、3個余った。`, py: `Eq(a,${n}*b+3)`, kind: 'rel', ans: `a=${n}b+3`, hint: '全部の数＝配った数＋余り。',
        steps: ['|ことばの式：全部の数＝配った数＋余り', `a=${n}×b+3`] }]); },
    () => { const n = R(2, 6), t = P([500, 1000, 1500]); return P([
      { instr: '次の数量の関係を、不等式に表しなさい。', q: `1個x円のパンを${n}個買うと、代金は${t}円より高い。`, py: `${n}*x>${t}`, kind: 'rel', ans: `${n}x>${t}`, hint: '「より高い」は＞。等号はつかない。',
        steps: [`|ことばの式：代金＞${t}（「より高い」は＞）`, `${n}×x>${t}`] },
      { instr: '次の数量の関係を、不等式に表しなさい。', q: `x円のノート${n}冊と、y円のペン1本の代金の合計は、${t}円以下である。`, py: `${n}*x+y<=${t}`, kind: 'rel', ans: `${n}x+y≦${t}`, hint: '「以下」は≦（等しい場合もふくむ）。',
        steps: [`|ことばの式：代金の合計≦${t}（「以下」は≦。等しいときもふくむ）`, `${n}×x+y≦${t}`] }]); },
    () => { const k = R(3, 7); return P([
      { instr: '次の数量の関係を、等式に表しなさい。', q: `正の整数aを${k}でわったときの商はb、余りは2である。`, py: `Eq(a,${k}*b+2)`, kind: 'rel', ans: `a=${k}b+2`, hint: 'わられる数＝わる数×商＋余り。',
        steps: ['|ことばの式：わられる数＝わる数×商＋余り', `a=${k}×b+2`] },
      { instr: '次の数量の関係を、不等式に表しなさい。', q: `時速${k} kmでx時間歩いた道のりは、y kmより短い。`, py: `${k}*x<y`, kind: 'rel', ans: `${k}x<y`, hint: '道のり＝速さ×時間。「より短い」は＜。',
        steps: ['|ことばの式：道のり＜y（道のり＝速さ×時間、「より短い」は＜）', `${k}×x<y`] }]); },
  ]},
  // ---------------- 3章 方程式 ----------------
  { id: 'c3-kai', ch: '3', name: '方程式の解', tiers: [
    () => { const s = NZ(-5, 5); let hit; const make = (sol, keep) => { const a = NZ(-4, 4), b = NZ(-6, 6); if (keep) hit = { a, b }; return `${lin(a, b)}=${a * sol + b}`; };
      const opts = ['ア', 'イ', 'ウ', 'エ'], right = R(0, 3), others = [s + 1, s - 1, s + 2, -s || 3].filter(v => v !== s);
      const eqs = opts.map((o, i) => `${o}　${make(i === right ? s : others[i % others.length], i === right)}`);
      return { instr: `次のア〜エの方程式のうち、${s}が解であるものを選びなさい。`, q: eqs.join('\n'), kind: 'choice', ans: [opts[right]], opts, hint: 'xに数を代入して、左辺と右辺が等しくなるか確かめる。',
        steps: [`|xに${s}を代入して、左辺と右辺が同じ数になるか、1つずつ調べる`, `|${opts[right]}：左辺＝${hit.a}×${par(s)}${plusNum(hit.b)}＝${hit.a * s + hit.b}　→　右辺と同じなので、${s}は解`] }; },
  ]},
  { id: 'c3-basic', ch: '3', name: '方程式の解き方（基本）', tiers: [
    () => { const x = NZ(-9, 9), a = NZ(-9, 9), k = NZ(-6, 6); return P([
      { instr: '次の方程式を解きなさい。', q: `x${plusNum(a)}=${x + a}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: '両辺から同じ数をひいて（たして）、xだけにする。',
        steps: ST(`x=${rhs(x + a, -a)}|${a}を移項する（符号が変わる）`, `x=${x}|右辺を計算する`) },
      { instr: '次の方程式を解きなさい。', q: `${term(k, 'x')}=${k * x}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: '両辺をxの係数でわる。符号に注意。',
        steps: ST(divLine(k, k * x), `x=${x}`) }]); },
    () => { const x = NZ(-9, 9), a = NZ(-6, 6), b = NZ(-9, 9);
      return { instr: '次の方程式を解きなさい。', q: `${lin(a, b)}=${a * x + b}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: `数の項を移項してから、xの係数でわる。`,
        steps: ST(`${term(a, 'x')}=${rhs(a * x + b, -b)}|${b}を移項する（符号が変わる）`, `${term(a, 'x')}=${a * x}|右辺を計算する`, divLine(a, a * x), `x=${x}`) }; },
    () => { const n = NZ(-9, 9), d = R(2, 9), a = NZ(-5, 5); if (gcd(n, d) !== 1) return { instr: '次の方程式を解きなさい。', q: `${term(d, 'x')}=${n}`, kind: 'solve', var: 'x', ans: `x=${frac(n, d)}` , hint: '両辺をxの係数でわる。答えは約分しよう。',
        steps: ST(divLine(d, n), `x=${frac(n, d)}|答えは約分する`) };
      const s = a < 0 ? -1 : 1;
      return P([{ instr: '次の方程式を解きなさい。', q: `${term(d * s, 'x')}=${n * s}`, kind: 'solve', var: 'x', ans: `x=${frac(n, d)}`, hint: 'わり切れないときは分数で答える。',
          steps: ST(divLine(d * s, n * s), `x=${frac(n, d)}|わり切れないときは分数で答える`) },
        { instr: '次の方程式を解きなさい。', q: `-x/${d}=${a}`, py: `Eq(-x/${d},${a})`, kind: 'solve', var: 'x', ans: `x=${-a * d}`, hint: '両辺に-' + d + 'をかける。',
          steps: ST(`x=${a}×(-${d})|両辺に-${d}をかける`, `x=${-a * d}`) }]); },
  ]},
  { id: 'c3-both', ch: '3', name: '方程式の解き方（両辺にx）', tiers: [
    () => { let a, c; do { a = NZ(-8, 8); c = NZ(-8, 8); } while (a === c); const x = NZ(-6, 6), b = (c - a) * x;
      return { instr: '次の方程式を解きなさい。', q: `${lin(a, b)}=${term(c, 'x')}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'xの項を左辺に、数の項を右辺に移項する。移項すると符号が変わる。',
        steps: ST(`${term(a, 'x')}${plusTerm(-c, 'x')}=${-b}|移項する：xの項は左辺へ、数の項は右辺へ（符号が変わる）`, `${term(a - c, 'x')}=${-b}|同類項をまとめる`, divLine(a - c, -b), `x=${x}`) }; },
    () => { let a, c; do { a = NZ(-8, 8); c = NZ(-8, 8); } while (a === c); const x = NZ(-8, 8), b = NZ(-12, 12), d = a * x + b - c * x;
      return { instr: '次の方程式を解きなさい。', q: `${lin(a, b)}=${lin(c, d)}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'ax＋b＝cx＋d → ax－cx＝d－b。',
        steps: ST(`${term(a, 'x')}${plusTerm(-c, 'x')}=${rhs(d, -b)}|移項する：xの項は左辺へ、数の項は右辺へ（符号が変わる）`, `${term(a - c, 'x')}=${d - b}|同類項をまとめる`, divLine(a - c, d - b), `x=${x}`) }; },
    () => { let a, c; do { a = NZ(-6, 6); c = NZ(-6, 6); } while (a === c); const x = NZ(-6, 6), b = NZ(-9, 9), d = a * x + b - c * x;
      const s = v => (v / 10).toString();
      return { instr: '次の方程式を解きなさい。', q: `${s(a)}x${b > 0 ? '+' : ''}${s(b)}=${s(c)}x${d >= 0 ? '+' : ''}${s(d)}`.replace(/^1x/, 'x'), py: `Eq(${a / 10}*x+${b / 10},${c / 10}*x+${d / 10})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: '両辺を10倍して、小数をなくそう。',
        steps: ST(`${lin(a, b)}=${lin(c, d)}|両辺を10倍して、小数をなくす`, `${term(a, 'x')}${plusTerm(-c, 'x')}=${rhs(d, -b)}|移項する：xの項は左辺へ、数の項は右辺へ（符号が変わる）`, `${term(a - c, 'x')}=${d - b}|同類項をまとめる`, divLine(a - c, d - b), `x=${x}`) }; },
  ]},
  { id: 'c3-kakko', ch: '3', name: 'かっこのある方程式', tiers: [
    () => { const k = NZ(-5, 5), x = NZ(-8, 8), b = NZ(-6, 6), R0 = k * (x + b);
      return { instr: '次の方程式を解きなさい。', q: `${kp(k)}(x${plusNum(b)})=${R0}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'かっこをはずすか、両辺をかっこの外の数でわる。',
        steps: ST(`${lin(k, k * b)}=${R0}|分配法則でかっこをはずす`, `${term(k, 'x')}=${rhs(R0, -k * b)}|${k * b}を移項する（符号が変わる）`, `${term(k, 'x')}=${k * x}|右辺を計算する`, divLine(k, k * x), `x=${x}`) }; },
    () => { let k, m; do { k = NZ(-5, 5); m = NZ(-5, 5); } while (k === m); const x = NZ(-6, 6), b = NZ(-5, 5), d = NZ(-5, 5), e = k * (x + b) - m * (x + d);
      return { instr: '次の方程式を解きなさい。', q: `${kp(k)}(x${plusNum(b)})=${kp(m)}(x${plusNum(d)})${e ? plusNum(e) : ''}`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'まずかっこをはずす。-( )の符号に注意。',
        steps: ST(`${lin(k, k * b)}=${lin(m, m * d)}${e ? plusNum(e) : ''}|分配法則でかっこをはずす`, `${term(k, 'x')}${plusTerm(-m, 'x')}=${m * d}${e ? plusNum(e) : ''}${plusNum(-k * b)}|移項する：xの項は左辺へ、数の項は右辺へ（符号が変わる）`,
          `${term(k - m, 'x')}=${(k - m) * x}|同類項をまとめる`, divLine(k - m, (k - m) * x), `x=${x}`) }; },
    () => { let k, a, m, c; do { k = NZ(-4, 4); a = NZ(-3, 3); m = NZ(-4, 4); c = NZ(-3, 3); } while (k * a - m * c === 0); const x = NZ(-5, 5), b = NZ(-5, 5), d = NZ(-5, 5), g = k * (a * x + b) - m * (c * x + d);
      const A = k * a - m * c, B = k * b - m * d;
      return { instr: '次の方程式を解きなさい。', q: `${kp(k)}(${lin(a, b)})${m > 0 ? '-' : '+'}${kp(Math.abs(m))}(${lin(c, d)})=${g}`, py: `Eq(${k}*(${a}*x+(${b}))-(${m})*(${c}*x+(${d})),${g})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'かっこを2つともはずして、同類項をまとめてから移項。',
        steps: ST(`${lin(k * a, k * b)}${plusTerm(-m * c, 'x')}${plusNum(-m * d)}=${g}|分配法則でかっこを2つともはずす（−の後ろは符号が変わる）`, `${lin(A, B)}=${g}|同類項をまとめる`,
          B ? `${term(A, 'x')}=${rhs(g, -B)}|${B}を移項する（符号が変わる）` : null, `${term(A, 'x')}=${A * x}|右辺を計算する`, divLine(A, A * x), `x=${x}`) }; },
  ]},
  { id: 'c3-frac', ch: '3', name: '分数をふくむ方程式', tiers: [
    () => { const d = R(2, 6), x = d * NZ(-5, 5), b = NZ(-6, 6), c = x / d + b;
      return { instr: '次の方程式を解きなさい。', q: `x/${d}${plusNum(b)}=${c}`, py: `Eq(x/${d}+(${b}),${c})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: `両辺に${d}をかけて、分母をはらう。`,
        steps: ST(`x${plusNum(d * b)}=${d * c}|両辺に${d}をかけて、分母をはらう（数の項にもかける）`, `x=${rhs(d * c, -d * b)}|${d * b}を移項する（符号が変わる）`, `x=${x}|右辺を計算する`) }; },
    () => { const p = P([2, 3, 4]), q2 = P([3, 5, 6].filter(v => v !== p)), L = p * q2 / gcd(p, q2), x = L * NZ(-4, 4), c = x / p - x / q2;
      return { instr: '次の方程式を解きなさい。', q: `x/${p}-x/${q2}=${c}`, py: `Eq(x/${p}-x/${q2},${c})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: `分母の最小公倍数${L}を両辺にかける。`,
        steps: ST(`${term(L / p, 'x')}${plusTerm(-L / q2, 'x')}=${L * c}|両辺に${L}（分母の最小公倍数）をかけて、分母をはらう`, `${term(L / p - L / q2, 'x')}=${L * c}|同類項をまとめる`, divLine(L / p - L / q2, L * c), `x=${x}`) }; },
    () => { let p, q2, a, c; do { p = R(2, 5); q2 = R(2, 6); a = NZ(-6, 6); c = NZ(-6, 6); } while (p === q2 || q2 - p === 0); const x = NZ(-6, 6);
      // (x+a)/p=(x+c)/q → q(x+a)=p(x+c) → x=(pc-qa)/(q-p)
      const num = p * c - q2 * a, den = q2 - p, L = p * q2 / gcd(p, q2), P1 = L / p, Q1 = L / q2;
      return { instr: '次の方程式を解きなさい。', q: `(x${plusNum(a)})/${p}=(x${plusNum(c)})/${q2}`, py: `Eq((x+(${a}))/${p},(x+(${c}))/${q2})`, kind: 'solve', var: 'x', ans: `x=${frac(num, den)}`, hint: '両辺に分母の最小公倍数をかける。分子にはかっこを。', _x: x,
        steps: ST(`${P1 === 1 ? `x${plusNum(a)}` : `${P1}(x${plusNum(a)})`}=${Q1 === 1 ? `x${plusNum(c)}` : `${Q1}(x${plusNum(c)})`}|両辺に${L}をかけて、分母をはらう（分子にはかっこをつける）`, `${lin(P1, P1 * a)}=${lin(Q1, Q1 * c)}|分配法則でかっこをはずす`,
          `${term(P1, 'x')}${plusTerm(-Q1, 'x')}=${Q1 * c}${plusNum(-P1 * a)}|移項する：xの項は左辺へ、数の項は右辺へ（符号が変わる）`, `${term(P1 - Q1, 'x')}=${Q1 * c - P1 * a}|同類項をまとめる`, divLine(P1 - Q1, Q1 * c - P1 * a), `x=${frac(num, den)}|答えは約分する`) }; },
  ]},
  { id: 'c3-hirei', ch: '3', name: '比例式', tiers: [
    () => { const a = R(2, 9), b = R(2, 9), k = R(2, 6);
      return { instr: '次の比例式を解きなさい。', q: `${a}:${b}=x:${b * k}`, py: `Eq(${a}*${b * k},${b}*x)`, kind: 'solve', var: 'x', ans: `x=${a * k}`, hint: 'a:b=c:d ならば ad=bc。',
        steps: ST(`${a}×${b * k}=${b}×x|外側の積＝内側の積`, `${b}x=${a * b * k}|左右を入れかえて、計算する`, divLine(b, a * b * k), `x=${a * k}`) }; },
    () => { const a = R(2, 9), b = R(2, 9), c = R(2, 9);
      return { instr: '次の比例式を解きなさい。', q: `x:${a}=${b}:${c}`, py: `Eq(x*${c},${a}*${b})`, kind: 'solve', var: 'x', ans: `x=${frac(a * b, c)}`, hint: '外側どうしの積＝内側どうしの積。',
        steps: ST(`x×${c}=${a}×${b}|外側の積＝内側の積`, `${c}x=${a * b}|計算する`, divLine(c, a * b), `x=${frac(a * b, c)}|答えは約分する`) }; },
    () => { const b = R(2, 6), c = R(2, 6), a = NZ(-4, 4); let x; do x = NZ(-6, 8); while (x + a === 0);
      const tail = (C, Rv) => ST(`(x${plusNum(a)})×${C}=${b}×${par(Rv)}|外側の積＝内側の積`, `${lin(C, a * C)}=${b * Rv}|分配法則でかっこをはずす`, `${C}x=${rhs(b * Rv, -a * C)}|${a * C}を移項する（符号が変わる）`, `${C}x=${C * x}|右辺を計算する`, divLine(C, C * x), `x=${x}`);
      if ((x + a) * c % b) return { instr: '次の比例式を解きなさい。', q: `(x${plusNum(a)}):${b}=${(x + a) * c}:${b * c}`, py: `Eq((x+(${a}))*${b * c},${b}*${(x + a) * c})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'ad=bcを使い、かっこをはずして解く。', steps: tail(b * c, (x + a) * c) };
      return { instr: '次の比例式を解きなさい。', q: `(x${plusNum(a)}):${b}=${(x + a) * c / b}:${c}`, py: `Eq((x+(${a}))*${c},${b}*${(x + a) * c / b})`, kind: 'solve', var: 'x', ans: `x=${x}`, hint: 'ad=bcを使い、かっこをはずして解く。', steps: tail(c, (x + a) * c / b) }; },
  ]},
  { id: 'c3-riyou', ch: '3', name: '方程式の利用（文章題）', tiers: [
    () => { const a = P([60, 80, 90, 120, 150]), n = R(3, 9), b = P([100, 150, 200, 250]), it = P(['ペン', 'ノート', 'パン', 'ドーナツ']);
      return { instr: '方程式をつくって答えを求めなさい（答えだけ入力）。', q: `1個${a}円の${it}を何個かと、${b}円の箱を1つ買ったら、代金の合計は${a * n + b}円でした。${it}は何個買いましたか。`, py: `solve(Eq(${a}*x+${b},${a * n + b}),x)`, kind: 'num', ans: `${n}`, unit: '個', hint: `買った個数をx個として、${a}x＋${b}＝（代金）。`,
        steps: [`${a}x+${b}=${a * n + b}|買った個数をx個とする。${it}の代金＋箱の代金＝合計`, `${a}x=${a * n + b}-${b}|${b}を移項する（符号が変わる）`, `${a}x=${a * n}|右辺を計算する`, `x=${n}|両辺を${a}でわる`] }; },
    () => { let a, b, c, d, n; do { a = R(2, 5); b = a + R(1, 3); n = R(5, 12); c = R(1, 9); d = b * n - (a * n + c); } while (d <= 0 || d > 15);
      return { instr: '方程式をつくって答えを求めなさい（答えだけ入力）。', q: `何人かの子どもにあめを配ります。1人に${a}個ずつ配ると${c}個余り、${b}個ずつ配ると${d}個たりません。子どもの人数は何人ですか。`, py: `solve(Eq(${a}*x+${c},${b}*x-${d}),x)`, kind: 'num', ans: `${n}`, unit: '人', hint: 'あめの数を2通りの式で表すと、等しい。',
        steps: ST(`${a}x+${c}=${b}x-${d}|子どもの人数をx人とする。あめの数を2通りの式で表すと等しい（余り＝＋、たりない＝−）`, `${a}x-${b}x=-${d}-${c}|移項する：xの項は左辺へ、数の項は右辺へ（符号が変わる）`, `${term(a - b, 'x')}=${-d - c}|同類項をまとめる`, divLine(a - b, -d - c), `x=${n}`) }; },
    () => { let v1, v2, m, t; do { v1 = P([50, 60, 70, 80]); v2 = P([100, 120, 150, 200, 240]); m = R(4, 15); t = v1 * m / (v2 - v1); } while (!(Number.isInteger(t) && t > 0 && t <= 30));
      return { instr: '方程式をつくって答えを求めなさい（答えだけ入力）。', q: `弟が分速${v1}mで家を出ました。その${m}分後に、兄が分速${v2}mで同じ道を追いかけました。兄は家を出てから何分後に弟に追いつきますか。`, py: `solve(Eq(${v2}*x,${v1}*(x+${m})),x)`, kind: 'num', ans: `${t}`, unit: '分後', hint: '追いつくとき、2人の進んだ道のりは等しい。兄がx分歩いたとすると、弟は（x＋' + m + '）分。',
        steps: [`${v2}x=${v1}(x+${m})|兄が歩いた時間をx分とする（弟はx＋${m}分）。追いつくとき、2人の道のりは等しい`, `${v2}x=${v1}x+${v1 * m}|分配法則でかっこをはずす`, `${v2}x-${v1}x=${v1 * m}|移項する（符号が変わる）`, `${v2 - v1}x=${v1 * m}|同類項をまとめる`, `x=${t}|両辺を${v2 - v1}でわる`] }; },
  ]},
  // ---------------- 4章 比例と反比例 ----------------
  { id: 'c4-hirei', ch: '4', name: '比例の式', tiers: [
    () => { const a = NZ(-6, 6), x = NZ(-5, 5);
      return { instr: 'yはxに比例し、次の条件を満たします。yをxの式で表しなさい。', q: `x=${x}のとき y=${a * x}`, py: `${a * x}/(${x})*x`, kind: 'func', ans: `y=${term(a, 'x')}`, hint: 'y=axに代入して、aを求める。',
        steps: [`|y＝axに、x＝${x}、y＝${a * x} を代入する：${a * x}＝a×${par(x)}`, `|a＝${a * x}÷${par(x)}＝${a}`] }; },
    () => { const a = NZ(-6, 6), x = NZ(-5, 5); let x2; do x2 = NZ(-6, 6); while (x2 === x); // 条件と同じxは聞かない
      return { instr: `yはxに比例し、x=${x}のとき y=${a * x} です。`, q: `x=${x2}のときのyの値を求めなさい。`, py: `${a * x}/(${x})*(${x2})`, kind: 'num', ans: `${a * x2}`, hint: 'まず式を求めてから、xを代入する。',
        steps: [`|y＝axに代入する：${a * x}＝a×${par(x)} より、a＝${a}`, `|式は y＝${term(a, 'x')}`, `${a}×${par(x2)}|x＝${x2}を、かっこをつけて代入する`] }; },
    () => { let n, d; do { n = NZ(-5, 5); d = R(2, 4); } while (gcd(n, d) !== 1); const k = NZ(-2, 2), x = d * k;
      return { instr: 'yはxに比例し、次の条件を満たします。yをxの式で表しなさい。', q: `x=${x}のとき y=${n * k}`, py: `${n * k}/(${x})*x`, kind: 'func', ans: `y=${n < 0 ? '-' : ''}${Math.abs(n)}/${d}x`, hint: '比例定数が分数になることもある。',
        steps: [`|y＝axに、x＝${x}、y＝${n * k} を代入する：${n * k}＝a×${par(x)}`, `|a＝${n * k}÷${par(x)}＝${frac(n, d)}（分数になることもある）`] }; },
  ]},
  { id: 'c4-hanpi', ch: '4', name: '反比例の式', tiers: [
    () => { const a = NZ(-24, 24), xs = [1, 2, 3, 4, 6].filter(v => a % v === 0), x = P(xs) * P([1, -1]);
      return { instr: 'yはxに反比例し、次の条件を満たします。yをxの式で表しなさい。', q: `x=${x}のとき y=${a / x}`, py: `(${x})*(${a / x})/x`, kind: 'func', ans: `y=${a}/x`, hint: 'y=a/xなので、a=xy。',
        steps: ['|y＝a/x の形なので、a＝x×y', `|a＝${par(x)}×${par(a / x)}＝${a}（かっこをつけて代入する）`] }; },
    () => { const a = P([12, 18, 24, 36, -12, -18, -24, -36]), d = [1, 2, 3, 4, 6, 9, 12].filter(v => a % v === 0), x = P(d); let x2; do x2 = P(d) * P([1, -1]); while (x2 === x); // 条件と同じxは聞かない
      return { instr: `yはxに反比例し、x=${x}のとき y=${a / x} です。`, q: `x=${x2}のときのyの値を求めなさい。`, py: `(${x})*(${a / x})/(${x2})`, kind: 'num', ans: `${a / x2}`, hint: 'まずa=xyを求めて、y=a/xにxを代入。',
        steps: [`|a＝x×y＝${x}×${par(a / x)}＝${a}`, `|式は y＝${a}/x`, `${a}÷${par(x2)}|x＝${x2}を、かっこをつけて代入する（分数はわり算）`] }; },
    () => { const a = NZ(-5, 5) * P([1, 2, 3]), f = P(['hirei', 'hanpi']);
      const xs = [1, 2, 3, 4], ys = xs.map(x => (f === 'hirei' ? a * x : frac(a * 12, x * 1)));
      if (f === 'hanpi') return { instr: '次の表は、yがxに比例または反比例する関係を表しています。yをxの式で表しなさい。', q: `x : 1, 2, 3, 4\ny : ${xs.map(x => frac(12 * a, x)).join(', ')}`, py: `${12 * a}/x`, kind: 'func', ans: `y=${12 * a}/x`, hint: 'xyが一定なら反比例、y/xが一定なら比例。',
        steps: [`|x×y を調べると、どれも ${12 * a} で一定 → 反比例（y＝a/x）`, `|a＝${12 * a}`] };
      return { instr: '次の表は、yがxに比例または反比例する関係を表しています。yをxの式で表しなさい。', q: `x : 1, 2, 3, 4\ny : ${ys.join(', ')}`, py: `${a}*x`, kind: 'func', ans: `y=${term(a, 'x')}`, hint: 'xyが一定なら反比例、y/xが一定なら比例。',
        steps: [`|y÷x を調べると、どれも ${a} で一定 → 比例（y＝ax）`, `|a＝${a}`] }; },
  ]},
  { id: 'c4-zahyou', ch: '4', name: '座標と比例・反比例のグラフ', tiers: [
    () => { let a, b; do { a = NZ(-4, 4); b = NZ(-4, 4); } while (Math.abs(a) === Math.abs(b));
      const fig = plane(5, 20, (X, Y) => dot(X(a), Y(b)) + tx(X(a) + 10, Y(b) - 11, 'P', 'font-style="italic"'));
      const items = [[a, b], [b, a], [-a, b], [a, -b]].map((s, i) => [`(${s[0]}, ${s[1]})`, i === 0]).map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(v => v[1]);
      return { ...choiceOf(items, '図の点Pの座標を選びなさい。'), fig, hint: '座標は（x座標, y座標）の順。x座標は左右、y座標は上下の位置。',
        steps: [`|点Pから x軸へ垂直に下ろすと ${a}、y軸へ垂直に下ろすと ${b}`, `|座標は（x座標, y座標）の順に書く → (${a}, ${b})`] }; },
    () => { const p = R(1, 4), q = NZ(-5, 5), m = q / p, xe = Math.min(5, 5 / Math.abs(m)), g = gcd(p, q);
      const fig = plane(5, 20, (X, Y) => ln(X(-xe), Y(-m * xe), X(xe), Y(m * xe), 'stroke-width="2.2"') + dot(X(p), Y(q)));
      return { instr: '図の直線は、比例のグラフです。yをxの式で表しなさい。', q: '（目盛りがちょうど交わる点・で示した点を読もう）', fig, py: `${q}/${p}*x`, kind: 'func',
        ans: q % p === 0 ? `y=${term(q / p, 'x')}` : `y=${q < 0 ? '-' : ''}${Math.abs(q) / g}/${p / g}x`, hint: '比例のグラフは原点を通る直線。通る点を1つ読んで、y＝axに代入する。',
        steps: [`|グラフは原点と点（${p}, ${q}）を通る`, `|y＝axに x＝${p}、y＝${q} を代入する：${q}＝a×${p}`, `|a＝${q}÷${p}＝${frac(q, p)}`] }; },
    () => { const a = P([4, 6, 8, -4, -6, -8]), xs = [1, 2, 3, 4, 5].filter(x => a % x === 0 && Math.abs(a / x) <= 5), p = P(xs), q = a / p;
      const fig = plane(5, 20, (X, Y) => { let s = ''; for (const sg of [1, -1]) { const pts = []; for (let x = 0.5; x <= 5.4; x += 0.05) { const y = a / (sg * x); if (Math.abs(y) <= 5.4) pts.push(`${+X(sg * x).toFixed(1)},${+Y(y).toFixed(1)}`); }
        s += `<polyline points="${pts.join(' ')}" stroke-width="2.2"/>`; } return s + dot(X(p), Y(q)); });
      return { instr: '図の曲線は、反比例のグラフです。yをxの式で表しなさい。', q: '（目盛りがちょうど交わる点・で示した点を読もう）', fig, py: `${a}/x`, kind: 'func', ans: `y=${a}/x`, hint: '反比例は y＝a/x。通る点を1つ読んで、a＝x×y を求める。',
        steps: [`|グラフ上の点（${p}, ${q}）を読む`, `|反比例は y＝a/x なので、a＝x×y＝${p}×${par(q)}＝${a}`] }; },
  ]},
  // ---------------- 5章 平面図形 ----------------
  { id: 'c5-chokusen', ch: '5', name: '直線と図形（記号・距離）', tiers: [
    () => { if (Math.random() < 0.5) {
        const DEF = [['両方向に、まっすぐ限りなくのびている線', '直線'], ['直線の一部で、両端のあるもの', '線分'], ['直線の一部で、1点を端として一方だけに限りなくのびたもの', '半直線'], ['2点を結ぶ線のうちで、もっとも短いもの', '線分'], ['2つの直線が交わる点', '交点']];
        const [d, t] = P(DEF), items = ['直線', '線分', '半直線', '交点'].map(w => [w, w === t]).map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(v => v[1]);
        return { ...choiceOf(items, `次の説明にあてはまることばを選びなさい。\n「${d}」`), hint: '直線・線分・半直線は、端があるかどうかで区別する。',
          steps: [`|${t}：${d}`, '|直線＝両方向に限りなくのびる／線分＝両端がある／半直線＝一方の端だけがある'] }; }
      const T = [['1点を通る直線は、何本もある'], ['2点を通る直線は、1本しかない'], ['線分ABは、2点A、Bを結ぶ線のうちで、もっとも短いもの'], ['直線ABと直線BAは、同じ直線を表す'], ['半直線ABは、点Aを端として、点Bの方向にのびたもの']];
      const F = [['1点を通る直線は、1本しかない', '1点を通る直線は何本もある'], ['2点を通る直線は、何本もある', '2点を通る直線は1本しかない'], ['線分は、両方向に限りなくのびている', 'それは直線。線分には両端がある'], ['半直線ABと半直線BAは、同じものを表す', '端になる点がちがうので、別のもの'], ['直線ABの長さは、ものさしではかれる', '直線は限りなくのびるので、長さははかれない']];
      return { ...choiceOf(pick4(T, F).map(([e, ok]) => [e[0], ok, e[1]]), '次のア〜エのうち、正しいものをすべて選びなさい。'), hint: '直線・線分・半直線のちがいを思い出そう。' }; },
    () => { const f = R(0, 2), U = 36, sc = pts => pts.map(([x, y]) => [x * U, (4 - y) * U]);
      const label = (pts, names) => { const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        return pts.map((p, i) => { const dx = p[0] - cx, dy = p[1] - cy, r = Math.hypot(dx, dy) || 1; return tx(p[0] + dx / r * 13, p[1] + dy / r * 13, names[i]); }).join(''); };
      if (f === 0) { // 四角形の辺の垂直・平行
        const SH = [{ n: '長方形', p: [[0, 3], [0, 0], [5, 0], [5, 3]], note: '長方形は、となり合う辺が垂直、向かい合う辺が平行' },
          { n: 'ひし形', p: [[3, 4], [0, 2], [3, 0], [6, 2]], diag: true, note: 'ひし形は、向かい合う辺が平行で、2本の対角線が垂直に交わる' },
          { n: '台形', p: [[1, 3], [0, 0], [6, 0], [4, 3]], arrow: true, note: '台形は、1組の向かい合う辺（印のついた辺）が平行' }][R(0, 2)];
        const V = { A: SH.p[0], B: SH.p[1], C: SH.p[2], D: SH.p[3] }, segs = ['AB', 'BC', 'DC', 'AD'].concat(SH.diag ? ['AC', 'BD'] : []);
        const T = [], F = [];
        for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
          const a = vec(V[segs[i][0]], V[segs[i][1]]), b = vec(V[segs[j][0]], V[segs[j][1]]);
          (isPerp(a, b) ? T : F).push([`${segs[i]}⊥${segs[j]}`]); (isPara(a, b) ? T : F).push([`${segs[i]}∥${segs[j]}`]); }
        const S = sc(SH.p); let body = `<polygon points="${S.map(p => p.join(',')).join(' ')}"/>` + label(S, ['A', 'B', 'C', 'D']);
        if (SH.diag) { body += ln(S[0][0], S[0][1], S[2][0], S[2][1]) + ln(S[1][0], S[1][1], S[3][0], S[3][1]); const c = [3 * U, 2 * U]; body += `<polyline points="${c[0] + 8},${c[1]} ${c[0] + 8},${c[1] - 8} ${c[0]},${c[1] - 8}" stroke-width="1.2"/>`; }
        if (SH.arrow) for (const [P1, P2] of [[S[0], S[3]], [S[1], S[2]]]) { const mx = (P1[0] + P2[0]) / 2, my = P1[1]; body += `<polyline points="${mx - 5},${my - 5} ${mx + 2},${my} ${mx - 5},${my + 5}" stroke-width="1.4"/>`; }
        const items = pick4(T, F);
        return { ...choiceOf(items, `図の${SH.n}ABCDについて、正しいものをすべて選びなさい。${SH.diag ? '（対角線AC、BDもひいてある）' : ''}`), fig: SV(6 * U, 4 * U, body), hint: '⊥は「垂直」、∥は「平行」を表す記号。',
          steps: [`|${SH.note}`, ...choiceOf(items, '').steps] }; }
      const S = sc([[2, 4], [0, 0], [6, 0]]), N = ['A', 'B', 'C'];
      if (f === 1) { // 角の表し方
        const v = R(0, 2), x = (v + 1) % 3, y = (v + 2) % 3, [V, X, Y] = [N[v], N[x], N[y]];
        const a1 = Math.atan2(S[x][1] - S[v][1], S[x][0] - S[v][0]); let a2 = Math.atan2(S[y][1] - S[v][1], S[y][0] - S[v][0]);
        if (a2 - a1 > Math.PI) a2 -= 2 * Math.PI; if (a1 - a2 > Math.PI) a2 += 2 * Math.PI;
        const arc = []; for (let k = 0; k <= 12; k++) { const t = a1 + (a2 - a1) * k / 12; arc.push(`${+(S[v][0] + 20 * Math.cos(t)).toFixed(1)},${+(S[v][1] + 20 * Math.sin(t)).toFixed(1)}`); }
        const body = `<polygon points="${S.map(p => p.join(',')).join(' ')}"/>` + label(S, N) + `<polyline points="${arc.join(' ')}" stroke-width="1.4"/>`;
        const items = [[`∠${X}${V}${Y}`, true], [`∠${Y}${V}${X}`, true], [`∠${V}${X}${Y}`, false], [`∠${X}${Y}${V}`, false]].map(r => [Math.random(), r]).sort((p, q) => p[0] - q[0]).map(r => r[1]);
        return { ...choiceOf(items, '図の三角形で、印（弧）をつけた角を、記号∠を使って表したものを、すべて選びなさい。'), fig: SV(6 * U, 4 * U, body), hint: '角の頂点を、まん中に書く。',
          steps: [`|角は「辺の上の点・頂点・辺の上の点」の順に書き、頂点${V}をまん中に書く`, `|∠${X}${V}${Y} と ∠${Y}${V}${X} は同じ角（∠${V} と書いてもよい）。頂点がまん中にないものはちがう角`] }; }
      // 三角形の表し方（図の中の三角形をすべて）
      const onBC = Math.random() < 0.5, D = onBC ? [R(2, 4), 0] : [1, 2], Ds = sc([D])[0];
      const body = `<polygon points="${S.map(p => p.join(',')).join(' ')}"/>` + label(S, N) + (onBC ? ln(S[0][0], S[0][1], Ds[0], Ds[1]) + tx(Ds[0], Ds[1] + 13, 'D') : ln(S[2][0], S[2][1], Ds[0], Ds[1]) + tx(Ds[0] - 13, Ds[1], 'D'));
      const raw = onBC ? [['△ABC', true], ['△ABD', true], ['△ADC', true], ['△BDC', false, '点B、D、Cは一直線上にあるので三角形にならない']]
        : [['△ABC', true], ['△ADC', true], ['△DBC', true], ['△ADB', false, '点A、D、Bは一直線上にあるので三角形にならない']];
      const items = raw.map(r => [Math.random(), r]).sort((p, q) => p[0] - q[0]).map(r => r[1]);
      return { ...choiceOf(items, '図の中にある三角形を、すべて選びなさい。'), fig: SV(6 * U, 4 * U, body), hint: '3つの頂点を、△の後ろに書いて表す。一直線上の3点は三角形にならない。' }; },
    () => { const f = R(0, 2), U = 24, n = 8;
      if (f === 2) { const d = R(2, 4);
        return { instr: '次の問いに答えなさい。', q: `ノートに直線ABをかき、直線ABとの距離が${d}cmになる、直線ABと平行な直線をひきます。このような直線は何本ひけますか。`, py: '2', kind: 'num', ans: '2', unit: '本', hint: '直線ABの上側と下側を考えよう。',
          steps: [`|直線ABの上側に${d}cm離れた平行な直線が1本、下側にも1本ひける`, '2'] }; }
      const hor = Math.random() < 0.5, r = R(1, 3), d = R(2, 5), c = R(1, 6), XY = (a, b) => (hor ? [a * U, b * U] : [b * U, a * U]);
      let body = ln(...XY(0, r), ...XY(n, r), 'stroke-width="2.2"') + tx(...XY(n - 0.4, r - 0.45), 'ℓ', 'font-style="italic"');
      if (f === 0) { const [px, py] = XY(c, r + d); body += dot(px, py) + tx(px + 11, py - 11, 'A');
        return { instr: '方眼の1目盛りを1cmとします。', q: '点Aと直線ℓとの距離は何cmですか。', fig: gridSV(n, U, body), py: `${d}`, kind: 'num', ans: `${d}`, unit: 'cm', hint: '点から直線に垂線をひき、その長さをはかる。',
          steps: [`|点Aから直線ℓに垂線（ℓと垂直に交わる線）をひく`, `|垂線の長さを目盛りで数えると、${d}目盛り`, `${d}`] }; }
      body += ln(...XY(0, r + d), ...XY(n, r + d), 'stroke-width="2.2"') + tx(...XY(n - 0.4, r + d - 0.45), 'm', 'font-style="italic"');
      return { instr: '方眼の1目盛りを1cmとします。', q: '平行な2直線ℓ、m間の距離は何cmですか。', fig: gridSV(n, U, body), py: `${d}`, kind: 'num', ans: `${d}`, unit: 'cm', hint: 'ℓ上のどこからmに垂線をひいても、長さは同じ。',
        steps: ['|ℓ上の点からmに垂線をひく（どこからひいても長さは同じ）', `|垂線の長さを目盛りで数えると、${d}目盛り`, `${d}`] }; },
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
  'c5-chokusen': { kyo: '148〜154', work: '100〜101' }, // c4-zahyou のページは未確認
};
for (const s of SKILLS) s.pages = PAGES[s.id] || {};
const pageText = (sid, short) => { const g = (SKILLS.find(s => s.id === sid) || {}).pages || {};
  return short ? (g.kyo ? `教p.${g.kyo}` : g.work ? `ワークp.${g.work}` : '')
    : [g.kyo && `教科書 p.${g.kyo}`, g.work && `ワーク p.${g.work}`].filter(Boolean).join('　'); };
const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));
const CHAPTERS = { '1': '1章 正の数・負の数', '2': '2章 文字の式', '3': '3章 方程式', '4': '4章 変化と対応', '5': '5章 平面図形' };

function makeProblem(cardId) {
  const [sid, t] = cardId.split('.');
  const s = SKILL[sid], tier = Math.min(+t, s.tiers.length);
  const p = s.tiers[tier - 1]();
  if (p.steps) { // 問題と同じ行は省き、最後が答えでなければ答えを足す
    const ex = l => l.split('|')[0];
    p.steps = p.steps.filter((l, i) => !(i === 0 && ex(l) === p.q));
    const last = p.steps.length ? ex(p.steps[p.steps.length - 1]) : '';
    if (!Array.isArray(p.ans) && last !== p.ans && last !== `x=${p.ans}`) p.steps.push(p.ans);
  }
  return { ...p, card: `${sid}.${tier}`, skill: sid, tier, sname: s.name, ch: s.ch };
}
if (typeof module !== 'undefined') module.exports = { SKILLS, SKILL, CHAPTERS, makeProblem, pageText };
