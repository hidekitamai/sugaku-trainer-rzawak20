// 数学トレーニング（中1）本体
// ①毎日10分 ②単元まとめ ③テスト前の総合演習 ④予想テスト
// 記憶の単位は「カード」＝単元(skill)×段(tier)。出題のたびに数字が変わる類題を作る。
'use strict';

const KEY = 'sugaku-v2';
const INTERVALS = [1, 3, 7, 14, 30, 60];
const MASTER = 3;          // 別の日に3回正解で「身についた」
const UNLOCK = 2;          // 2回正解で次の段へ
const DAILY_MS = 10 * 60 * 1000;
const ERR_TYPES = ['マイナスの符号', '計算ミス', '式の立て方', '問題の読み違い', 'わからなかった', 'その他'];
const CFG = window.SUGAKU_CONFIG || {};

// ---------- 日付 ----------
const pad2 = n => String(n).padStart(2, '0');
const dstr = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const today = () => dstr(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return dstr(d); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);

// ---------- 記録 ----------
let S;
function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || !S.cards) S = seed();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 保存できない環境 */ } }

// 初回：ワークの結果を反映（間違えた単元はリベンジ、できた単元は先々の復習へ）
function seed() {
  const t = today(), cards = {};
  const learned = SKILLS.filter(s => ['1', '2', '3'].includes(s.ch)).map(s => s.id);
  let k = 0;
  for (const s of SKILLS) {
    if (!['c2', 'c3'].some(p => s.id.startsWith(p)) || s.id === 'c3-riyou' || s.id === 'c3-hirei') continue;
    for (let tier = 1; tier <= Math.min(2, s.tiers.length); tier++) cards[`${s.id}.${tier}`] = { b: UNLOCK, d: addDays(t, 2 + (k++ % 18)), pri: 0, ok: 0 };
  }
  for (const id of (CFG.seedRevenge || [])) cards[id] = { b: 0, d: t, pri: 1, ok: 0 };
  return { cards, log: [], learned, settings: { range: ['3', '4'], testDate: '' }, created: t };
}

// ---------- 式の読み取り ----------
function tokenize(s) {
  s = s.replace(/[−－ー]/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '').replace(/²/g, '^2').replace(/³/g, '^3');
  const out = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; out.push({ t: 'n', v: parseFloat(s.slice(i, j)) }); i = j; }
    else if (/[a-z]/.test(c)) { out.push({ t: 'v', v: c }); i++; }
    else if ('+-*/^()'.includes(c)) { out.push({ t: c }); i++; }
    else throw new Error('使えない文字「' + c + '」');
  }
  return out;
}
function parseExpr(s) {
  const tk = tokenize(s); let p = 0;
  const peek = () => tk[p];
  const expr = () => { let f = term(); while (peek() && '+-'.includes(peek().t)) { const op = tk[p++].t, a = f, b = term(); f = op === '+' ? e => a(e) + b(e) : e => a(e) - b(e); } return f; };
  const term = () => { let f = unary(); for (;;) { const k = peek(); if (!k) break;
    if (k.t === '*' || k.t === '/') { p++; const a = f, b = unary(); f = k.t === '*' ? e => a(e) * b(e) : e => a(e) / b(e); }
    else if (k.t === 'n' || k.t === 'v' || k.t === '(') { const a = f, b = power(); f = e => a(e) * b(e); }
    else break; } return f; };
  const unary = () => { const k = peek(); if (k && k.t === '-') { p++; const a = unary(); return e => -a(e); } if (k && k.t === '+') { p++; return unary(); } return power(); };
  const power = () => { const a = atom(); if (peek() && peek().t === '^') { p++; const b = unary(); return e => Math.pow(a(e), b(e)); } return a; };
  const atom = () => { const k = tk[p++]; if (!k) throw new Error('式が途中で終わっています');
    if (k.t === 'n') return () => k.v; if (k.t === 'v') return e => e[k.v];
    if (k.t === '(') { const a = expr(); if (!tk[p] || tk[p].t !== ')') throw new Error('かっこが閉じていません'); p++; return a; }
    throw new Error('式の形を確かめてね'); };
  const f = expr(); if (p !== tk.length) throw new Error('式の形を確かめてね'); return f;
}
const samples = () => Array.from({ length: 10 }, () => Object.fromEntries([...'abcnxy'].map(v => [v, (Math.random() * 6 - 3) || 1.7])));
function same(f, g) {
  let n = 0;
  for (const e of samples()) { const a = f(e), b = g(e); if (!isFinite(a) || !isFinite(b)) continue;
    if (Math.abs(a - b) > 1e-7 * Math.max(1, Math.abs(b))) return false; n++; }
  return n >= 3;
}
function ratio(f, g) { // f = r*g となる定数 r（なければ null）
  let r = null;
  for (const e of samples()) { const a = f(e), b = g(e); if (!isFinite(a) || !isFinite(b) || Math.abs(b) < 1e-9) continue;
    const q = a / b; if (r === null) r = q; else if (Math.abs(q - r) > 1e-7 * Math.max(1, Math.abs(r))) return null; }
  return r;
}
const varCount = s => (s.match(/[a-z]/g) || []).length;
const OPS = ['≦', '≧', '<', '>', '='];
const splitRel = s => { for (const op of OPS) { const i = s.indexOf(op); if (i > 0) return [s.slice(0, i), op, s.slice(i + 1)]; } return null; };
const FLIP = { '<': '>', '>': '<', '≦': '≧', '≧': '≦', '=': '=' };

