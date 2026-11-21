// 백오피스 데이터 계층 (Firebase)
//  읽기: 관리자 권한으로 Firestore 를 직접 읽음 (firestore.rules 의 isAdmin)
//  쓰기: 반드시 관리자 Cloud Functions(admin*) 를 거침 — 출제 풀/수정 이력/통계가 항상 같이 맞춰지도록
//  화면(admin.js)은 예전 REST 응답 모양 그대로 받도록 여기서 맞춰 준다.
import {
  getFirestore, connectFirestoreEmulator, collection, doc, getDoc, getDocs, query, where, orderBy, limit, getCountFromServer,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { app, EMULATOR, call } from '../firebase.js';

const fs = getFirestore(app);
if (EMULATOR) connectFirestoreEmulator(fs, location.hostname, 8085);

export const MIN_ATTEMPTS = 20;
let META = null;          // adminMe 결과 (시리즈 설정 · 점수 규칙 · 선택지 목록)
let Qs = new Map();       // id → 문항
let Ss = new Map();       // id → 통계
let loadedAt = 0;

export async function loadMeta() { META = await call('adminMe'); return META; }

async function loadAll(force = false) {
  if (!force && loadedAt && Date.now() - loadedAt < 60000) return;
  const [qs, ss] = await Promise.all([getDocs(collection(fs, 'questions')), getDocs(collection(fs, 'qstats'))]);
  Qs = new Map(qs.docs.map((d) => [d.id, { ...d.data(), id: d.id }]));
  Ss = new Map(ss.docs.map((d) => [d.id, d.data()]));
  loadedAt = Date.now();
}
const invalidate = () => { loadedAt = 0; };

// ---------- 문항 + 통계 한 줄 ----------
const suggest = (acc, n) => (n < MIN_ATTEMPTS || acc == null ? null : acc >= 80 ? '하' : acc >= 50 ? '중' : '상');
function row(q) {
  const s = Ss.get(q.id) || {};
  const attempts = s.attempts || 0, correct = s.correct || 0;
  const r = {
    ...q, attempts, correct_cnt: correct, wrong_cnt: s.wrong || 0, timeout_cnt: s.timeouts || 0, served: s.served || 0,
    pick_1: s.pick1 || 0, pick_2: s.pick2 || 0, pick_3: s.pick3 || 0, pick_4: s.pick4 || 0,
    accuracy: attempts ? Math.round((1000 * correct) / attempts) / 10 : null,
    avg_correct_ms: correct ? Math.round((s.sumCorrectMs || 0) / correct) : null,
    avg_points: attempts ? Math.round((s.sumPoints || 0) / attempts) : null,
    stats_since: s.statsSince ? new Date(s.statsSince).toISOString().replace('T', ' ').slice(0, 19) : null,
    updated_at: q.updatedAt ? new Date(q.updatedAt).toISOString().slice(0, 10) : '',
    tb: Array.from({ length: 10 }, (_, i) => s[`tb${i}`] || 0),
  };
  r.suggested_difficulty = suggest(r.accuracy, attempts);
  return r;
}
const FLAG = {
  low_accuracy: (r) => r.attempts >= MIN_ATTEMPTS && r.accuracy < 30,
  distractor: (r) => r.attempts >= MIN_ATTEMPTS && [1, 2, 3, 4].some((n) => n !== r.correct_option && r[`pick_${n}`] > r[`pick_${r.correct_option}`]),
  too_easy: (r) => r.attempts >= MIN_ATTEMPTS && r.accuracy > 97,
  difficulty_mismatch: (r) => r.suggested_difficulty && r.suggested_difficulty !== r.difficulty,
  no_data: (r) => !r.attempts,
};
function filterRows(qs) {
  const term = (qs.q || '').toLowerCase();
  return [...Qs.values()].map(row).filter((r) => {
    if (term && ![r.id, r.question, r.topic, r.explanation, r.option_1, r.option_2, r.option_3, r.option_4].some((v) => String(v ?? '').toLowerCase().includes(term))) return false;
    for (const f of ['era', 'period', 'difficulty', 'review_status', 'status', 'fact_group_id', 'source_type']) if (qs[f] && r[f] !== qs[f]) return false;
    if (qs.flag && FLAG[qs.flag] && !FLAG[qs.flag](r)) return false;
    return true;
  });
}
const DIFF_ORDER = { 하: 1, 중: 2, 상: 3 };
function sortRows(rows, sort = 'id', order = 'asc') {
  const key = sort === 'difficulty' ? (r) => DIFF_ORDER[r.difficulty] : (r) => r[sort];
  const dir = order === 'desc' ? -1 : 1;
  return rows.sort((a, b) => {
    const x = key(a), y = key(b);
    if (x == null && y == null) return a.id.localeCompare(b.id);
    if (x == null) return 1;
    if (y == null) return -1;
    return (x < y ? -1 : x > y ? 1 : 0) * dir || a.id.localeCompare(b.id);
  });
}
function nextId() {
  const p = META.series.idPrefix + '-';
  const max = Math.max(0, ...[...Qs.keys()].filter((k) => k.startsWith(p)).map((k) => Number(k.slice(p.length)) || 0));
  return p + String(max + 1).padStart(META.series.idDigits, '0');
}
const kstDayStart = () => { const k = Date.now() + 9 * 3600e3; return k - (k % 86400e3) - 9 * 3600e3; };
function weekKey(ms = Date.now()) {
  const kst = new Date(ms + 9 * 3600 * 1000);
  const d = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${String(Math.ceil(((d - y0) / 86400000 + 1) / 7)).padStart(2, '0')}`;
}
const count = async (q) => (await getCountFromServer(q)).data().count;
const runRow = (r) => ({
  id: r.id, week_key: r.weekKey, total_score: r.totalScore, correct_count: r.correctCount, question_count: r.questionCount, total_time_ms: r.totalTimeMs,
  finished_at: r.finishedAt, flagged: r.flagged ? 1 : 0, disqualified: r.disqualified ? 1 : 0, too_fast_count: r.tooFastCount, focus_lost_count: r.focusLostCount,
  nickname: r.nickname, user_id: r.uid, score_version: r.scoreVersion,
});

// ---------- 화면용 api(path, {method, body}) ----------
export async function api(path, opts = {}) {
  const method = opts.method || 'GET';
  const [p, qstr] = path.split('?');
  const qs = Object.fromEntries(new URLSearchParams(qstr || ''));
  const seg = p.split('/').filter(Boolean);

  if (p === '/meta') {
    await loadAll();
    const eras = {}, periods = {};
    for (const q of Qs.values()) {
      eras[q.era] = (eras[q.era] || 0) + 1;
      if (q.period) periods[q.era + '\u0000' + q.period] = (periods[q.era + '\u0000' + q.period] || 0) + 1;
    }
    return {
      ...META, nextId: nextId(), minAttempts: MIN_ATTEMPTS,
      eras: Object.entries(eras).map(([era, c]) => ({ era, c })),
      periods: Object.entries(periods).map(([k, c]) => { const [era, period] = k.split('\u0000'); return { era, period, c }; }).sort((a, b) => (a.era + a.period).localeCompare(b.era + b.period)),
    };
  }

  if (p === '/dashboard') {
    await loadAll(true);
    const rows = [...Qs.values()].map(row);
    const runs = collection(fs, 'runs');
    const today = kstDayStart();
    const [todayN, weekN, finN, startN, flagN, users, recent] = await Promise.all([
      count(query(runs, where('startedAt', '>=', today))),
      count(query(runs, where('weekKey', '==', weekKey()))),
      count(query(runs, where('status', '==', 'FINISHED'))),
      count(runs),
      count(query(runs, where('status', '==', 'FINISHED'), where('flagged', '==', true), where('disqualified', '==', false))),
      count(collection(fs, 'users')),
      getDocs(query(runs, where('startedAt', '>=', today - 13 * 86400e3), orderBy('startedAt', 'desc'), limit(5000))),
    ]);
    const daily = {};
    for (const d of recent.docs) {
      const r = d.data();
      const k = new Date(r.startedAt + 9 * 3600e3).toISOString().slice(0, 10);
      const x = (daily[k] ||= { d: k, runs: 0, finished: 0, sum: 0 });
      x.runs++; if (r.status === 'FINISHED') { x.finished++; x.sum += r.totalScore; }
    }
    const att = rows.reduce((a, r) => a + r.attempts, 0), cor = rows.reduce((a, r) => a + r.correct_cnt, 0), to = rows.reduce((a, r) => a + r.timeout_cnt, 0);
    return {
      questions: {
        total: rows.length, active: rows.filter((r) => r.status === 'ACTIVE').length, approved: rows.filter((r) => r.review_status === 'APPROVED').length,
        needs_review: rows.filter((r) => r.review_status === 'NEEDS_REVIEW').length, rejected: rows.filter((r) => r.review_status === 'REJECTED').length,
        facts: new Set(rows.map((r) => r.fact_group_id).filter(Boolean)).size,
      },
      plays: { today: todayN, week_finished: weekN, finished: finN, started: startN, flagged: flagN },
      users,
      flagCounts: Object.fromEntries(['low_accuracy', 'distractor', 'too_easy', 'difficulty_mismatch'].map((k) => [k, rows.filter(FLAG[k]).length])),
      daily: Object.values(daily).sort((a, b) => a.d.localeCompare(b.d)).map((x) => ({ ...x, avg_score: x.finished ? Math.round(x.sum / x.finished) : null })),
      attempts: att, accuracy: att ? Math.round((1000 * cor) / att) / 10 : null, timeoutRate: att ? Math.round((1000 * to) / att) / 10 : null,
      usingDefaultPassword: false,
    };
  }

  if (p === '/questions' && method === 'GET') {
    await loadAll();
    const size = Math.min(500, Math.max(1, Number(qs.size) || 50));
    const page = Math.max(1, Number(qs.page) || 1);
    const rows = sortRows(filterRows(qs), qs.sort, qs.order);
    return { total: rows.length, page, size, rows: rows.slice((page - 1) * size, page * size) };
  }
  if (p === '/questions' && method === 'POST') { const r = await call('adminSaveQuestion', { data: opts.body }); invalidate(); return r; }
  if (p === '/questions/bulk') { const r = await call('adminBulk', opts.body); invalidate(); return r; }
  if (p === '/questions/apply-suggested-difficulty') { const r = await call('adminApplySuggestedDifficulty', { minAttempts: MIN_ATTEMPTS }); invalidate(); return r; }

  if (seg[0] === 'questions' && seg[1]) {
    const id = decodeURIComponent(seg[1]);
    if (seg[2] === 'reset-stats') { const r = await call('adminResetStats', { id }); invalidate(); return r; }
    if (seg[2] === 'restore') { const r = await call('adminRestore', { id, revId: seg[3] }); invalidate(); return r; }
    if (method === 'PUT') { const r = await call('adminSaveQuestion', { id, data: opts.body }); invalidate(); return r; }
    if (method === 'DELETE') { const r = await call('adminDeleteQuestion', { id }); invalidate(); return r; }
    await loadAll();
    const q = Qs.get(id);
    if (!q) throw new Error('문항 없음');
    const r = row(q);
    const revs = await getDocs(query(collection(fs, 'revisions'), where('questionId', '==', id), orderBy('at', 'desc'), limit(30)));
    // 2초 단위 분포에서 중앙값(구간 중간값) 추정
    const total = r.tb.reduce((a, b) => a + b, 0);
    let acc = 0, median = null;
    for (let i = 0; i < r.tb.length && total; i++) { acc += r.tb[i]; if (acc >= total / 2) { median = i * 2000 + 1000; break; } }
    return {
      question: r,
      timeBuckets: r.tb.map((c, i) => ({ from: i * 2, to: (i + 1) * 2, count: c })),
      medianCorrectMs: median,
      revisions: revs.docs.map((d) => ({ id: d.id, action: d.data().action, changed_by: d.data().by, changed_at: new Date(d.data().at).toLocaleString('ko-KR'), snapshot: d.data().snapshot || {} })),
      sameFact: q.fact_group_id ? [...Qs.values()].filter((x) => x.fact_group_id === q.fact_group_id && x.id !== id).map(row).sort((a, b) => a.id.localeCompare(b.id)) : [],
      servedCount: r.served,
    };
  }

  if (p === '/import') {
    const r = await call('adminImport', { text: opts.body, filename: qs.filename, mode: qs.mode, dryRun: qs.dryRun === '1' });
    if (qs.dryRun !== '1') invalidate();
    return r;
  }

  if (p === '/stats') {
    await loadAll(true);
    const rows = [...Qs.values()].map(row);
    const group = (key) => {
      const m = {};
      for (const r of rows) {
        const g = (m[r[key]] ||= { k: r[key], questions: 0, active: 0, attempts: 0, correct: 0, timeouts: 0, ms: 0 });
        g.questions++; if (r.status === 'ACTIVE') g.active++;
        g.attempts += r.attempts; g.correct += r.correct_cnt; g.timeouts += r.timeout_cnt; g.ms += (r.avg_correct_ms || 0) * r.correct_cnt;
      }
      return Object.values(m).map((g) => ({ ...g, accuracy: g.attempts ? Math.round((1000 * g.correct) / g.attempts) / 10 : null, avg_correct_ms: g.correct ? Math.round(g.ms / g.correct) : null }));
    };
    const byEra = group('era').sort((a, b) => META.series.eraOrder.indexOf(a.k) - META.series.eraOrder.indexOf(b.k));
    const byDifficulty = group('difficulty').sort((a, b) => DIFF_ORDER[a.k] - DIFF_ORDER[b.k]);
    const finished = await getDocs(query(collection(fs, 'runs'), where('status', '==', 'FINISHED'), orderBy('finishedAt', 'desc'), limit(2000)));
    const dist = {};
    for (const d of finished.docs) { const r = d.data(); if (r.scoreVersion !== META.scoring.version) continue; const b = Math.min(10, Math.floor(r.totalScore / 1000)) * 1000; dist[b] = (dist[b] || 0) + 1; }
    const enough = rows.filter((r) => r.attempts >= MIN_ATTEMPTS);
    const facts = {};
    for (const r of rows.filter((x) => x.status === 'ACTIVE')) { const f = (facts[r.era] ||= { era: r.era, set: new Set(), questions: 0 }); f.questions++; if (r.fact_group_id) f.set.add(r.fact_group_id); }
    return {
      byEra, byDifficulty, minAttempts: MIN_ATTEMPTS,
      scoreDist: Object.entries(dist).map(([bucket, c]) => ({ bucket: Number(bucket), c })),
      hardest: [...enough].sort((a, b) => a.accuracy - b.accuracy).slice(0, 15),
      easiest: [...enough].sort((a, b) => b.accuracy - a.accuracy).slice(0, 15),
      factCoverage: Object.values(facts).map((f) => ({ era: f.era, facts: f.set.size, questions: f.questions })),
    };
  }

  if (p === '/runs') {
    const cons = [where('status', '==', 'FINISHED')];
    if (qs.flagged === '1') cons.push(where('flagged', '==', true));
    if (qs.week) cons.push(where('weekKey', '==', qs.week));
    const snap = await getDocs(query(collection(fs, 'runs'), ...cons, orderBy('finishedAt', 'desc'), limit(500)));
    let rows = snap.docs.map((d) => runRow(d.data()));
    if (qs.nickname) rows = rows.filter((r) => (r.nickname || '').includes(qs.nickname));
    const page = Math.max(1, Number(qs.page) || 1);
    const blocked = new Set();
    const uids = [...new Set(rows.slice((page - 1) * 50, page * 50).map((r) => r.user_id))];
    await Promise.all(uids.map(async (u) => { if ((await getDoc(doc(fs, 'users', u))).data()?.blocked) blocked.add(u); }));
    return { total: rows.length, page, rows: rows.slice((page - 1) * 50, page * 50).map((r) => ({ ...r, blocked: blocked.has(r.user_id) ? 1 : 0 })) };
  }
  if (seg[0] === 'runs' && seg[2] === 'disqualify') return call('adminDisqualify', { runId: seg[1], value: !!opts.body?.value });
  if (seg[0] === 'runs' && seg[1]) {
    const d = await call('adminRunDetail', { runId: seg[1] });
    return {
      run: runRow(d.run),
      questions: d.questions.map((x) => ({ seq: x.seq, question_id: x.qid, status: x.status, elapsed_ms: x.elapsed ?? null, points: x.points ?? null, is_correct: x.correct ? 1 : 0, too_fast: x.tooFast ? 1 : 0, focus_lost: x.focusLost || 0, read_window_ms: x.win, question: x.question })),
    };
  }
  if (seg[0] === 'users' && seg[2] === 'block') return call('adminBlockUser', { uid: seg[1], value: !!opts.body?.value });

  if (p === '/ranking') {
    const thisWeek = weekKey(), lastWeek = weekKey(Date.now() - 7 * 86400e3);
    const week = qs.week || thisWeek;
    const snap = await getDocs(query(collection(fs, 'weeks', week, 'best'), orderBy('score', 'desc'), orderBy('timeMs', 'asc'), orderBy('finishedAt', 'asc'), limit(200)));
    return { week, thisWeek, lastWeek, list: snap.docs.map((d, i) => ({ rank: i + 1, nickname: d.data().nickname, score: d.data().score, correct_count: d.data().correct, total_time_ms: d.data().timeMs, finished_at: d.data().finishedAt, run_id: d.data().runId })) };
  }

  if (p === '/settings' && method === 'GET') {
    return { only_approved: '0', daily_play_limit: '0', avoid_recent_days: '14', ...((await getDoc(doc(fs, 'settings', 'game'))).data() || {}) };
  }
  if (p === '/settings' && method === 'PUT') return call('adminSetSettings', opts.body);

  throw new Error('알 수 없는 요청: ' + path);
}

/** 현재 필터 결과를 CSV/JSON 파일로 내려받기 (브라우저에서 바로 만듦) */
export async function exportQuestions(qs = {}, { format = 'csv', stats = false } = {}) {
  await loadAll(true);
  const rows = sortRows(filterRows(qs), 'id', 'asc');
  const FIELDS = ['id', 'era', 'period', 'topic', 'fact_group_id', 'source_type', 'exam_year', 'exam_round', 'exam_question_no', 'source_url', 'difficulty', 'review_status', 'status', 'question', 'option_1', 'option_2', 'option_3', 'option_4', 'correct_option', 'explanation', 'memo'];
  const stamp = new Date().toISOString().slice(0, 10);
  let blob, name;
  if (format === 'json') {
    blob = new Blob([JSON.stringify(rows.map((r) => Object.fromEntries(FIELDS.map((f) => [f, r[f] ?? null]))), null, 2)], { type: 'application/json' });
    name = `${META.series.id}-questions-${stamp}.json`;
  } else {
    const cols = [...FIELDS, ...(stats ? ['attempts', 'correct_cnt', 'wrong_cnt', 'timeout_cnt', 'accuracy', 'avg_correct_ms', 'pick_1', 'pick_2', 'pick_3', 'pick_4'] : [])];
    const esc = (v) => { if (v == null) return ''; const s = String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    blob = new Blob(['﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\r\n')], { type: 'text/csv' });
    name = `${META.series.id}-questions-${stamp}.csv`;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
