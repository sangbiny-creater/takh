// 그림(아트) 자리 목록 — GPT 로 만든 그림을 web/assets/gpt/ 에 아래 파일 이름으로 넣으면 바로 바뀜.
//  파일이 아직 없으면 두 번째 값(임시 그림 또는 아이콘)으로 자동 대체된다.
//  프롬프트: docs/GPT_IMAGE_PROMPTS.md · 원본(크로마키)은 art-src/ 에 넣고 npm run art 로 잘라서 여기로 옴
const svgData = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

// 임시 아이콘 (GPT 아이콘이 들어오기 전까지)
const I = {
  trophy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M14 6h20v12a10 10 0 0 1-20 0z" fill="#FFC23D"/><path d="M14 9H7v4a7 7 0 0 0 7 7M34 9h7v4a7 7 0 0 1-7 7" fill="none" stroke="#F4A51C" stroke-width="3"/><path d="M20 28h8v6h-8z" fill="#F4A51C"/><rect x="14" y="34" width="20" height="6" rx="2" fill="#E8901A"/></svg>',
  chart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="6" y="24" width="9" height="18" rx="3" fill="#47A276"/><rect x="19.5" y="15" width="9" height="27" rx="3" fill="#2E7D5B"/><rect x="33" y="6" width="9" height="36" rx="3" fill="#47A276"/></svg>',
  learn: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M4 11c6-3 13-3 20 1v28c-7-4-14-4-20-1z" fill="#E3F4E4" stroke="#2E7D5B" stroke-width="3" stroke-linejoin="round"/><path d="M44 11c-6-3-13-3-20 1v28c7-4 14-4 20-1z" fill="#E3F4E4" stroke="#2E7D5B" stroke-width="3" stroke-linejoin="round"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 4l6 12.6 13.8 1.8-10.1 9.6 2.6 13.7L24 35l-12.3 6.7 2.6-13.7L4.2 18.4 18 16.6z" fill="#FFC23D" stroke="#F4A51C" stroke-width="2.5" stroke-linejoin="round"/></svg>',
  medal: (n, c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="${c}" stroke="#fff" stroke-width="4"/><text x="24" y="31" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="900" fill="#fff">${n}</text></svg>`,
};

export const ART = {
  logo: ['ui_logo.png', 'hunmin.png'],
  homeScene: ['bg_home_scene.png', 'palace.png'],
  mascotHero: ['mascot_hero.png', 'king.png'],
  mascotBook: ['mascot_book.png', 'king_book.png'],
  mascotCorrect: ['mascot_correct.png', 'king.png'],
  mascotWrong: ['mascot_wrong.png', 'king_write.png'],
  mascotTimeout: ['mascot_timeout.png', 'king_book.png'],
  mascotWrite: ['mascot_write.png', 'king_write.png'],
  mascotFinish: ['mascot_finish.png', 'king.png'],
  iconTrophy: ['icon_trophy.png', svgData(I.trophy)],
  iconChart: ['icon_chart.png', svgData(I.chart)],
  iconLearn: ['icon_learn.png', svgData(I.learn)],
  iconStar: ['icon_star.png', svgData(I.star)],
  crown: ['ui_crown.png', 'crown.png'],
  medal2: ['ui_medal_2.png', svgData(I.medal(2, '#A8B4BD'))],
  medal3: ['ui_medal_3.png', svgData(I.medal(3, '#F29A4A'))],
  rankingScene: ['bg_ranking.png', 'palace.png'],
  resultDeco: ['ui_result_deco.png', 'cheomseongdae.png'],
  emptyState: ['ui_empty.png', 'turtleship.png'],
};

// 시대별 대표 그림 (DB 의 era 값 기준)
export const ERA_ART = {
  '선사': ['era_01_prehistoric.png', 'king_book.png'],
  '고조선·여러 나라': ['era_02_gojoseon.png', 'king_book.png'],
  '삼국': ['era_03_three_kingdoms.png', 'crown.png'],
  '남북국': ['era_04_north_south.png', 'cheomseongdae.png'],
  '고려': ['era_05_goryeo.png', 'king_book.png'],
  '조선 전기': ['era_06_joseon_early.png', 'hunmin.png'],
  '조선 후기': ['era_07_joseon_late.png', 'palace.png'],
  '근대': ['era_08_modern.png', 'king_book.png'],
  '일제강점기': ['era_09_colonial.png', 'king_book.png'],
  '현대': ['era_10_contemporary.png', 'king_book.png'],
};

const AVATAR_COUNT = 8;
const AVATAR_COLORS = ['#2E7D5B', '#FF9E3D', '#4F8EDC', '#B76BD9', '#E5484D', '#1FA6A0', '#8B6F47', '#5B6CF0'];
const hash = (s) => [...(s || '?')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function src(file) { return !file ? '' : file.startsWith('data:') ? file : file.startsWith('gpt/') ? `assets/${file}` : `assets/${file}`; }

/** <img> 태그: GPT 그림 → 없으면 임시 그림 */
export function art(key, { cls = '', alt = '' } = {}) {
  const [main, fb] = ART[key] || [null, null];
  return imgTag(main, fb, cls, alt);
}
export function eraArt(era, { cls = '', alt = '' } = {}) {
  const [main, fb] = ERA_ART[era] || ['era_default.png', 'king_book.png'];
  return imgTag(main, fb, cls, alt || era);
}
function imgTag(main, fb, cls, alt) {
  const primary = main ? `assets/gpt/${main}` : src(fb);
  const fallback = fb ? src(fb) : '';
  const onerr = fallback ? `this.onerror=null;this.src='${fallback}'` : `this.onerror=null;this.style.visibility='hidden'`;
  return `<img class="${cls}" src="${primary}" alt="${esc(alt)}" onerror="${onerr}" draggable="false">`;
}

/** 랭킹 아바타: GPT 아바타(8종) → 없으면 글자 아바타 */
export function avatar(nick, cls = '') {
  const h = hash(nick);
  const n = String((h % AVATAR_COUNT) + 1).padStart(2, '0');
  const letter = [...(nick || '?')][0];
  const fb = svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${AVATAR_COLORS[h % AVATAR_COLORS.length]}"/><text x="32" y="42" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="900" fill="#fff">${esc(letter)}</text></svg>`);
  return `<img class="avatar ${cls}" src="assets/gpt/avatar_${n}.png" alt="" onerror="this.onerror=null;this.src='${fb}'" draggable="false">`;
}