function grade(p, raw) {
  let s = raw.trim().replace(/[^\x00-\x7f≦≧×÷−²³]+$/g, '').trim();
  if (!s) return { retry: '答えを入れてね' };
  try {
    if (p.kind === 'solve' || p.kind === 'num') {
      s = s.replace(new RegExp('^' + (p.var || 'x') + '='), '');
      if (/[a-z=<>≦≧]/.test(s)) return { retry: p.kind === 'solve' ? `「${p.var}=数」の形で答えよう` : '数で答えよう' };
      return { ok: same(parseExpr(s), parseExpr(p.ans.replace(/^[a-z]=/, ''))) };
    }
    if (p.kind === 'expr' || p.kind === 'func') {
      if (p.kind === 'func') s = s.replace(/^y=/, '');
      if (/[=<>≦≧]/.test(s)) return { retry: p.kind === 'func' ? '「y=〜」の形で答えよう' : '式だけを答えよう' };
      const shown = p.ans.replace(/^y=/, '');
      if (!same(parseExpr(s), parseExpr(shown))) return { ok: false };
      if (/[×÷*]/.test(s)) return { retry: '値は合っているよ。×や÷を使わない書き方にしよう' };
      if (varCount(s) > varCount(shown) || (s.includes('(') && !shown.includes('('))) return { retry: '値は合っているよ。もっと整理した形にできるよ' };
      return { ok: true };
    }
    if (p.kind === 'rel') {
      const a = splitRel(s), b = splitRel(p.ans);
      if (!a) return { retry: '＝や＜などを使って、関係を式に表そう' };
      const fa = parseExpr(a[0]), fa2 = parseExpr(a[2]), fb = parseExpr(b[0]), fb2 = parseExpr(b[2]);
      const r = ratio(e => fa(e) - fa2(e), e => fb(e) - fb2(e));
      if (r === null || r === 0) return { ok: false };
      if (r > 0 ? a[1] !== b[1] : a[1] !== FLIP[b[1]]) return { ok: false };
      if (/[×÷*]/.test(s)) return { retry: '関係は合っているよ。×や÷を使わない書き方にしよう' };
      return { ok: true };
    }
  } catch (e) { return { retry: e.message }; }
  return { ok: false };
}

// ---------- 表示 ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 分数は縦書き、文字（x, y, a…）は斜体、マイナスは「−」で表示
const FRAC_RE = /(\([^()]+\)|\d*[a-z]+|\d+(?:\.\d+)?)\/(\d+|[a-z]|\([^()]+\))/g;
function fmt(s) {
  const ph = [], strip = x => x.replace(/^\((.*)\)$/, '$1');
  const inner = x => esc(x).replace(/-/g, '−').replace(/(^|[^a-z])([abcnxy]+)(?![a-z])/g, '$1<i>$2</i>');
  let t = String(s).replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\*/g, '×')
    .replace(FRAC_RE, (m, a, b) => { ph.push([strip(a), strip(b)]); return `\u0001${ph.length - 1}\u0002`; });
  t = inner(t).replace(/\u0001(\d+)\u0002/g, (m, i) => `<span class="frac"><span>${inner(ph[i][0])}</span><span>${inner(ph[i][1])}</span></span>`);
  return t.replace(/\n/g, '<br>');
}
const fmtSafe = fmt;
const $ = q => document.querySelector(q);
const app = () => $('#app');

