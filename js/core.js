/* 言の葉日文課 — content registry and the small markup language every lesson is written in.
 *
 * Block syntax (one per line):
 *   ## / ###          headings (## goes into the page outline)
 *   - item, 1. item   lists
 *   | a | b |         tables (first row is the header)
 *   > text            pull quote
 *   ::ex … ::         example sentence. Plain lines = Japanese, "= " translation,
 *                     "@ workId | where" source, "+ " note, "~ " modern reading for TTS
 *   ::quiz … ::       "Q: " question, "* " right answer, "- " wrong answer, "E: " explanation
 *   ::practice 標題   prompt lines, "= " short answer, ">> " full explanation lines
 *   ::vocab 標題      "word | meaning | note"
 *   ::dialog 標題     "名字: 日本語" then "= 中文"
 *   ::kana set        kana chart (hira, kata, hira-daku, kata-daku, hira-yoon, kata-yoon, kata-ext)
 *   ::tip / ::warn / ::note / ::story / ::listen 標題   callouts (may contain other blocks)
 * Inline: 漢字[かな] or {base|reading} ruby, **bold**, ==highlight==, [[lessonId|link text]].
 */
(function () {
  'use strict';
  var K = window.K = { lessons: [], byId: {}, works: {}, pages: {}, ex: [], vocab: [] };
  var reg = 0;
  window.LESSON = function (o) {
    o._i = reg++;
    if (K.byId[o.id]) console.warn('duplicate lesson id', o.id);
    K.lessons.push(o); K.byId[o.id] = o;
  };
  window.WORKS = function (o) {
    Object.keys(o).forEach(function (k) {
      if (K.works[k]) console.warn('duplicate work id', k);
      K.works[k] = o[k];
    });
  };
  window.PAGE = function (o) { K.pages[o.id] = o; };

  /* Playlist songs live in js/songs/ and load only when a song page is opened. */
  K.songs = []; K.songById = {}; K.songG = {};
  window.SONG = function (o) {
    if (K.songById[o.k]) { console.warn('duplicate song', o.k); return; }
    o.n = K.songs.length + 1;
    K.songs.push(o); K.songById[o.k] = o;
  };
  window.SONGG = function (o) { Object.keys(o).forEach(function (k) { K.songG[k] = o[k]; }); };
  K.songParts = ['g', 'a', 'b', 'c', 'd', 'e', 'f', 'g2', 'h'];
  var songState = 0, songWait = [];
  K.loadSongs = function (cb) {
    if (songState === 2) { if (cb) cb(); return; }
    if (cb) songWait.push(cb);
    if (songState === 1) return;
    songState = 1;
    var left = K.songParts.length;
    function one() {
      if (--left) return;
      songState = 2;
      var w = songWait; songWait = [];
      w.forEach(function (f) { f(); });
    }
    K.songParts.forEach(function (p) {
      var s = document.createElement('script');
      s.src = 'js/songs/' + p + '.js';
      s.async = false;
      s.onload = one;
      s.onerror = function () { console.warn('song file failed', p); one(); };
      document.body.appendChild(s);
    });
  };
  K.songsReady = function () { return songState === 2; };

  /* 單字大全 lives in js/dict/ and loads only when the dictionary, search or flashcards need it.
     Row format: 單字|讀音|詞類|程度|意思|什麼時候用|例句=翻譯§例句=翻譯|相關詞、相關詞|課程id */
  K.dictCats = []; K.dictCatById = {}; K.dict = []; K.dictById = {};
  window.DICT = function (cat, rows) {
    var C = K.dictCatById[cat.id];
    if (!C) { C = cat; C.words = []; K.dictCats.push(C); K.dictCatById[C.id] = C; }
    rows.forEach(function (row) {
      var f = row.split('|');
      var e = {
        w: f[0], r: f[1], pos: f[2], lv: f[3], m: f[4], use: f[5] || '', cat: C.id, see: (f[8] || '').trim(),
        ex: (f[6] || '').split('§').filter(function (x) { return x.trim(); }).map(function (x) { var p = x.split('='); return { jp: p[0].trim(), zh: (p[1] || '').trim() }; }),
        rel: (f[7] || '').split('、').map(function (x) { return x.trim(); }).filter(Boolean)
      };
      var id = e.w;
      if (K.dictById[id]) { console.warn('duplicate dict word', id); id = e.w + '・' + e.r; }
      e.id = id;
      K.dict.push(e); K.dictById[id] = e; C.words.push(e);
    });
  };
  K.dictParts = ['a', 'b', 'c', 'd', 'e', 'f'];
  var dictState = 0, dictWait = [];
  K.loadDict = function (cb) {
    if (dictState === 2) { if (cb) cb(); return; }
    if (cb) dictWait.push(cb);
    if (dictState === 1) return;
    dictState = 1;
    var left = K.dictParts.length;
    function one() {
      if (--left) return;
      dictState = 2;
      var w = dictWait; dictWait = [];
      w.forEach(function (f) { f(); });
    }
    K.dictParts.forEach(function (p) {
      var s = document.createElement('script');
      s.src = 'js/dict/' + p + '.js';
      s.async = false;
      s.onload = one;
      s.onerror = function () { console.warn('dict file failed', p); one(); };
      document.body.appendChild(s);
    });
  };
  K.dictReady = function () { return dictState === 2; };

  K.stages = [
    { n: 0, name: '入門', sub: '文字與聲音', color: '若竹色', level: '零基礎' },
    { n: 1, name: '基礎', sub: '句子的骨架', color: '縹色', level: 'N5' },
    { n: 2, name: '進階', sub: '動詞的變身', color: '藍色', level: 'N4' },
    { n: 3, name: '中級', sub: '語氣與細節', color: '紺青', level: 'N3–N2' },
    { n: 4, name: '動漫實戰', sub: '聽懂台詞', color: '茜色', level: 'N3–N2' },
    { n: 5, name: '歌詞', sub: '聽懂一首歌', color: '山吹色', level: 'N3–N1' },
    { n: 6, name: '輕小說', sub: '讀原作', color: '古代紫', level: 'N3–N2' },
    { n: 7, name: '熟練', sub: '敬語與言外之意', color: '墨色', level: 'N1' },
    { n: 8, name: '作品精讀', sub: '一部作品，一次讀透', color: '浅葱色', level: '全程度' },
    { n: 9, name: '型月世界', sub: 'TYPE-MOON 專區', color: '深緋', level: '全程度' }
  ];
  K.types = {
    lit: { label: '輕小說', seal: '輕' },
    classic: { label: '古典', seal: '古' },
    anime: { label: '動漫', seal: '畫' },
    film: { label: '電影', seal: '影' },
    drama: { label: '日劇', seal: '劇' },
    song: { label: '歌曲', seal: '歌' },
    game: { label: '遊戲', seal: '遊' },
    self: { label: '自編例句', seal: '例' }
  };
  K.typeOrder = ['anime', 'lit', 'film', 'drama', 'song', 'game'];

  var KJ = '\\u3005-\\u3007\\u303b\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\u30f5\\u30f6';
  var RE_AUTO = new RegExp('([' + KJ + ']+)\\[([^\\[\\]]+)\\]', 'g');
  var RE_EXPL = /\{([^{}|]+)\|([^{}]+)\}/g;
  var RE_LINK = /\[\[([^\[\]|]+)\|([^\[\]]+)\]\]/g;
  var KANA = /[ぁ-ゟァ-ヺー-ヿ]/;
  K.RE_AUTO = RE_AUTO; K.RE_EXPL = RE_EXPL;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  K.esc = esc;

  function rubify(s) {
    return s.replace(RE_EXPL, function (m, b, r) { return '<ruby lang="ja">' + b + '<rt>' + r + '</rt></ruby>'; })
      .replace(RE_AUTO, function (m, b, r) { return '<ruby lang="ja">' + b + '<rt>' + r + '</rt></ruby>'; });
  }

  /* markup → text a Japanese voice should read (ruby replaced by its reading) */
  function sayText(s) {
    return s.replace(RE_LINK, '$2').replace(RE_EXPL, '$2').replace(RE_AUTO, '$2')
      .replace(/\*\*|==/g, '').replace(/[「」『』]/g, '').trim();
  }
  /* markup → plain base text (ruby dropped) */
  function plain(s) {
    return s.replace(RE_LINK, '$2').replace(RE_EXPL, '$1').replace(RE_AUTO, '$1').replace(/\*\*|==/g, '');
  }
  K.sayText = sayText; K.plain = plain;

  function inline(s) {
    var keep = [];
    function hold(html) { keep.push(html); return '\u0001' + (keep.length - 1) + '\u0001'; }
    s = esc(s);
    s = s.replace(RE_LINK, function (m, id, txt) { return hold('<a class="xref" href="#' + id + '">' + rubify(txt) + '</a>'); });
    s = rubify(s);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/==(.+?)==/g, '<mark>$1</mark>');
    function tagJa(open, close) {
      var re = new RegExp(open + '([^' + open + close + ']*)' + close, 'g');
      s = s.replace(re, function (m, c) {
        if (KANA.test(c.replace(/<rt>[^<]*<\/rt>/g, '')) || c.indexOf('<ruby') >= 0) return hold('<span lang="ja">' + m + '</span>');
        return m;
      });
    }
    tagJa('「', '」');
    tagJa('『', '』');
    for (var guard = 0; guard < 3 && s.indexOf('\u0001') >= 0; guard++) {
      s = s.replace(/\u0001(\d+)\u0001/g, function (m, n) { return keep[+n]; });
    }
    return s;
  }
  K.inline = inline;

  function cellHtml(c) {
    var html = inline(c);
    if (c.indexOf('「') < 0 && c.indexOf('『') < 0 && KANA.test(plain(c))) return '<span lang="ja">' + html + '</span>';
    return html;
  }
  /* split a table row on | that is not inside {…} or [[…]] */
  function splitRow(r) {
    r = r.trim().replace(/^\|/, '').replace(/\|$/, '');
    var out = [], cur = '', brace = 0, link = 0;
    for (var i = 0; i < r.length; i++) {
      var ch = r[i];
      if (ch === '{') brace++;
      else if (ch === '}') brace = Math.max(0, brace - 1);
      else if (ch === '[' && r[i + 1] === '[') { link++; cur += '[['; i++; continue; }
      else if (ch === ']' && r[i + 1] === ']') { link = Math.max(0, link - 1); cur += ']]'; i++; continue; }
      if (ch === '|' && !brace && !link) { out.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur.trim());
    return out;
  }
  K.splitRow = splitRow;

  function table(rows) {
    rows = rows.filter(function (r) { return !/^\|[\s\-:|]+\|?$/.test(r.trim()); }).map(splitRow);
    if (!rows.length) return '';
    var h = '<div class="tbl"><table><thead><tr>' + rows[0].map(function (c) { return '<th>' + cellHtml(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.slice(1).forEach(function (r) {
      h += '<tr>' + r.map(function (c) { return '<td>' + cellHtml(c) + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  var SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 8.8a4.6 4.6 0 0 1 0 6.4M18 6.4a8 8 0 0 1 0 11.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  K.SPEAKER = SPEAKER;
  function sayBtn(text, label) {
    return '<button class="say" data-say="' + esc(text) + '" aria-label="' + (label || '朗讀') + '" title="朗讀">' + SPEAKER + '</button>';
  }
  K.sayBtn = sayBtn;

  function srcParts(src) {
    if (!src) return { id: 'self', loc: '' };
    var bar = src.indexOf('|');
    return bar < 0 ? { id: src.trim(), loc: '' } : { id: src.slice(0, bar).trim(), loc: src.slice(bar + 1).trim() };
  }

  K.workTitle = function (w) {
    if (!w) return '';
    return w.type === 'song' ? '「' + w.t + '」' : '『' + w.t + '』';
  };

  function caption(sp) {
    if (sp.id === 'self') {
      return '<figcaption class="ex-src"><span class="seal">例</span><span>自編例句' + (sp.loc ? '・' + inline(sp.loc) : '') + '</span></figcaption>';
    }
    var w = K.works[sp.id];
    if (!w) {
      console.warn('unknown work id', sp.id);
      return '<figcaption class="ex-src"><span class="seal">?</span><span>' + esc(sp.id) + '</span></figcaption>';
    }
    var h = '<figcaption class="ex-src"><span class="seal" title="' + K.types[w.type].label + '">' + K.types[w.type].seal + '</span>';
    h += '<a class="work" lang="ja" href="#' + (w.type === 'song' ? 'song.' : 'works.') + sp.id + '">' + esc(K.workTitle(w)) + '</a>';
    if (w.by) h += '<span class="by">' + inline(w.by) + '</span>';
    if (w.type === 'song') h += '<span class="title-note">引用的是歌名・點歌名看單字與文法</span>';
    if (sp.loc) h += '<span class="loc">' + inline(sp.loc) + '</span>';
    if (w.y) h += '<span class="yr">' + esc(w.y) + '</span>';
    return h + '</figcaption>';
  }

  function exBlock(arg, body, ctx) {
    var jp = [], zh = [], notes = [], read = [], src = null;
    body.forEach(function (raw) {
      var t = raw.trim();
      if (!t) return;
      if (t === '=' || t.indexOf('= ') === 0) zh.push(t.slice(2));
      else if (t.indexOf('@ ') === 0) src = t.slice(2);
      else if (t.indexOf('+ ') === 0) notes.push(t.slice(2));
      else if (t.indexOf('~ ') === 0) read.push(t.slice(2));
      else jp.push(raw.replace(/\s+$/, ''));
    });
    var sp = srcParts(src);
    var w = K.works[sp.id];
    var type = sp.id === 'self' ? 'self' : (w ? w.type : 'self');
    var n = ctx.exN = (ctx.exN || 0) + 1;
    var xid = 'x' + n;
    var poem = arg.indexOf('poem') >= 0;
    var long = jp.join('').length > 90;
    var lines = jp.map(function (l) {
      var ind = (l.match(/^\s*/)[0].length / 2) | 0;
      return '<span class="ln"' + (ind ? ' style="--indent:' + ind + '"' : '') + '>' + inline(l.trim()) + '</span>';
    }).join('');
    var say = read.length ? read.join('') : sayText(jp.map(function (l) { return l.trim(); }).join(poem ? '、' : ''));
    var h = '<figure class="ex t-' + type + (long ? ' long' : '') + '" id="' + ctx.id + '-' + xid + '"' + (sp.id !== 'self' ? ' data-work="' + esc(sp.id) + '"' : '') + '>';
    h += '<div class="ex-main"><div class="ex-jp' + (poem ? ' poem' : '') + '" lang="ja">' + lines + '</div>' + sayBtn(say, '朗讀這句') + '</div>';
    if (read.length) h += '<div class="ex-read" lang="ja"><b>現代讀音</b>' + esc(read.join(' ')) + '</div>';
    if (zh.length) h += '<div class="ex-zh">' + zh.map(inline).join('<br>') + '</div>';
    h += caption(sp);
    if (notes.length) h += '<ul class="ex-notes">' + notes.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</ul>';
    h += '</figure>';
    K.ex.push({ lesson: ctx.id, xid: xid, work: sp.id, loc: sp.loc, type: type, jp: jp.map(function (l) { return l.trim(); }).join('　'), zh: zh.join(' '), html: h });
    return h;
  }

  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function quizBlock(arg, body, ctx) {
    var qs = [], cur = null;
    body.forEach(function (raw) {
      var t = raw.trim();
      if (!t) return;
      if (/^Q[:：]/.test(t)) { cur = { q: t.replace(/^Q[:：]\s*/, ''), opts: [], exp: '' }; qs.push(cur); }
      else if (!cur) return;
      else if (t.indexOf('* ') === 0) cur.opts.push({ t: t.slice(2), ok: true });
      else if (t.indexOf('- ') === 0) cur.opts.push({ t: t.slice(2), ok: false });
      else if (/^E[:：]/.test(t)) cur.exp += (cur.exp ? ' ' : '') + t.replace(/^E[:：]\s*/, '');
    });
    var qid = 'qz' + (ctx.qzN = (ctx.qzN || 0) + 1);
    var h = '<section class="quiz" data-quiz="' + ctx.id + '-' + qid + '"><div class="quiz-h"><span>' + (arg ? inline(arg) : '小測驗') + '</span><span class="quiz-score" data-total="' + qs.length + '">0 / ' + qs.length + '</span></div>';
    qs.forEach(function (q, qi) {
      var opts = q.opts.slice();
      var seed = hashStr(q.q);
      for (var i = opts.length - 1; i > 0; i--) { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; var j = seed % (i + 1); var tmp = opts[i]; opts[i] = opts[j]; opts[j] = tmp; }
      h += '<div class="q"><p class="q-text"><span class="q-n">' + (qi + 1) + '</span>' + inline(q.q) + '</p><div class="opts">';
      opts.forEach(function (o) { h += '<button class="opt" data-ok="' + (o.ok ? 1 : 0) + '">' + cellHtml(o.t) + '</button>'; });
      h += '</div>' + (q.exp ? '<p class="q-exp" hidden>' + inline(q.exp) + '</p>' : '<p class="q-exp" hidden></p>') + '</div>';
    });
    return h + '</section>';
  }

  function practiceBlock(arg, body, ctx) {
    var q = [], brief = [], full = [];
    body.forEach(function (raw) {
      var t = raw.trim();
      if (!t) return;
      if (t.indexOf('>> ') === 0 || t === '>>') full.push(t.slice(3));
      else if (t === '=' || t.indexOf('= ') === 0) brief.push(t.slice(2));
      else q.push(t);
    });
    var h = '<section class="practice"><div class="practice-h">' + (arg ? inline(arg) : '練習') + '</div>';
    h += '<div class="practice-q">' + q.map(function (x) { return '<p>' + inline(x) + '</p>'; }).join('') + '</div>';
    h += '<details><summary>看答案</summary><div class="brief">' + brief.map(inline).join('<br>') + '</div>';
    if (full.length) h += '<details class="full"><summary>展開完整解說</summary><div class="full-body">' + full.map(function (x) { return '<p>' + inline(x) + '</p>'; }).join('') + '</div></details>';
    return h + '</details></section>';
  }

  function vocabBlock(arg, body, ctx) {
    var h = '<section class="vocab">' + (arg ? '<div class="vocab-h">' + inline(arg) + '</div>' : '');
    body.forEach(function (raw) {
      var t = raw.trim();
      if (!t) return;
      var c = splitRow(t);
      var w = c[0] || '', m = c[1] || '', n = c[2] || '';
      h += '<div class="vrow"><div class="vw" lang="ja">' + inline(w) + '</div><div class="vm">' + inline(m) + '</div>' + (n ? '<div class="vn">' + inline(n) + '</div>' : '') + sayBtn(sayText(w), '朗讀單字') + '</div>';
      K.vocab.push({ w: w, m: m, n: n, lesson: ctx.id, stage: ctx.stage });
    });
    return h + '</section>';
  }

  function dialogBlock(arg, body, ctx) {
    var rows = [], cur = null;
    body.forEach(function (raw) {
      var t = raw.trim();
      if (!t) return;
      var m;
      if (t === '=' || t.indexOf('= ') === 0) { if (cur) cur.zh.push(t.slice(2)); return; }
      if ((m = t.match(/^([^\s:：]{1,10})[:：]\s*(.+)$/)) && !/^[@+~]/.test(t)) { cur = { who: m[1], jp: m[2], zh: [] }; rows.push(cur); }
    });
    var h = '<section class="dialog">' + (arg ? '<div class="dialog-h">' + inline(arg) + '</div>' : '');
    rows.forEach(function (r) {
      h += '<div class="dl"><div class="dl-who">' + inline(r.who) + '</div><div class="dl-jp" lang="ja">' + inline(r.jp) + '</div>' + sayBtn(sayText(r.jp)) + (r.zh.length ? '<div class="dl-zh">' + r.zh.map(inline).join('<br>') + '</div>' : '') + '</div>';
    });
    return h + '</section>';
  }

  var SELF_CLOSING = { kana: 1 };
  var CALLOUT = { tip: '要點', warn: '常見錯誤', note: '背景', story: '故事', listen: '聽力任務' };

  function block(type, arg, body, ctx) {
    switch (type) {
      case 'ex': return exBlock(arg, body, ctx);
      case 'quiz': return quizBlock(arg, body, ctx);
      case 'practice': return practiceBlock(arg, body, ctx);
      case 'vocab': return vocabBlock(arg, body, ctx);
      case 'dialog': return dialogBlock(arg, body, ctx);
      case 'kana': return K.kanaChart ? K.kanaChart(arg.trim()) : '';
      default:
        if (CALLOUT[type]) {
          return '<aside class="callout ' + type + '"><div class="callout-h"><span class="ck">' + CALLOUT[type] + '</span><span>' + inline(arg) + '</span></div><div class="callout-b">' + parse(body.join('\n'), ctx) + '</div></aside>';
        }
        console.warn('unknown block', type, ctx.id);
        return '';
    }
  }

  function parse(src, ctx) {
    var L = String(src).replace(/\r/g, '').split('\n');
    var out = [], para = [], i = 0, m;
    function flush() { if (para.length) { out.push('<p>' + inline(para.join('')) + '</p>'); para = []; } }
    while (i < L.length) {
      var t = L[i].trim();
      if (!t) { flush(); i++; continue; }
      if ((m = t.match(/^::([a-z]+)\s*(.*)$/))) {
        flush();
        if (SELF_CLOSING[m[1]]) { out.push(block(m[1], m[2], [], ctx)); i++; continue; }
        var depth = 1, body = [];
        i++;
        while (i < L.length) {
          var u = L[i].trim(), mm = u.match(/^::([a-z]+)/);
          if (mm && !SELF_CLOSING[mm[1]]) depth++;
          else if (u === '::') { depth--; if (depth === 0) break; }
          body.push(L[i]); i++;
        }
        if (depth !== 0) console.warn('unclosed block', m[1], 'in', ctx.id);
        i++;
        out.push(block(m[1], m[2], body, ctx));
        continue;
      }
      if ((m = t.match(/^(#{2,4})\s+(.*)$/))) {
        flush();
        var lv = m[1].length, hid = ctx.id + '-h' + (ctx.hN = (ctx.hN || 0) + 1);
        if (lv === 2) ctx.toc.push({ id: hid, text: plain(m[2]) });
        out.push('<h' + lv + ' id="' + hid + '">' + inline(m[2]) + '</h' + lv + '>');
        i++; continue;
      }
      if (t[0] === '|') {
        flush();
        var rows = [];
        while (i < L.length && L[i].trim()[0] === '|') { rows.push(L[i]); i++; }
        out.push(table(rows));
        continue;
      }
      if (/^- /.test(t)) {
        flush();
        var items = [];
        while (i < L.length && /^- /.test(L[i].trim())) { items.push('<li>' + inline(L[i].trim().slice(2)) + '</li>'); i++; }
        out.push('<ul>' + items.join('') + '</ul>');
        continue;
      }
      if (/^\d+\. /.test(t)) {
        flush();
        var oitems = [];
        while (i < L.length && /^\d+\. /.test(L[i].trim())) { oitems.push('<li>' + inline(L[i].trim().replace(/^\d+\.\s/, '')) + '</li>'); i++; }
        out.push('<ol>' + oitems.join('') + '</ol>');
        continue;
      }
      if (t[0] === '>' && t.indexOf('>>') !== 0) {
        flush();
        var q = [];
        while (i < L.length && L[i].trim()[0] === '>') { q.push(inline(L[i].trim().replace(/^>\s?/, ''))); i++; }
        out.push('<blockquote>' + q.join('<br>') + '</blockquote>');
        continue;
      }
      para.push(t); i++;
    }
    flush();
    return out.join('\n');
  }
  K.parse = parse;

  /* parse every lesson once; collects examples, vocab and outlines */
  K.build = function () {
    K.ex = []; K.vocab = [];
    K.ordered = K.lessons.slice().sort(function (a, b) { return a.stage - b.stage || a._i - b._i; });
    /* a lesson with "after" goes right behind that lesson (same stage), so later files can fill gaps;
       chains (A after B after C) resolve whatever order the files load in */
    var waiting = K.ordered.filter(function (L) { var to = L.after && K.byId[L.after]; return to && to.stage === L.stage; });
    K.ordered = K.ordered.filter(function (L) { return waiting.indexOf(L) < 0; });
    for (var pass = 0; waiting.length && pass < 50; pass++) {
      waiting = waiting.filter(function (L) {
        var at = K.ordered.indexOf(K.byId[L.after]);
        if (at < 0) return true;
        K.ordered.splice(at + 1, 0, L);
        return false;
      });
    }
    K.ordered = K.ordered.concat(waiting);
    K.ordered.forEach(function (L, idx) {
      L.idx = idx;
      var ctx = { id: L.id, stage: L.stage, toc: [] };
      L.html = parse(L.body || '', ctx);
      L.toc = ctx.toc;
      L.exCount = ctx.exN || 0;
      var len = (L.body || '').length;
      L.minutes = Math.max(5, Math.round(len / 330 / 5) * 5);
      var txt = (L.lead || '') + '\n' + (L.body || '');
      txt = txt.replace(/^\s*(::[a-z]*.*|@ .*)$/gm, '')
        .replace(/^\s*(= |\+ |~ |Q[:：] ?|\* |- |E[:：] ?|>> ?|#+ |> )/gm, '')
        .replace(/\|/g, '　').replace(/\n+/g, ' ');
      L.hay = plain(L.title + '　' + txt) + ' ' + sayText(txt);
    });
    Object.keys(K.pages).forEach(function (k) {
      var P = K.pages[k], ctx = { id: 'p-' + k, stage: -1, toc: [] };
      P.html = parse(P.body || '', ctx);
      P.toc = ctx.toc;
    });
  };
})();
