// GeoMarket Live — compléments (retours AS, bloc 2) : détails de séance, or multi-devises et multi-unités,
// historique long avec comparaison d'actifs, tableau des devises au comptant, suivi PE/VC.
// Données : fonction market-quotes (Yahoo Finance, différé). Module chargé par les pages Marché et Thèmes.
import { n as interop } from './rolldown-runtime-CbXtAM7H.js';
import { h as reactModule, i as Link } from './vendor-DKINCJCV.js';
import { St as currentLang } from './index-iZJ0IRVS.js';

const React = interop(reactModule(), 1);
const h = React.createElement;
const { useState, useEffect, useMemo, useRef } = React;
const API = 'https://qleeggufkhdwadhuqnzg.supabase.co/functions/v1/market-quotes';
const OZ = 31.1034768;

// ---------- Textes ----------
const TXT = {
  fr: {
    details: 'Détails de la séance', show: 'Afficher', hl: 'Haut – Bas', oc: 'Ouverture – Clôture', w52: '52 semaines', vol: 'Volume',
    last: 'Dernier cours', prev: 'Clôture veille', open: 'Ouverture', change: 'Variation du jour', dayHigh: 'Plus haut du jour', dayLow: 'Plus bas du jour',
    w52High: 'Plus haut 52 sem.', w52Low: 'Plus bas 52 sem.', volume: 'Volume', ytd: 'Depuis le 1er janvier', y1: 'Sur 1 an',
    depth: 'Profondeur de marché', depthNA: 'Non disponible',
    depthNote: 'Le carnet d’ordres (profondeur de marché) exige un flux payant de la place de cotation ; il n’est pas proposé dans GeoMarket Live.',
    source: 'Yahoo Finance · différé', currency: 'Devise', unit: 'Unité', oz: 'once', g: 'gramme', kg: 'kilo',
    goldTable: 'Prix de l’or par devise et par poids', perOz: 'Once troy', perG: 'Gramme', perKg: 'Kilo',
    goldNote: 'Contrat à terme COMEX le plus proche, converti aux cours EUR/USD et GBP/USD du moment. 1 once troy = 31,1035 g.',
    history: 'Historique long et comparaison', compare: 'Comparer avec…', base100: 'Base 100 au début de la période',
    since: 'Historique disponible depuis', monthly: 'Points mensuels au-delà de 10 ans, hebdomadaires de 5 à 10 ans.',
    loading: 'Chargement…', error: 'Données momentanément indisponibles.', retry: 'Réessayer', remove: 'Retirer',
    fxTitle: 'Devises au comptant', fxNote: 'Cours au comptant, différés. Une paire USD/XXX indique le nombre d’unités de XXX pour 1 dollar.',
    pevcTitle: 'Capital-investissement et capital-risque (PE/VC)', pevcNote: 'Sociétés de gestion et véhicules cotés du non-coté : indicateur de l’appétit des investisseurs pour le PE/VC. Cours en devise de cotation.',
    pevcNews: 'Actualités PE/VC →', pair: 'Paire', name: 'Valeur', price: 'Cours', day: 'Jour', range: 'Haut / Bas du jour', r52: 'Haut / Bas 52 sem.', cur: 'Devise',
    groups: { Majeures: 'Majeures', 'Croisées euro': 'Croisées euro', Asie: 'Asie', 'Asie du Sud-Est': 'Asie du Sud-Est', Autres: 'Autres', Indice: 'Indice', 'Capital-investissement': 'Capital-investissement', 'Capital-risque': 'Capital-risque' },
    yearShort: 'A', monthShort: 'M', max: 'Max',
  },
  en: {
    details: 'Session details', show: 'Show', hl: 'High – Low', oc: 'Open – Close', w52: '52 weeks', vol: 'Volume',
    last: 'Last price', prev: 'Previous close', open: 'Open', change: 'Day change', dayHigh: 'Day high', dayLow: 'Day low',
    w52High: '52-week high', w52Low: '52-week low', volume: 'Volume', ytd: 'Year to date', y1: '1 year',
    depth: 'Depth of market', depthNA: 'Not available',
    depthNote: 'The order book (depth of market) requires a paid feed from the exchange; it is not offered in GeoMarket Live.',
    source: 'Yahoo Finance · delayed', currency: 'Currency', unit: 'Unit', oz: 'ounce', g: 'gram', kg: 'kilo',
    goldTable: 'Gold price by currency and weight', perOz: 'Troy ounce', perG: 'Gram', perKg: 'Kilo',
    goldNote: 'Front-month COMEX future, converted at current EUR/USD and GBP/USD rates. 1 troy ounce = 31.1035 g.',
    history: 'Long history and comparison', compare: 'Compare with…', base100: 'Rebased to 100 at the start of the period',
    since: 'History available since', monthly: 'Monthly points beyond 10 years, weekly from 5 to 10 years.',
    loading: 'Loading…', error: 'Data temporarily unavailable.', retry: 'Retry', remove: 'Remove',
    fxTitle: 'Spot currencies', fxNote: 'Delayed spot rates. A USD/XXX pair shows how many units of XXX buy 1 dollar.',
    pevcTitle: 'Private equity and venture capital (PE/VC)', pevcNote: 'Listed managers and vehicles of private markets: a gauge of investor appetite for PE/VC. Prices in trading currency.',
    pevcNews: 'PE/VC news →', pair: 'Pair', name: 'Name', price: 'Price', day: 'Day', range: 'Day high / low', r52: '52-week high / low', cur: 'Currency',
    groups: { Majeures: 'Majors', 'Croisées euro': 'Euro crosses', Asie: 'Asia', 'Asie du Sud-Est': 'South-East Asia', Autres: 'Others', Indice: 'Index', 'Capital-investissement': 'Private equity', 'Capital-risque': 'Venture capital' },
    yearShort: 'Y', monthShort: 'M', max: 'Max',
  },
};
const lang = () => { try { return currentLang() || 'fr'; } catch { return 'fr'; } };
const t = (k) => (TXT[lang()] ?? TXT.en)[k] ?? TXT.fr[k];
const groupName = (g) => t('groups')[g] ?? g;