// ---------- カードの選び方 ----------
const card = id => S.cards[id];
const skillOf = id => SKILL[id.split('.')[0]];
function frontier(sid) { // 解放されている一番上の段
  const s = SKILL[sid]; let t = 1;
  while (t < s.tiers.length && (card(`${sid}.${t}`) || {}).b >= UNLOCK) t++;
  return t;
}
function dueCards() {
  const t = today(), L = new Set(S.learned);
  return Object.entries(S.cards).filter(([id, c]) => SKILL[id.split('.')[0]] && c.d <= t && (L.has(id.split('.')[0]) || c.pri))
    .sort((a, b) => (b[1].pri - a[1].pri) || a[1].d.localeCompare(b[1].d)).map(([id]) => id);
}
function newCards() {
  const out = [];
  for (const sid of S.learned) { if (!SKILL[sid]) continue; const id = `${sid}.${frontier(sid)}`; if (!card(id)) out.push(id); }
  return out.sort((a, b) => +a.split('.')[1] - +b.split('.')[1]);
}

// ---------- セッション ----------
let Q = null; // {mode, title, queue, deadline, i, done:[], retry:[], last, cur}

// focus: ''＝おまかせ／'ch:3'＝章全体／'c3-both'＝単元（学校の進度に合わせて本人が選ぶ）
function startDaily(focus) {
  Q = { mode: 'daily', title: '毎日10分', deadline: Date.now() + DAILY_MS, i: 0, done: [], retry: [], used: new Set(), focus: focus || '', fk: 0, st: {}, streak: {} };
  if (SKILL[focus] && !S.learned.includes(focus)) S.learned.push(focus); // 選んだ単元は「習った」に入れる
  S.settings.focus = focus || ''; save();
  next();
}
const focusSkills = f => (f.startsWith('ch:') ? SKILLS.filter(s => s.ch === f.slice(3)).map(s => s.id) : SKILL[f] ? [f] : []);
const focusLabel = f => (f.startsWith('ch:') ? `${CHAPTERS[f.slice(3)]}（全部）` : SKILL[f] ? SKILL[f].name : 'おまかせ');
// 選んだ単元の今日の段：これまでの到達段と、今日3問連続正解で上がった段の高いほう
const focusTier = sid => Math.min(SKILL[sid].tiers.length, Math.max(frontier(sid), Q.st[sid] || 1));
function startFixed(mode, title, cards) {
  Q = { mode, title, queue: cards, i: 0, done: [], retry: [], used: new Set() };
  next();
}
function pickDaily() {
  const n = Q.done.length;
  const r = Q.retry.findIndex(x => x.at <= n); if (r >= 0) return { id: Q.retry.splice(r, 1)[0].id, retry: true };
  const fs = focusSkills(Q.focus);
  if (fs.length) { // 選んだ単元を中心に、3問に1問はリベンジ・復習をはさむ
    const due = dueCards().filter(id => !Q.used.has(id) && !fs.includes(id.split('.')[0]));
    if (n % 3 === 2 && due.length) return { id: due[0] };
    const sid = fs[Q.fk++ % fs.length];
    return { id: `${sid}.${focusTier(sid)}`, focus: true };
  }
  const lastSkill = Q.last && Q.last.split('.')[0];
  const due = dueCards().filter(id => !Q.used.has(id) && id.split('.')[0] !== lastSkill);
  const fresh = newCards().filter(id => !Q.used.has(id) && id.split('.')[0] !== lastSkill);
  const preferNew = Q.lastWasDue && fresh.length;
  const id = (!preferNew && due[0]) || fresh[0] || due[0];
  if (id) return { id };
  // 予定の問題が尽きたら、習った範囲から挑戦問題（今の段）を出し続ける
  const pool = S.learned.filter(sid => SKILL[sid] && sid !== lastSkill);
  const sid = pool[Math.floor(Math.random() * pool.length)];
  return { id: `${sid}.${frontier(sid)}`, extra: true };
}
function next() {
  let pick;
  if (Q.mode === 'daily') {
    if (Date.now() >= Q.deadline && Q.done.length) return finish();
    pick = pickDaily();
  } else {
    const n = Q.done.length, r = Q.retry.findIndex(x => x.at <= n);
    if (r >= 0) pick = { id: Q.retry.splice(r, 1)[0].id, retry: true };
    else if (Q.i < Q.queue.length) pick = { id: Q.queue[Q.i++] };
    else if (Q.retry.length) pick = { id: Q.retry.shift().id, retry: true };
    else return finish();
  }
  Q.used.add(pick.id);
  const c = card(pick.id);
  Q.cur = { ...pick, p: makeProblem(pick.id), revenge: !pick.retry && c && c.pri > 0, review: !pick.retry && !pick.focus && c && !c.pri, input: '', choice: new Set(), hint: false };
  ask();
}

function record(ok, conf) {
  const { id, retry } = Q.cur, t = today();
  const c = S.cards[id] || { b: 0, d: t, pri: 0, ok: 0 };
  const weak = conf === 'low' || Q.cur.hint;
  if (!retry) {
    if (ok) {
      if (c.lastOk !== t) { c.b = weak ? Math.max(c.b, 1) : c.b + 1; c.lastOk = t; }
      c.d = addDays(t, weak ? 1 : INTERVALS[Math.min(c.b, INTERVALS.length) - 1]);
      c.pri = 0; c.ok++;
    } else {
      c.b = 0; c.d = addDays(t, 1); c.pri = conf === 'high' ? 2 : 1;
    }
  }
  S.cards[id] = c;
  S.log.push({ at: new Date().toISOString(), mode: Q.mode, card: id, ok, conf, hint: Q.cur.hint, retry: !!retry, q: Q.cur.p.q });
  if (S.log.length > 3000) S.log = S.log.slice(-3000);
  save();
  Q.done.push({ id, ok, retry: !!retry, revenge: Q.cur.revenge, q: Q.cur.p.q, ans: Q.cur.p.ans });
  if (!ok && !retry) Q.retry.push({ id, at: Q.done.length + 2 }); // 2問あとに類題でもう一度
  if (Q.cur.focus && !retry) { // 今日の中で3問連続正解したら、次の段へ
    const sid = id.split('.')[0], t = +id.split('.')[1];
    Q.streak[sid] = ok && !weak ? (Q.streak[sid] || 0) + 1 : 0;
    if (Q.streak[sid] >= 3 && t < SKILL[sid].tiers.length) { Q.st[sid] = t + 1; Q.streak[sid] = 0; Q.levelUp = true; }
  }
  Q.last = id; Q.lastWasDue = !!(Q.cur.revenge || Q.cur.review);
  return c;
}