// ---------- Données ----------
const cache = new Map();
function getJson(url, ttl) {
  const c = cache.get(url);
  if (c && Date.now() - c.at < ttl) return c.p;
  const p = fetch(url).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
  cache.set(url, { at: Date.now(), p });
  p.catch(() => cache.delete(url));
  return p;
}
function useJson(url, ttl = 60000) {
  const [state, setState] = useState({ data: null, error: null });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!url) return undefined;
    let live = true;
    setState((s) => ({ data: s.data, error: null }));
    getJson(url, ttl).then((data) => live && setState({ data, error: null }), (error) => live && setState({ data: null, error }));
    return () => { live = false; };
  }, [url, n]);
  return { ...state, reload: () => { cache.delete(url); setN((x) => x + 1); } };
}

// ---------- Format ----------
const fmt = (v, d = 2) => (v === null || v === undefined || !Number.isFinite(v) ? '—'
  : new Intl.NumberFormat(lang(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(v));
const autoDec = (v) => (v === null || v === undefined ? 2 : Math.abs(v) >= 1000 ? 0 : Math.abs(v) >= 100 ? 2 : Math.abs(v) >= 10 ? 3 : 4);
const pct = (v) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${fmt(Math.abs(v), 2)} %`);
const tone = (v) => (v > 0 ? 'up' : v < 0 ? 'down' : 'flat');
const compact = (v) => (v === null || v === undefined || !Number.isFinite(v) || v === 0 ? '—'
  : new Intl.NumberFormat(lang(), { notation: 'compact', maximumFractionDigits: 1 }).format(v));
const when = (iso) => { try { return new Date(iso).toLocaleString(lang(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

function Seg({ options, value, onChange, label, multi }) {
  return h('div', { className: 'seg', role: 'group', 'aria-label': label, style: { flexWrap: 'wrap' } }, options.map(([k, l]) => h('button', {
    key: k, type: 'button', 'aria-pressed': multi ? !!value[k] : value === k,
    onClick: () => onChange(multi ? { ...value, [k]: !value[k] } : k),
  }, l)));
}
function Status({ q }) {
  if (q.error) return h('div', { className: 'notice warn' }, h('span', null, t('error'), ' '), h('button', { type: 'button', className: 'link-btn', onClick: q.reload }, t('retry')));
  return h('div', { className: 'skeleton', style: { minHeight: 90 } });
}

// ---------- 1. Détails de la séance (et or multi-devises / multi-unités) ----------
export const DETAIL_IDS = ['gold', 'silver', 'brent', 'wti', 'spx', 'nasdaq', 'dow', 'stoxx600', 'vix', 'eurusd', 'eurchf', 'eurgbp', 'us10y'];

export function GMDetails({ id, decimals }) {
  const isGold = id === 'gold';
  const q = useJson(DETAIL_IDS.includes(id) ? `${API}?quotes=${isGold ? 'gold,eurusd,gbpusd' : id}` : null);
  const [show, setShow] = useState({ hl: true, oc: true, w52: true, vol: true });
  const [cur, setCur] = useState('USD');
  const [unit, setUnit] = useState('oz');
  if (!DETAIL_IDS.includes(id)) return null;
  const rows = q.data ?? [];
  const main = rows.find((r) => r.key === id);
  const eurusd = rows.find((r) => r.key === 'eurusd')?.price;
  const gbpusd = rows.find((r) => r.key === 'gbpusd')?.price;
  const fx = (c) => (c === 'USD' ? 1 : c === 'EUR' ? (eurusd ? 1 / eurusd : null) : (gbpusd ? 1 / gbpusd : null));
  const per = (u) => (u === 'oz' ? 1 : u === 'g' ? 1 / OZ : 1000 / OZ);
  const k = isGold ? (fx(cur) ?? NaN) * per(unit) : 1;
  const d = isGold ? (unit === 'kg' ? 0 : 2) : (decimals ?? autoDec(main?.price));
  const P = (v) => (v === null || v === undefined ? null : v * k);
  const cell = (label, value, cls) => h('div', { key: label }, h('span', { className: 'xs muted' }, label), h('span', { className: `mono ${cls ?? ''}`, style: { fontSize: 15 } }, value));
  const cells = main && !main.error ? [
    cell(t('last'), fmt(P(main.price), d)),
    cell(t('change'), pct(main.changePct), tone(main.changePct)),
    ...(show.oc ? [cell(t('open'), fmt(P(main.open), d)), cell(t('prev'), fmt(P(main.prevClose), d))] : []),
    ...(show.hl ? [cell(t('dayHigh'), fmt(P(main.dayHigh), d)), cell(t('dayLow'), fmt(P(main.dayLow), d))] : []),
    ...(show.w52 ? [cell(t('w52High'), fmt(P(main.w52High), d)), cell(t('w52Low'), fmt(P(main.w52Low), d))] : []),
    ...(show.vol ? [cell(t('volume'), compact(main.volume))] : []),
    cell(t('ytd'), pct(main.perfYtd), tone(main.perfYtd)),
    cell(t('y1'), pct(main.perf1y), tone(main.perf1y)),
    cell(t('depth'), t('depthNA'), 'faint'),
  ] : null;
  return h('section', { className: 'stack', style: { gap: 12 } },
    h('div', { className: 'section-head' }, h('h2', { className: 'h2' }, t('details')),
      h('span', { className: 'xs muted' }, t('source'), main?.time ? ` · ${when(main.time)}` : '', main?.exchange ? ` · ${main.exchange}` : '')),
    h('div', { className: 'row no-print', style: { gap: 10 } },
      h(Seg, { multi: true, label: t('show'), value: show, onChange: setShow, options: [['hl', t('hl')], ['oc', t('oc')], ['w52', t('w52')], ['vol', t('vol')]] }),
      isGold && h(Seg, { label: t('currency'), value: cur, onChange: setCur, options: [['USD', 'USD'], ['EUR', 'EUR'], ['GBP', 'GBP']] }),
      isGold && h(Seg, { label: t('unit'), value: unit, onChange: setUnit, options: [['oz', t('oz')], ['g', t('g')], ['kg', t('kg')]] })),
    cells ? h('div', { className: 'facts' }, cells) : h(Status, { q }),
    isGold && main && !main.error && eurusd && gbpusd && h(GoldTable, { usd: main.price, eurusd, gbpusd }),
    h('p', { className: 'italic-note' }, t('depthNote')));
}

function GoldTable({ usd, eurusd, gbpusd }) {
  const curs = [['USD', 1], ['EUR', 1 / eurusd], ['GBP', 1 / gbpusd]];
  const units = [[t('perOz'), 1, 2], [t('perG'), 1 / OZ, 2], [t('perKg'), 1000 / OZ, 0]];
  return h('div', { className: 'stack', style: { gap: 8 } },
    h('h3', { className: 'caps' }, t('goldTable')),
    h('div', { className: 'table-wrap' }, h('table', { className: 'table' },
      h('thead', null, h('tr', null, h('th', null, t('unit')), curs.map(([c]) => h('th', { key: c, className: 'num' }, c)))),
      h('tbody', null, units.map(([u, f, d]) => h('tr', { key: u }, h('td', null, u), curs.map(([c, x]) => h('td', { key: c, className: 'num' }, fmt(usd * x * f, d)))))))),
    h('span', { className: 'xs faint' }, t('goldNote')));
}

// ---------- 2. Historique long et comparaison ----------
const NAMES = { gold: 'Or', silver: 'Argent', brent: 'Brent', wti: 'WTI', spx: 'S&P 500', nasdaq: 'Nasdaq', dow: 'Dow Jones', stoxx600: 'STOXX 600', vix: 'VIX', eurusd: 'EUR/USD', eurchf: 'EUR/CHF', eurgbp: 'EUR/GBP', us10y: 'Taux US 10 ans' };
const NAMES_EN = { gold: 'Gold', silver: 'Silver', brent: 'Brent', wti: 'WTI', spx: 'S&P 500', nasdaq: 'Nasdaq', dow: 'Dow Jones', stoxx600: 'STOXX 600', vix: 'VIX', eurusd: 'EUR/USD', eurchf: 'EUR/CHF', eurgbp: 'EUR/GBP', us10y: 'US 10Y yield' };
const nameOf = (id) => (lang() === 'fr' ? NAMES : NAMES_EN)[id] ?? id;
const COLORS = ['var(--gold)', '#6fa8ff', '#5dbb8f', '#e8616f', '#c792ea'];
const YEARS = [15, 20, 25, 30, 35, 40, 45];
const periods = () => [
  ['1mo', `1 ${t('monthShort')}`], ['3mo', `3 ${t('monthShort')}`], ['6mo', `6 ${t('monthShort')}`], ['1y', `1 ${t('yearShort')}`], ['2y', `2 ${t('yearShort')}`],
  ['5y', `5 ${t('yearShort')}`], ['10y', `10 ${t('yearShort')}`], ...YEARS.map((y) => [`${y}y`, `${y} ${t('yearShort')}`]), ['max', t('max')],
];
const apiRange = (p) => (YEARS.includes(parseInt(p, 10)) && p.endsWith('y') && parseInt(p, 10) > 10 ? 'max' : p);

function useSeries(ids, period) {
  const [state, setState] = useState({ data: null, error: null });
  const key = `${ids.join(',')}|${period}`;
  useEffect(() => {
    let live = true;
    setState((s) => ({ data: s.data, error: null }));
    Promise.all(ids.map((id) => getJson(`${API}?history=${id}&range=${apiRange(period)}`, 900000)))
      .then((data) => live && setState({ data, error: null }), (error) => live && setState({ data: null, error }));
    return () => { live = false; };
  }, [key]);
  return state;
}

export function GMLong({ id }) {
  const [period, setPeriod] = useState('5y');
  const [extraAll, setExtra] = useState([]);
  const ok = DETAIL_IDS.includes(id);
  const extra = extraAll.filter((x) => x !== id);
  const ids = [id, ...extra];
  const s = useSeries(ok ? ids : [], period);
  const years = parseInt(period, 10);
  const cutoff = period.endsWith('y') && years > 10 ? Date.now() - years * 365.25 * 864e5 : -Infinity;
  const series = useMemo(() => (s.data ?? []).map((d, i) => ({ id: d.key, name: nameOf(d.key), color: COLORS[i], currency: d.currency, first: d.first, points: d.points.filter((p) => p[0] >= cutoff) })), [s.data, cutoff]);
  if (!ok) return null;
  const norm = ids.length > 1;
  const shown = norm ? series.map((x) => { const b = x.points[0]?.[1]; return { ...x, points: b ? x.points.map((p) => [p[0], (p[1] / b) * 100]) : [] }; }) : series;
  const firstAvail = series[0]?.points[0]?.[0];
  const short = firstAvail && cutoff > -Infinity && firstAvail > cutoff + 365 * 864e5;
  return h('section', { className: 'stack', style: { gap: 12 } },
    h('div', { className: 'section-head' }, h('h2', { className: 'h2' }, t('history')), h('span', { className: 'xs muted' }, t('source'))),
    h('div', { className: 'no-print', style: { overflowX: 'auto' } }, h(Seg, { label: t('history'), value: period, onChange: setPeriod, options: periods() })),
    h('div', { className: 'row no-print', style: { gap: 8 } },
      ids.map((x, i) => h('span', { key: x, className: 'chip', style: { borderColor: COLORS[i], color: 'var(--ivory)' } },
        h('i', { style: { display: 'inline-block', width: 10, height: 2, background: COLORS[i] } }), nameOf(x),
        i > 0 && h('button', { type: 'button', className: 'link-btn', 'aria-label': `${t('remove')} ${nameOf(x)}`, onClick: () => setExtra(extra.filter((y) => y !== x)) }, '×'))),
      ids.length < 5 && h('select', { className: 'input', style: { width: 'auto', padding: '6px 10px', fontSize: 13 }, value: '', onChange: (e) => e.target.value && setExtra([...extra, e.target.value]) },
        h('option', { value: '' }, t('compare')), DETAIL_IDS.filter((x) => !ids.includes(x)).map((x) => h('option', { key: x, value: x }, nameOf(x))))),
    s.data ? h(LineChart, { series: shown, norm, decimals: norm ? 1 : autoDec(series[0]?.points.at(-1)?.[1]), long: period === 'max' || years >= 5 })
      : s.error ? h(Status, { q: { error: s.error, reload: () => setPeriod((p) => p) } }) : h('div', { className: 'skeleton', style: { minHeight: 300 } }),
    h('span', { className: 'xs faint' }, [norm ? t('base100') : series[0]?.currency ?? '', firstAvail ? `${t('since')} ${new Date(firstAvail).toLocaleDateString(lang(), { month: 'long', year: 'numeric' })}` : '', t('monthly')].filter(Boolean).join(' · '),
      short ? ' ⚠' : ''));
}

function LineChart({ series, norm, decimals, long }) {
  const W = 820, H = 300, L = 8, Rm = 64, Tm = 12, B = 26;
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  const all = series.flatMap((s) => s.points);
  if (all.length < 2) return h('div', { className: 'empty' }, t('error'));
  const t0 = Math.min(...all.map((p) => p[0])), t1 = Math.max(...all.map((p) => p[0]));
  let v0 = Math.min(...all.map((p) => p[1])), v1 = Math.max(...all.map((p) => p[1]));
  const pad = (v1 - v0) * 0.06 || 1; v0 -= pad; v1 += pad;
  const X = (x) => L + ((x - t0) / (t1 - t0 || 1)) * (W - L - Rm);
  const Y = (y) => Tm + (1 - (y - v0) / (v1 - v0)) * (H - Tm - B);
  const ticksY = [0, 1, 2, 3, 4].map((i) => v0 + ((v1 - v0) * i) / 4);
  const ticksX = [0, 1, 2, 3, 4, 5].map((i) => t0 + ((t1 - t0) * i) / 5);
  const xl = (x) => new Date(x).toLocaleDateString(lang(), long ? { year: 'numeric' } : { month: 'short', year: '2-digit' });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = t0 + (((e.clientX - r.left) / r.width) * W - L) / (W - L - Rm) * (t1 - t0);
    const near = (pts) => pts.reduce((b, p) => (Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b), pts[0]);
    const p0 = series[0].points.length ? near(series[0].points) : null;
    if (p0) setHover({ t: p0[0], vals: series.map((s) => (s.points.length ? near(s.points)[1] : null)) });
  };
  return h('div', { className: 'chart', style: { padding: 12 } },
    h('svg', { ref, viewBox: `0 0 ${W} ${H}`, style: { width: '100%', height: 'auto', position: 'static', display: 'block' }, onMouseMove: onMove, onMouseLeave: () => setHover(null), role: 'img' },
      ticksY.map((v, i) => h('g', { key: `y${i}` },
        h('line', { x1: L, x2: W - Rm, y1: Y(v), y2: Y(v), stroke: 'var(--grid)', strokeWidth: 1 }),
        h('text', { x: W - Rm + 6, y: Y(v) + 4, fill: 'var(--faint)', fontSize: 11, fontFamily: 'var(--mono)' }, fmt(v, decimals)))),
      ticksX.map((x, i) => h('text', { key: `x${i}`, x: X(x), y: H - 6, fill: 'var(--faint)', fontSize: 11, fontFamily: 'var(--mono)', textAnchor: i === 0 ? 'start' : i === 5 ? 'end' : 'middle' }, xl(x))),
      norm && h('line', { x1: L, x2: W - Rm, y1: Y(100), y2: Y(100), stroke: 'var(--rule-strong)', strokeDasharray: '3 3' }),
      series.map((s) => h('polyline', { key: s.id, fill: 'none', stroke: s.color, strokeWidth: 1.6, strokeLinejoin: 'round', points: s.points.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ') })),
      hover && h('line', { x1: X(hover.t), x2: X(hover.t), y1: Tm, y2: H - B, stroke: 'var(--rule-strong)' })),
    h('div', { className: 'legend', style: { marginTop: 6, minHeight: 18 } },
      hover ? [h('span', { key: 'd', className: 'mono' }, new Date(hover.t).toLocaleDateString(lang(), { day: '2-digit', month: 'short', year: 'numeric' })),
        ...series.map((s, i) => h('span', { key: s.id, className: 'mono' }, h('i', { style: { background: s.color } }), `${s.name} ${fmt(hover.vals[i], decimals)}`))]
        : series.map((s) => h('span', { key: s.id }, h('i', { style: { background: s.color } }), s.name))));
}

// ---------- 3. Tableaux : devises au comptant, PE/VC ----------
function QuoteTable({ set, title, note, footer, showCurrency, showYear }) {
  const q = useJson(`${API}?quotes=${set}`);
  const rows = (q.data ?? []).filter((r) => !r.error && r.price !== null);
  const groups = [...new Set(rows.map((r) => r.group))];
  const updated = rows.map((r) => r.time).sort().at(-1);
  const cols = 5 + (showCurrency ? 1 : 0) + (showYear ? 1 : 0);
  return h('section', { className: 'stack', style: { gap: 12 } },
    h('div', { className: 'section-head' }, h('h2', { className: 'h2' }, title), h('span', { className: 'xs muted' }, t('source'), updated ? ` · ${when(updated)}` : '')),
    h('p', { className: 'small muted' }, note),
    q.data ? h('div', { className: 'table-wrap' }, h('table', { className: 'table' },
      h('thead', null, h('tr', null, h('th', null, set === 'fx' ? t('pair') : t('name')), showCurrency && h('th', null, t('cur')), h('th', { className: 'num' }, t('price')),
        h('th', { className: 'num' }, t('day')), h('th', { className: 'num' }, t('range')), h('th', { className: 'num' }, t('r52')), h('th', { className: 'num' }, t('ytd')), showYear && h('th', { className: 'num' }, t('y1')))),
      h('tbody', null, groups.flatMap((g) => [
        h('tr', { key: `g-${g}` }, h('td', { colSpan: cols + 1, className: 'caps', style: { background: 'var(--night-3)', paddingTop: 8, paddingBottom: 8 } }, groupName(g))),
        ...rows.filter((r) => r.group === g).map((r) => {
          const d = set === 'fx' ? autoDec(r.price) : Math.abs(r.price) >= 1000 ? 0 : 2;
          return h('tr', { key: r.key },
            h('td', null, r.name), showCurrency && h('td', { className: 'muted' }, r.currency === 'GBp' ? 'GBX' : r.currency),
            h('td', { className: 'num' }, fmt(r.price, d)), h('td', { className: `num ${tone(r.changePct)}` }, pct(r.changePct)),
            h('td', { className: 'num muted' }, `${fmt(r.dayHigh, d)} / ${fmt(r.dayLow, d)}`), h('td', { className: 'num muted' }, `${fmt(r.w52High, d)} / ${fmt(r.w52Low, d)}`),
            h('td', { className: `num ${tone(r.perfYtd)}` }, pct(r.perfYtd)), showYear && h('td', { className: `num ${tone(r.perf1y)}` }, pct(r.perf1y)));
        }),
      ])))) : h(Status, { q }),
    footer);
}

export function GMFx() {
  return h(QuoteTable, { set: 'fx', title: t('fxTitle'), note: t('fxNote') });
}
export function GMPevc() {
  return h(QuoteTable, { set: 'pevc', title: t('pevcTitle'), note: t('pevcNote'), showCurrency: true, showYear: true,
    footer: h(Link, { to: '/actualites?q=PE%2FVC', className: 'small' }, t('pevcNews')) });
}