// ---------- 画面 ----------
function topBar() {
  let w;
  if (Q.mode === 'daily') w = Math.min(100, 100 * (1 - (Q.deadline - Date.now()) / DAILY_MS));
  else w = 100 * Math.min(1, Q.done.filter(d => !d.retry).length / Q.queue.length);
  return `<div class="bar"><i style="width:${w}%"></i></div>`;
}
function tag() {
  const c = Q.cur;
  if (c.retry) return '<span class="tag rv">もう一度（類題）</span>';
  if (c.revenge) return '<span class="tag rv">リベンジ問題</span>';
  if (c.review) return '<span class="tag">復習</span>';
  return `<span class="tag">${c.p.tier >= 3 ? '応用' : c.p.tier === 2 ? 'ステップ2' : '新しい問題'}</span>`;
}
function ask() {
  const { p } = Q.cur;
  let body;
  if (p.kind === 'choice') body = `<div class="choices">${p.opts.map(o => `<button data-c="${o}">${o}</button>`).join('')}</div>`;
  else body = `<div class="disp" id="disp"></div><div id="msg"></div>${keypad(p.kind === 'rel')}`;
  app().innerHTML = `
    ${topBar()}
    <div class="top">${tag()}<span class="sub">${esc(p.sname)}</span></div>
    <div class="instr">${fmtSafe(p.instr)}</div>
    <div class="q">${fmtSafe(p.q)}</div>
    <div id="hintbox"></div>
    ${p.unit ? `<div class="sub">単位（${esc(p.unit)}）は入れなくてよい</div>` : ''}
    ${body}
    <div class="sub center" style="margin-top:12px">どのくらい自信がある？</div>
    <div class="conf"><button data-conf="high" class="dark">ある</button><button data-conf="mid">たぶん</button><button data-conf="low">ない</button></div>
    <div class="foot"><button class="link" id="hint">ヒント</button><button class="link" id="quit">今日はここまで</button></div>`;
  if (p.kind === 'choice') app().querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
    const c = b.dataset.c; if (p.ans.length === 1) { Q.cur.choice.clear(); app().querySelectorAll('[data-c]').forEach(x => x.classList.remove('on')); }
    Q.cur.choice.has(c) ? Q.cur.choice.delete(c) : Q.cur.choice.add(c); b.classList.toggle('on', Q.cur.choice.has(c));
  });
  else { app().querySelectorAll('[data-k]').forEach(b => b.onclick = () => key(b.dataset.k)); drawDisp(); }
  app().querySelectorAll('[data-conf]').forEach(b => b.onclick = () => submit(b.dataset.conf));
  $('#hint').onclick = () => { Q.cur.hint = true; $('#hintbox').innerHTML = `<div class="hint">${fmtSafe(p.hint || '問題文をもう一度ゆっくり読んでみよう。')}${pageText(p.skill) ? `<div class="pgref">${pageText(p.skill)}</div>` : ''}</div>`; };
  $('#quit').onclick = () => (Q.done.length ? finish() : home());
}
function keypad(rel) {
  const K = ['7', '8', '9', 'x', 'y', '4', '5', '6', 'a', 'b', '1', '2', '3', '(', ')', '0', '.', '/', '-', '+', '^', '=', '←', '消す'];
  if (rel) K.splice(20, 0, '<', '>', '≦', '≧', ' ');
  const label = k => ({ '-': '−', '/': '分数', '^': 'x²', '←': '⌫' }[k] || k);
  return `<div class="pad">${K.map(k => k === ' ' ? '<span></span>' : `<button data-k="${k}" class="${/^[a-z]$/.test(k) ? 'v' : k.length > 1 || k === '←' ? 'fn' : ''}${k === '消す' ? ' w2' : ''}">${label(k)}</button>`).join('')}</div>`;
}
function key(k) {
  const c = Q.cur;
  if (k === '←') c.input = c.input.slice(0, -1); else if (k === '消す') c.input = ''; else c.input += k;
  drawDisp();
}
function drawDisp() {
  const d = $('#disp'); if (!d) return;
  d.innerHTML = Q.cur.input ? fmtSafe(Q.cur.input) + '<span class="caret"></span>' : '<span class="ph">答えを入力（計算は紙で）</span>';
}
document.addEventListener('keydown', e => { // PC で試すとき用
  if (!Q || !Q.cur || !$('#disp')) return;
  if (e.key === 'Backspace') key('←'); else if (/^[0-9a-z+\-*/^().=<>]$/.test(e.key)) key(e.key);
});
function submit(conf) {
  const { p } = Q.cur; let ok;
  if (p.kind === 'choice') { if (!Q.cur.choice.size) return; ok = Q.cur.choice.size === p.ans.length && p.ans.every(a => Q.cur.choice.has(a)); }
  else { const g = grade(p, Q.cur.input); if (g.retry) { $('#msg').innerHTML = `<div class="msg">${esc(g.retry)}</div>`; return; } ok = g.ok; }
  result(ok, conf);
}
function result(ok, conf) {
  const { p, retry, revenge, input } = Q.cur;
  const c = record(ok, conf);
  const after = ok ? (retry ? '類題でできた。明日もう一度確かめよう。' : revenge ? 'リベンジ成功！' : (conf === 'low' || Q.cur.hint) ? '正解。自信がなかったので、明日また出すね。' : `次は${INTERVALS[Math.min(c.b, INTERVALS.length) - 1]}日後に出るよ。`)
    : (retry ? '明日リベンジしよう。' : '2問あとに、数字を変えた類題が出るよ。');
  const up = Q.levelUp ? '<div class="hint center">3問連続正解！ 次はレベルを上げるよ。</div>' : ''; Q.levelUp = false;
  app().innerHTML = `
    ${topBar()}
    <div class="mark ${ok ? 'ok' : 'ng'}">${ok ? '○' : '×'}</div>
    <p class="center sub">${after}</p>${up}
    ${!ok && conf === 'high' ? '<div class="msg">自信があったのに違った問題は、思いこみがかくれているかも。</div>' : ''}
    <div class="q small">${fmtSafe(p.q)}</div>
    <div class="ansrow"><span class="sub">正しい答え</span><span class="ans">${fmtSafe(p.ans instanceof Array ? p.ans.join('、') : p.ans)}</span></div>
    ${!ok && input ? `<div class="ansrow"><span class="sub">あなたの答え</span><span>${fmtSafe(input)}</span></div>` : ''}
    ${!ok ? `<div class="hint">${fmtSafe(p.hint || '')}${pageText(p.skill) ? `<div class="pgref">${pageText(p.skill)}</div>` : ''}</div><div class="sub" style="margin:16px 0 8px">どこでつまずいた？（押すと次へ）</div><div class="why">${ERR_TYPES.map(t => `<button data-e="${t}">${t}</button>`).join('')}</div>`
          : '<button class="big" id="nx">次へ</button>'}`;
  if (ok) $('#nx').onclick = next;
  app().querySelectorAll('[data-e]').forEach(b => b.onclick = () => { S.log[S.log.length - 1].err = b.dataset.e; save(); next(); });
}
function finish() {
  const first = Q.done.filter(d => !d.retry), ok = first.filter(d => d.ok).length;
  const rv = first.filter(d => d.revenge), rvOk = rv.filter(d => d.ok).length;
  const miss = first.filter(d => !d.ok);
  const score = first.length ? Math.round(100 * ok / first.length) : 0;
  const weak = {}; for (const d of miss) { const n = skillOf(d.id).name; weak[n] = (weak[n] || 0) + 1; }
  sendLog(Q.mode);
  app().innerHTML = `
    <h1>${Q.mode === 'daily' ? '今日の10分、おしまい' : esc(Q.title) + ' おしまい'}</h1>
    <div class="stats">
      <div><b>${Q.mode === 'daily' ? `${ok}<small>/${first.length}</small>` : `${score}<small>点</small>`}</b><span>${Q.mode === 'daily' ? '正解' : `${first.length}問中${ok}問正解`}</span></div>
      <div><b>${rvOk}<small>/${rv.length}</small></b><span>リベンジ成功</span></div>
      <div><b>${streak()}</b><span>連続した日数</span></div>
    </div>
    ${Object.keys(weak).length ? `<h2>明日リベンジする単元</h2><div class="list">${Object.entries(weak).map(([k, v]) => `<div>${esc(k)}<span class="sub">　${v}問</span></div>`).join('')}</div>` : '<p class="center">全部正解！</p>'}
    <button class="big" id="hm">ホームへ</button>`;
  $('#hm').onclick = home;
  Q = null;
}
function streak() {
  const days = new Set(S.log.map(l => dstr(new Date(l.at)))); let n = 0;
  for (let d = today(); days.has(d); d = addDays(d, -1)) n++;
  return n;
}
// Google フォームへ送る（設定があるときだけ）。未送信の記録をまとめて送り、送った印を付ける。
// 1回分を終えたときだけでなく、途中でアプリを閉じた・切り替えたときにも送る。
function sendLog(mode) {
  if (!CFG.formPostUrl || !CFG.formFields) return;
  const f = CFG.formFields;
  const pending = S.log.filter(l => !l.s);
  for (let i = 0; i < pending.length; i += 150) {
    const part = pending.slice(i, i + 150), first = part.filter(l => !l.retry);
    try {
      const fd = new FormData();
      fd.append(f.mode, mode || (Q && Q.mode) || 'daily');
      fd.append(f.score, `${first.filter(l => l.ok).length}/${first.length}`);
      fd.append(f.log, JSON.stringify(part.map(l => [l.at.slice(0, 16), l.card, l.ok ? 1 : 0, l.conf, l.hint ? 1 : 0, l.retry ? 1 : 0, l.err || '', l.q])));
      fetch(CFG.formPostUrl, { method: 'POST', body: fd, mode: 'no-cors', keepalive: true }).catch(() => {});
      part.forEach(l => { l.s = 1; });
    } catch (e) { /* 送れなくても端末には残っている */ }
  }
  save();
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sendLog(Q ? Q.mode + '(途中)' : ''); });
window.addEventListener('pagehide', () => sendLog(Q ? Q.mode + '(途中)' : ''));

// ---------- ホーム ----------
function home() {
  Q = null;
  const due = dueCards(), rv = due.filter(id => card(id).pri > 0).length;
  const td = S.settings.testDate, left = td ? daysBetween(today(), td) : null;
  const chs = Object.keys(CHAPTERS).map(ch => {
    const ids = SKILLS.filter(s => s.ch === ch).flatMap(s => s.tiers.map((_, i) => `${s.id}.${i + 1}`));
    const m = ids.filter(id => (card(id) || {}).b >= MASTER).length, l = ids.filter(id => card(id) && card(id).b < MASTER).length;
    return `<div class="prog"><div class="t"><span>${esc(CHAPTERS[ch])}</span><span class="sub">${Math.round(100 * m / ids.length)}%</span></div>
      <div class="bar thin"><i style="width:${100 * m / ids.length}%"></i><i class="l" style="width:${100 * l / ids.length}%"></i></div></div>`;
  }).join('');
  app().innerHTML = `
    <div class="top"><span class="sub">${today().replace(/-/g, '.')}</span><span class="sub">連続 ${streak()}日</span></div>
    <h1>今日の数学</h1>
    ${left !== null && left >= 0 ? `<p class="sub">期末テストまで あと <b class="accent">${left}</b> 日</p>` : ''}
    <label class="pick"><span class="sub">今日やるところ</span>
      <select id="focus">
        <option value="">おまかせ（復習＋習ったところ）</option>
        ${Object.entries(CHAPTERS).map(([c, n]) => `<optgroup label="${esc(n)}"><option value="ch:${c}">${esc(n.split(' ')[0])} 全部</option>${SKILLS.filter(s => s.ch === c).map(s => `<option value="${s.id}">${esc(s.name)}　${pageText(s.id, true)}</option>`).join('')}</optgroup>`).join('')}
      </select><span class="sub" id="pg"></span></label>
    <button class="big" id="daily">毎日10分をはじめる<small>${rv ? `リベンジ問題 ${rv}問・` : ''}復習 ${due.length - rv}問</small></button>
    <div class="menu">
      <button id="unit"><span>単元まとめ</span><span class="sub">単元が終わったら</span></button>
      <button id="test"><span>テスト前の総合演習</span><span class="sub">${S.settings.range.map(c => CHAPTERS[c] ? CHAPTERS[c].split(' ')[0] : c).join('・')}</span></button>
      <button id="yosou"><span>予想テスト</span><span class="sub">${(window.YOSOU || []).length ? `${window.YOSOU.length}回分` : '準備中'}</span></button>
    </div>
    <h2>身についた割合</h2>
    ${chs}
    <p class="sub">濃い線＝身についた　うすい線＝練習中</p>
    <button class="link" id="cfg">おうちの人用の設定</button>`;
  const showPg = () => { const v = $('#focus').value; $('#pg').textContent = SKILL[v] ? pageText(v) : ''; };
  $('#focus').value = S.settings.focus || ''; showPg(); $('#focus').onchange = showPg;
  $('#daily').onclick = () => startDaily($('#focus').value);
  $('#unit').onclick = unitPicker;
  $('#test').onclick = () => startFixed('test', 'テスト前の総合演習', testCards(20));
  $('#yosou').onclick = yosouList;
  $('#cfg').onclick = settings;
}
function unitPicker() {
  app().innerHTML = `<h1>単元まとめ</h1><p class="sub">どの章をまとめる？（12問・応用もふくむ）</p>
    <div class="menu">${Object.entries(CHAPTERS).map(([c, n]) => `<button data-ch="${c}"><span>${esc(n)}</span><span class="sub">${SKILLS.filter(s => s.ch === c).length}単元</span></button>`).join('')}</div>
    <button class="link" id="back">もどる</button>`;
  app().querySelectorAll('[data-ch]').forEach(b => b.onclick = () => startFixed('unit', `単元まとめ（${CHAPTERS[b.dataset.ch]}）`, unitCards(b.dataset.ch, 12)));
  $('#back').onclick = home;
}
function unitCards(ch, n) { // 各単元を1問ずつ（基本→応用）、残りは応用の段で
  const sk = SKILLS.filter(s => s.ch === ch), out = [];
  for (const s of sk) out.push(`${s.id}.${Math.min(frontier(s.id), s.tiers.length)}`);
  let k = 0; while (out.length < n) { const s = sk[k++ % sk.length]; out.push(`${s.id}.${s.tiers.length}`); }
  return shuffle(out).slice(0, Math.max(n, sk.length));
}
function testCards(n) { // テスト範囲を全部ふくみ、弱い単元を多めに
  const sk = SKILLS.filter(s => S.settings.range.includes(s.ch)); if (!sk.length) return [];
  const weakness = s => { const cs = s.tiers.map((_, i) => card(`${s.id}.${i + 1}`)).filter(Boolean); return cs.length ? 1 + cs.filter(c => c.pri).length * 2 - cs.reduce((a, c) => a + Math.min(c.b, MASTER), 0) / (MASTER * s.tiers.length) : 2; };
  const out = sk.map(s => `${s.id}.${Math.min(s.tiers.length, frontier(s.id) + 1)}`);
  const w = sk.map(weakness), tot = w.reduce((a, b) => a + b, 0);
  while (out.length < n) { let r = Math.random() * tot, i = 0; while ((r -= w[i]) > 0) i++; const s = sk[i]; out.push(`${s.id}.${1 + Math.floor(Math.random() * s.tiers.length)}`); }
  return shuffle(out);
}
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function yosouList() {
  const Y = window.YOSOU || [];
  app().innerHTML = `<h1>予想テスト</h1>
    ${Y.length ? `<div class="menu">${Y.map((y, i) => `<button data-y="${i}"><span>${esc(y.title)}</span><span class="sub">${y.cards.length}問</span></button>`).join('')}</div>`
      : '<p>まだありません。過去のテストをもとに作ったら、ここに出ます。</p>'}
    <button class="link" id="back">もどる</button>`;
  app().querySelectorAll('[data-y]').forEach(b => b.onclick = () => { const y = Y[+b.dataset.y]; startFixed('yosou', y.title, y.cards.slice()); });
  $('#back').onclick = home;
}
function settings() {
  app().innerHTML = `
    <h1>おうちの人用の設定</h1>
    <h2>学校で習ったところ</h2>
    <p class="sub">チェックした単元から、毎日10分の新しい問題を出します。</p>
    ${Object.entries(CHAPTERS).map(([c, n]) => `<div class="group"><div class="gh">${esc(n)}</div>${SKILLS.filter(s => s.ch === c).map(s => `<label class="ck"><input type="checkbox" name="lr" value="${s.id}" ${S.learned.includes(s.id) ? 'checked' : ''}>${esc(s.name)}</label>`).join('')}</div>`).join('')}
    <h2>テスト範囲</h2>
    <div class="group">${Object.entries(CHAPTERS).map(([c, n]) => `<label class="ck"><input type="checkbox" name="rg" value="${c}" ${S.settings.range.includes(c) ? 'checked' : ''}>${esc(n)}</label>`).join('')}</div>
    <h2>テストの日</h2>
    <input type="date" id="td" value="${S.settings.testDate || ''}">
    <h2>記録</h2>
    <p class="sub">解いた回数：${S.log.length}回</p>
    <button class="link" id="ex">記録をファイルに書き出す</button>
    <button class="big" id="sv">保存してもどる</button>`;
  $('#sv').onclick = () => {
    S.learned = [...document.querySelectorAll('input[name=lr]:checked')].map(x => x.value);
    S.settings.range = [...document.querySelectorAll('input[name=rg]:checked')].map(x => x.value);
    S.settings.testDate = $('#td').value; save(); home();
  };
  $('#ex').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = `sugaku-${today()}.json`; a.click(); };
}

load(); save(); home();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
