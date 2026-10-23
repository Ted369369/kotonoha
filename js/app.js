/* 言の葉日文課 — pages, navigation, speech, quizzes, flashcards and the kana drill. */
(function () {
  'use strict';
  var K = window.K;
  var doc = document, root = doc.documentElement;
  function $(s, el) { return (el || doc).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); }
  var esc = K.esc, inline = K.inline;
  root.lang = 'zh-Hant';

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('kotonoha.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('kotonoha.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  /* ───────── kana tables (字源 = the kanji each kana was simplified from) ───────── */
  function row(label, cells) { return { label: label, cells: cells }; }
  function c(k, r, o, opt) { return { k: k, r: r, o: o || '', drill: !(opt && opt.nodrill) }; }
  var X = null;
  var KANA = {
    hira: { cols: ['a', 'i', 'u', 'e', 'o'], rows: [
      row('あ', [c('あ', 'a', '安'), c('い', 'i', '以'), c('う', 'u', '宇'), c('え', 'e', '衣'), c('お', 'o', '於')]),
      row('か', [c('か', 'ka', '加'), c('き', 'ki', '幾'), c('く', 'ku', '久'), c('け', 'ke', '計'), c('こ', 'ko', '己')]),
      row('さ', [c('さ', 'sa', '左'), c('し', 'shi', '之'), c('す', 'su', '寸'), c('せ', 'se', '世'), c('そ', 'so', '曽')]),
      row('た', [c('た', 'ta', '太'), c('ち', 'chi', '知'), c('つ', 'tsu', '川'), c('て', 'te', '天'), c('と', 'to', '止')]),
      row('な', [c('な', 'na', '奈'), c('に', 'ni', '仁'), c('ぬ', 'nu', '奴'), c('ね', 'ne', '祢'), c('の', 'no', '乃')]),
      row('は', [c('は', 'ha', '波'), c('ひ', 'hi', '比'), c('ふ', 'fu', '不'), c('へ', 'he', '部'), c('ほ', 'ho', '保')]),
      row('ま', [c('ま', 'ma', '末'), c('み', 'mi', '美'), c('む', 'mu', '武'), c('め', 'me', '女'), c('も', 'mo', '毛')]),
      row('や', [c('や', 'ya', '也'), X, c('ゆ', 'yu', '由'), X, c('よ', 'yo', '与')]),
      row('ら', [c('ら', 'ra', '良'), c('り', 'ri', '利'), c('る', 'ru', '留'), c('れ', 're', '礼'), c('ろ', 'ro', '呂')]),
      row('わ', [c('わ', 'wa', '和'), X, X, X, c('を', 'wo', '遠')]),
      row('ん', [c('ん', 'n', '无'), X, X, X, X])
    ] },
    kata: { cols: ['a', 'i', 'u', 'e', 'o'], rows: [
      row('ア', [c('ア', 'a', '阿'), c('イ', 'i', '伊'), c('ウ', 'u', '宇'), c('エ', 'e', '江'), c('オ', 'o', '於')]),
      row('カ', [c('カ', 'ka', '加'), c('キ', 'ki', '幾'), c('ク', 'ku', '久'), c('ケ', 'ke', '介'), c('コ', 'ko', '己')]),
      row('サ', [c('サ', 'sa', '散'), c('シ', 'shi', '之'), c('ス', 'su', '須'), c('セ', 'se', '世'), c('ソ', 'so', '曽')]),
      row('タ', [c('タ', 'ta', '多'), c('チ', 'chi', '千'), c('ツ', 'tsu', '川'), c('テ', 'te', '天'), c('ト', 'to', '止')]),
      row('ナ', [c('ナ', 'na', '奈'), c('ニ', 'ni', '二'), c('ヌ', 'nu', '奴'), c('ネ', 'ne', '祢'), c('ノ', 'no', '乃')]),
      row('ハ', [c('ハ', 'ha', '八'), c('ヒ', 'hi', '比'), c('フ', 'fu', '不'), c('ヘ', 'he', '部'), c('ホ', 'ho', '保')]),
      row('マ', [c('マ', 'ma', '末'), c('ミ', 'mi', '三'), c('ム', 'mu', '牟'), c('メ', 'me', '女'), c('モ', 'mo', '毛')]),
      row('ヤ', [c('ヤ', 'ya', '也'), X, c('ユ', 'yu', '由'), X, c('ヨ', 'yo', '與')]),
      row('ラ', [c('ラ', 'ra', '良'), c('リ', 'ri', '利'), c('ル', 'ru', '流'), c('レ', 're', '礼'), c('ロ', 'ro', '呂')]),
      row('ワ', [c('ワ', 'wa', '和'), X, X, X, c('ヲ', 'wo', '乎')]),
      row('ン', [c('ン', 'n', ''), X, X, X, X])
    ] },
    'hira-daku': { cols: ['a', 'i', 'u', 'e', 'o'], rows: [
      row('が', [c('が', 'ga'), c('ぎ', 'gi'), c('ぐ', 'gu'), c('げ', 'ge'), c('ご', 'go')]),
      row('ざ', [c('ざ', 'za'), c('じ', 'ji'), c('ず', 'zu'), c('ぜ', 'ze'), c('ぞ', 'zo')]),
      row('だ', [c('だ', 'da'), c('ぢ', 'ji', '', { nodrill: 1 }), c('づ', 'zu', '', { nodrill: 1 }), c('で', 'de'), c('ど', 'do')]),
      row('ば', [c('ば', 'ba'), c('び', 'bi'), c('ぶ', 'bu'), c('べ', 'be'), c('ぼ', 'bo')]),
      row('ぱ', [c('ぱ', 'pa'), c('ぴ', 'pi'), c('ぷ', 'pu'), c('ぺ', 'pe'), c('ぽ', 'po')])
    ] },
    'kata-daku': { cols: ['a', 'i', 'u', 'e', 'o'], rows: [
      row('ガ', [c('ガ', 'ga'), c('ギ', 'gi'), c('グ', 'gu'), c('ゲ', 'ge'), c('ゴ', 'go')]),
      row('ザ', [c('ザ', 'za'), c('ジ', 'ji'), c('ズ', 'zu'), c('ゼ', 'ze'), c('ゾ', 'zo')]),
      row('ダ', [c('ダ', 'da'), c('ヂ', 'ji', '', { nodrill: 1 }), c('ヅ', 'zu', '', { nodrill: 1 }), c('デ', 'de'), c('ド', 'do')]),
      row('バ', [c('バ', 'ba'), c('ビ', 'bi'), c('ブ', 'bu'), c('ベ', 'be'), c('ボ', 'bo')]),
      row('パ', [c('パ', 'pa'), c('ピ', 'pi'), c('プ', 'pu'), c('ペ', 'pe'), c('ポ', 'po')])
    ] },
    'hira-yoon': { cols: ['ya', 'yu', 'yo'], rows: [
      row('き', [c('きゃ', 'kya'), c('きゅ', 'kyu'), c('きょ', 'kyo')]),
      row('し', [c('しゃ', 'sha'), c('しゅ', 'shu'), c('しょ', 'sho')]),
      row('ち', [c('ちゃ', 'cha'), c('ちゅ', 'chu'), c('ちょ', 'cho')]),
      row('に', [c('にゃ', 'nya'), c('にゅ', 'nyu'), c('にょ', 'nyo')]),
      row('ひ', [c('ひゃ', 'hya'), c('ひゅ', 'hyu'), c('ひょ', 'hyo')]),
      row('み', [c('みゃ', 'mya'), c('みゅ', 'myu'), c('みょ', 'myo')]),
      row('り', [c('りゃ', 'rya'), c('りゅ', 'ryu'), c('りょ', 'ryo')]),
      row('ぎ', [c('ぎゃ', 'gya'), c('ぎゅ', 'gyu'), c('ぎょ', 'gyo')]),
      row('じ', [c('じゃ', 'ja'), c('じゅ', 'ju'), c('じょ', 'jo')]),
      row('び', [c('びゃ', 'bya'), c('びゅ', 'byu'), c('びょ', 'byo')]),
      row('ぴ', [c('ぴゃ', 'pya'), c('ぴゅ', 'pyu'), c('ぴょ', 'pyo')])
    ] },
    'kata-yoon': { cols: ['ya', 'yu', 'yo'], rows: [
      row('キ', [c('キャ', 'kya'), c('キュ', 'kyu'), c('キョ', 'kyo')]),
      row('シ', [c('シャ', 'sha'), c('シュ', 'shu'), c('ショ', 'sho')]),
      row('チ', [c('チャ', 'cha'), c('チュ', 'chu'), c('チョ', 'cho')]),
      row('ニ', [c('ニャ', 'nya'), c('ニュ', 'nyu'), c('ニョ', 'nyo')]),
      row('ヒ', [c('ヒャ', 'hya'), c('ヒュ', 'hyu'), c('ヒョ', 'hyo')]),
      row('ミ', [c('ミャ', 'mya'), c('ミュ', 'myu'), c('ミョ', 'myo')]),
      row('リ', [c('リャ', 'rya'), c('リュ', 'ryu'), c('リョ', 'ryo')]),
      row('ギ', [c('ギャ', 'gya'), c('ギュ', 'gyu'), c('ギョ', 'gyo')]),
      row('ジ', [c('ジャ', 'ja'), c('ジュ', 'ju'), c('ジョ', 'jo')]),
      row('ビ', [c('ビャ', 'bya'), c('ビュ', 'byu'), c('ビョ', 'byo')]),
      row('ピ', [c('ピャ', 'pya'), c('ピュ', 'pyu'), c('ピョ', 'pyo')])
    ] },
    'kata-ext': { cols: ['a', 'i', 'u', 'e', 'o'], rows: [
      row('f', [c('ファ', 'fa'), c('フィ', 'fi'), X, c('フェ', 'fe'), c('フォ', 'fo')]),
      row('v', [c('ヴァ', 'va'), c('ヴィ', 'vi'), c('ヴ', 'vu'), c('ヴェ', 've'), c('ヴォ', 'vo')]),
      row('w', [X, c('ウィ', 'wi'), X, c('ウェ', 'we'), c('ウォ', 'wo', '', { nodrill: 1 })]),
      row('t', [X, c('ティ', 'ti'), c('トゥ', 'tu'), X, X]),
      row('d', [X, c('ディ', 'di'), c('ドゥ', 'du'), X, X]),
      row('ts', [c('ツァ', 'tsa'), X, X, c('ツェ', 'tse'), c('ツォ', 'tso')]),
      row('sh·j·ch', [c('シェ', 'she'), c('ジェ', 'je'), X, c('チェ', 'che'), X]),
      row('y', [X, X, X, c('イェ', 'ye'), X])
    ] }
  };
  var KANA_NAMES = { hira: '平假名・清音', 'hira-daku': '平假名・濁音與半濁音', 'hira-yoon': '平假名・拗音', kata: '片假名・清音', 'kata-daku': '片假名・濁音與半濁音', 'kata-yoon': '片假名・拗音', 'kata-ext': '片假名・外來語專用組合' };

  K.kanaChart = function (set) {
    var T = KANA[set];
    if (!T) return '';
    var cls = 'kana-grid' + (T.cols.length === 3 ? ' cols3' : '');
    var h = '<div class="kana-wrap"><div class="' + cls + '" lang="ja"><span></span>';
    T.cols.forEach(function (x) { h += '<span class="kh">' + x + '</span>'; });
    T.rows.forEach(function (R) {
      h += '<span class="kh">' + R.label + '</span>';
      R.cells.forEach(function (C) {
        if (!C) { h += '<span class="kc empty"></span>'; return; }
        h += '<button class="kc' + (C.k.length > 1 ? ' wide' : '') + '" data-say="' + C.k + '" title="' + (C.o ? '字源：' + C.o + '（點一下聽發音）' : '點一下聽發音') + '"><span class="k">' + C.k + '</span><span class="r">' + C.r + '</span>' + (C.o ? '<span class="o">' + C.o + '</span>' : '') + '</button>';
      });
    });
    h += '</div></div>';
    if (set === 'hira' || set === 'kata') h += '<p class="kana-note">每格下方的小字是字源：這個假名是從哪個漢字簡化而來。點任一格可以聽發音。</p>';
    return h;
  };

  K.build();

  /* ───────── settings ───────── */
  var settings = Object.assign({ furi: 'show', zh: 'show', rate: '0.9', theme: 'system' }, store.get('settings', {}));
  function applySettings() {
    root.setAttribute('data-furi', settings.furi);
    root.setAttribute('data-zh', settings.zh);
    if (settings.theme === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', settings.theme);
    $('#furi-label').textContent = { show: '顯示', hover: '滑過', hide: '隱藏' }[settings.furi] || '顯示';
    $('#zh-label').textContent = { show: '顯示', tap: '點開' }[settings.zh] || '顯示';
    $$('.seg').forEach(function (seg) {
      var k = seg.getAttribute('data-set');
      $$('button', seg).forEach(function (b) { b.classList.toggle('on', String(settings[k]) === b.getAttribute('data-v')); });
    });
  }
  function saveSettings() { store.set('settings', settings); applySettings(); }
  applySettings();

  /* ───────── speech ───────── */
  var hasTTS = 'speechSynthesis' in window, voice = null, playingBtn = null, warned = false;
  function pickVoice() {
    if (!hasTTS) return;
    var vs = [];
    try { vs = speechSynthesis.getVoices().filter(function (v) { return /^ja/i.test(v.lang); }); } catch (e) { vs = []; }
    var pref = ['Nanami', 'Keita', 'Google', 'Kyoko', 'O-Ren', 'Haruka', 'Ayumi', 'Sayaka', 'Ichiro'];
    voice = null;
    for (var i = 0; i < pref.length && !voice; i++) {
      for (var j = 0; j < vs.length; j++) if (vs[j].name.indexOf(pref[i]) >= 0) { voice = vs[j]; break; }
    }
    if (!voice) voice = vs[0] || null;
    var note = $('#voice-note');
    if (note) note.textContent = voice ? '朗讀語音：' + voice.name + '（瀏覽器內建）' : '這個瀏覽器目前找不到日文語音。Chrome 與 Edge 通常內建；Windows 也可以在「設定 → 時間與語言 → 語音」加入日文語音。';
  }
  if (hasTTS) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { speechSynthesis.onvoiceschanged = pickVoice; } }
  function say(text, btn) {
    if (!hasTTS) { toast('這個瀏覽器不支援朗讀功能。'); return; }
    try {
      speechSynthesis.cancel();
      if (playingBtn) playingBtn.classList.remove('playing');
      if (!voice) pickVoice();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      if (voice) u.voice = voice;
      u.rate = parseFloat(settings.rate) || 0.9;
      if (btn) { playingBtn = btn; btn.classList.add('playing'); }
      u.onend = u.onerror = function () { if (btn) btn.classList.remove('playing'); };
      speechSynthesis.speak(u);
      if (!voice && !warned) { warned = true; toast('找不到日文語音，發音可能不正確。打開「設定」可以看到說明。'); }
    } catch (e) { toast('朗讀失敗：' + e.message); }
  }

  var toastT;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.hidden = true; }, 3600);
  }

  /* ───────── progress ───────── */
  var done = store.get('done', {});
  function setDone(id, v) {
    if (v) done[id] = Date.now(); else delete done[id];
    store.set('done', done);
    sideList();
  }
  function doneCount(list) { return list.filter(function (L) { return done[L.id]; }).length; }

  /* ───────── sidebar ───────── */
  var side = $('#side'), main = $('#main'), outline = $('#outline');
  var openStages = store.get('openStages', {}), openGroups = store.get('openGroups', {});
  var currentLesson = null;
  side.innerHTML = '<div id="side-list"></div>' +
    '<nav class="side-tools" aria-label="其他頁面"><a class="dup" href="#home">首頁</a><a class="dup" href="#songs">歌單</a><a class="dup" href="#dict">單字大全</a><a class="dup" href="#works">出處索引</a><a class="dup" href="#cards">單字卡</a><a class="dup" href="#kana">假名練習</a><a class="dup" href="#search">搜尋</a><a href="#about">關於本站</a></nav>';
  function stageLessons(n) { return K.ordered.filter(function (L) { return L.stage === n; }); }
  /* sidebar folders: each starts at the named lesson and runs until the next one in the same stage */
  var SIDE_GROUPS = {
    's0-intro': '文字', 's0-sound': '聲音', 's0-greet': '問候與漢字', 's0-typing': '打字與查字典',
    's1-desu': '名詞句與指示', 's1-aru-iru': '存在與助詞', 's1-numbers': '數字與形容詞', 's1-verbs': '動詞', 's1-endings': '語氣與人稱', 's1-reading': '閱讀與複習',
    's2-teiru': '動詞的變化', 's2-conditional': '條件、授受與推測', 's2-passive': '被動、使役與命令', 's2-relative': '句子的連接', 's2-keigo-intro': '敬語、閱讀與複習',
    's3-noda': '說明與判斷', 's3-focus': '焦點與範圍', 's3-tokoro': '時間與變化', 's3-kuseni': '讓步與原因', 's3-onomatopoeia': '詞彙', 's3-reading': '閱讀與複習',
    's4-contractions': '口語與稱呼', 's4-anime-vocab': '動漫詞彙', 's4-phrases': '各種場面', 's4-listening': '聽力與翻譯',
    's5-lyric-grammar': '歌詞的語言', 's5-titles1': '歌名與歌手', 's5-anisong': '聽歌',
    's6-ln-intro': '認識輕小說', 's6-ln-isekai': '類型', 's8-ln1': '精讀與練習',
    's7-keigo': '敬語與書信', 's7-written': '書面語與句型', 's7-kanji': '漢字與詞彙', 's7-subtext': '言外之意與畢業',
    's8-intro': '近年的作品', 's8-fma-naruto': '經典作品', 's8-ghibli': '動畫電影',
    's8-tm-world': '世界與規則', 's8-tm-np': '寶具與魔術', 's8-tm-others': 'Fate 的各部作品', 's8-tm-origins': '型月的原點', 's8-tm-spinoff': '番外、原作與總測驗'
  };
  function stageGroups(n) {
    var out = [], g = null;
    stageLessons(n).forEach(function (L) {
      if (!g || SIDE_GROUPS[L.id]) { g = { key: L.id, name: SIDE_GROUPS[L.id] || '其他', ls: [] }; out.push(g); }
      g.ls.push(L);
    });
    return out;
  }
  function sideList() {
    var cur = currentLesson && K.byId[currentLesson];
    var h = '<ol class="stages">';
    K.stages.forEach(function (S) {
      var ls = stageLessons(S.n);
      if (!ls.length) return;
      var open = !!openStages[S.n] || !!(cur && cur.stage === S.n);
      h += '<li class="stage' + (open ? ' open' : '') + '" style="--sc:var(--s' + S.n + ')"><button class="stage-btn" data-stage="' + S.n + '" aria-expanded="' + open + '"><span class="stage-no">' + S.n + '</span><span class="stage-name">' + S.name + '</span><span class="stage-prog">' + doneCount(ls) + '/' + ls.length + '</span><span class="stage-sub">' + S.sub + '・' + S.level + '</span></button><ol class="groups">';
      stageGroups(S.n).forEach(function (g) {
        var gOpen = !!openGroups[g.key] || !!(cur && g.ls.indexOf(cur) >= 0);
        h += '<li class="grp' + (gOpen ? ' open' : '') + '"><button class="grp-btn" data-grp="' + g.key + '" aria-expanded="' + gOpen + '"><span class="grp-name">' + esc(g.name) + '</span><span class="grp-prog">' + doneCount(g.ls) + '/' + g.ls.length + '</span></button><ol class="lessons">';
        g.ls.forEach(function (L) {
          h += '<li><a href="#' + L.id + '" class="' + (done[L.id] ? 'done ' : '') + (cur && L.id === cur.id ? 'cur' : '') + '"><span class="chk"></span><span class="lt">' + inline(L.title) + '</span></a></li>';
        });
        h += '</ol></li>';
      });
      h += '</ol></li>';
    });
    $('#side-list').innerHTML = h + '</ol>';
    var curA = $('#side-list a.cur');
    if (curA && curA.scrollIntoView) {
      var r = curA.getBoundingClientRect(), sr = side.getBoundingClientRect();
      if (r.top < sr.top + 60 || r.bottom > sr.bottom - 20) curA.scrollIntoView({ block: 'center' });
    }
  }

  function openMenu() { doc.body.classList.add('menu-open'); $('.scrim').hidden = false; $('.menu-btn').setAttribute('aria-expanded', 'true'); }
  function closeMenu() { doc.body.classList.remove('menu-open'); $('.scrim').hidden = true; $('.menu-btn').setAttribute('aria-expanded', 'false'); }
  function closeSettings() { $('#settings').hidden = true; $('#btn-settings').setAttribute('aria-expanded', 'false'); }

  function navOn(page) {
    $$('.topnav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === page); });
  }

  /* ───────── outline + scroll spy ───────── */
  var spy = null;
  function renderOutline(toc, title) {
    if (spy) { spy.disconnect(); spy = null; }
    if (!toc || !toc.length) { outline.innerHTML = ''; return; }
    var h = '<p class="outline-h">' + (title || '本課目錄') + '</p><ol>';
    toc.forEach(function (t) { h += '<li><a href="#" data-to="' + t.id + '">' + esc(t.text) + '</a></li>'; });
    outline.innerHTML = h + '</ol>';
    if (!('IntersectionObserver' in window)) return;
    var links = {};
    $$('a', outline).forEach(function (a) { links[a.getAttribute('data-to')] = a; });
    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$('a.on', outline).forEach(function (x) { x.classList.remove('on'); });
        var a = links[en.target.id];
        if (a) a.classList.add('on');
      });
    }, { rootMargin: '-80px 0px -72% 0px' });
    toc.forEach(function (t) { var el = doc.getElementById(t.id); if (el) spy.observe(el); });
  }

  /* ───────── router ───────── */
  function route() {
    var raw = location.hash.replace(/^#/, '');
    try { raw = decodeURIComponent(raw); } catch (e) { /* keep raw */ }
    var dot = raw.indexOf('.');
    var page = dot < 0 ? raw : raw.slice(0, dot), arg = dot < 0 ? '' : raw.slice(dot + 1);
    closeMenu(); closeSettings();
    if (hasTTS) { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
    if (K.byId[page]) { showLesson(page, arg); return; }
    currentLesson = null;
    var fn = { works: showWorks, cards: showCards, kana: showKana, search: showSearch, about: showAbout, songs: showSongs, song: showSong, dict: showDict }[page] || showHome;
    doc.title = page && fn !== showHome ? ({ works: '出處索引', cards: '單字卡', kana: '假名練習', search: '搜尋', about: '關於本站', songs: '歌單', song: '歌單', dict: '單字大全' }[page] + '｜言の葉日文課') : '言の葉日文課';
    fn(arg);
    navOn(K.byId[page] ? '' : (fn === showHome ? 'home' : page === 'song' ? 'songs' : page));
    sideList();
    if (!arg || page === 'song' || page === 'dict') window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  function scrollToId(id) {
    var el = doc.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ block: 'start' });
    el.classList.add('flash');
    setTimeout(function () { el.classList.remove('flash'); }, 2200);
    return true;
  }

  /* ───────── same-work citations under each example ───────── */
  var byWork = {};
  K.ex.forEach(function (e) {
    if (e.work === 'self' || e.lesson.indexOf('p-') === 0) return;
    (byWork[e.work] = byWork[e.work] || []).push(e);
  });
  function addSameWork(box) {
    $$('figure.ex[data-work]', box).forEach(function (fig) {
      var w = fig.getAttribute('data-work'), list = byWork[w];
      if (!list || list.length < 2 || $('.ex-more', fig)) return;
      var others = list.filter(function (e) { return e.lesson + '-' + e.xid !== fig.id; });
      if (!others.length) return;
      var work = K.works[w];
      var h = '<details class="ex-more"><summary>' + (work && work.type === 'song' ? '這首歌在本站還出現 ' : '同一部作品在本站還有 ') + others.length + ' 句</summary><ul>';
      others.forEach(function (e) {
        var L = K.byId[e.lesson];
        h += '<li><a href="#' + e.lesson + '.' + e.xid + '"><span class="cj" lang="ja">' + inline(e.jp) + '</span><span class="cl">第 ' + L.stage + ' 階段・' + esc(K.plain(L.title)) + (e.loc ? '・' + esc(K.plain(e.loc)) : '') + '</span></a></li>';
      });
      h += '</ul><a class="ex-more-all" href="#works.' + w + '">在出處索引看這部作品的全部引用</a></details>';
      fig.insertAdjacentHTML('beforeend', h);
    });
  }

  /* ───────── lesson page ───────── */
  function worksIn(id) {
    var w = {};
    K.ex.forEach(function (e) { if (e.lesson === id && e.work !== 'self' && K.works[e.work]) w[e.work] = 1; });
    return Object.keys(w);
  }
  function showLesson(id, arg) {
    var L = K.byId[id], S = K.stages[L.stage];
    currentLesson = id;
    store.set('last', id);
    var ls = stageLessons(L.stage), pos = ls.indexOf(L) + 1;
    var prev = K.ordered[L.idx - 1], next = K.ordered[L.idx + 1];
    var h = '<article class="page" style="--sc:var(--s' + S.n + ')">';
    h += '<div class="eyebrow"><span class="stage-chip">第 ' + S.n + ' 階段・' + S.name + '</span><span class="dot">' + S.level + '</span><span class="dot">本階段第 ' + pos + ' 課，共 ' + ls.length + ' 課</span></div>';
    h += '<h1>' + inline(L.title) + '</h1>';
    if (L.lead) h += '<p class="lead">' + inline(L.lead) + '</p>';
    h += '<div class="page-meta"><span>閱讀約 ' + L.minutes + ' 分鐘</span><span>' + L.exCount + ' 個例句</span><span>引用 ' + worksIn(id).length + ' 部作品</span></div>';
    h += '<div class="prose">' + L.html + '</div>';
    h += '<footer class="lesson-end"><button class="done-btn' + (done[id] ? ' is-done' : '') + '" data-act="done" data-id="' + id + '">' + (done[id] ? '已讀完這一課 ✓' : '標記為讀完') + '</button><nav class="pn" aria-label="上一課與下一課">';
    if (prev) h += '<a class="prev" href="#' + prev.id + '"><span class="pk">← 上一課</span><span class="pt">' + inline(prev.title) + '</span></a>';
    if (next) h += '<a class="next" href="#' + next.id + '"><span class="pk">下一課 →</span><span class="pt">' + inline(next.title) + '</span></a>';
    h += '</nav></footer></article>';
    main.innerHTML = h;
    addSameWork(main);
    renderOutline(L.toc);
    navOn('');
    sideList();
    doc.title = K.plain(L.title) + '｜言の葉日文課';
    if (!(arg && scrollToId(id + '-' + arg))) window.scrollTo(0, 0);
  }

  /* ───────── quiz ───────── */
  function answerQuiz(btn) {
    var q = btn.closest('.q');
    if (!q || q.classList.contains('answered')) return;
    q.classList.add('answered');
    var ok = btn.getAttribute('data-ok') === '1';
    $$('.opt', q).forEach(function (o) {
      o.disabled = true;
      if (o.getAttribute('data-ok') === '1') o.classList.add('right');
    });
    if (!ok) btn.classList.add('wrong');
    var exp = $('.q-exp', q);
    exp.innerHTML = (ok ? '<b class="r">答對了。</b>' : '<b class="w">再想想。</b>正確答案已用綠色標出。') + (exp.innerHTML ? ' ' + exp.innerHTML : '');
    exp.hidden = false;
    var quiz = btn.closest('.quiz'), sc = $('.quiz-score', quiz);
    var right = $$('.q.answered', quiz).filter(function (x) { return !$('.opt.wrong', x); }).length;
    sc.textContent = right + ' / ' + sc.getAttribute('data-total');
  }

  /* ───────── home ───────── */
  function realEx() { return K.ex.filter(function (e) { return e.lesson.indexOf('p-') !== 0; }); }
  function citedWorks() {
    var w = {};
    realEx().forEach(function (e) { if (e.work !== 'self' && K.works[e.work]) w[e.work] = 1; });
    return Object.keys(w);
  }
  function dailyHtml() {
    var pool = realEx().filter(function (e) { return e.type !== 'self'; });
    if (!pool.length) return '';
    var e = pool[Math.floor(Math.random() * pool.length)];
    var L = K.byId[e.lesson];
    return e.html + '<p class="sec-p" style="font-size:14px">出自課程：<a href="#' + e.lesson + '.' + e.xid + '">' + inline(L.title) + '</a></p>';
  }
  function showHome() {
    var ex = realEx(), works = citedWorks(), nDone = doneCount(K.ordered);
    var last = store.get('last', null);
    var h = '<div class="page page-wide">';
    h += '<section class="hero"><p class="hero-quote" lang="ja"><ruby>言<rt>こと</rt></ruby>の<ruby>葉<rt>は</rt></ruby></p>';
    h += '<p class="hero-cite">「言の葉」是「話語」比較古雅的說法，新海誠的動畫電影《言の葉の庭》就用了這個詞。話語像葉子一樣，從人心裡一片一片長出來，這就是本站名字的由來。</p>';
    h += '<h1 class="hero-zh">從第一個平假名，一路學到關掉字幕，聽懂動畫、電影和歌。</h1>';
    h += '<p class="hero-p">每一個文法點都用真實作品的句子來教：《涼宮春日》《Re:從零開始》這些輕小說的書名和台詞、型月世界（《Fate》系列、《月姫》、《空の境界》、《魔法使いの夜》）的名句、《進撃の巨人》《葬送的芙莉蓮》等 2000 年以後的動畫、宮崎駿與新海誠的電影，還有你歌單裡每一首歌的歌名。每句都標明出處，可以朗讀，可以隱藏讀音和翻譯來自我測驗。</p>';
    h += '<div class="btns"><a class="btn primary" href="#' + K.ordered[0].id + '">從第一課開始</a><a class="btn" href="#dict">單字大全</a>';
    if (last && K.byId[last]) h += '<a class="btn" href="#' + last + '">繼續：' + inline(K.byId[last].title) + '</a>';
    h += '<a class="btn" href="#songs">歌單：每首歌的單字與文法</a><a class="btn" href="#works">看所有引用作品</a></div></section>';
    h += '<div class="stats"><div class="stat"><b>' + K.ordered.length + '</b><span>課</span></div><div class="stat"><b>' + ex.length + '</b><span>個例句</span></div><div class="stat"><b>' + works.length + '</b><span>部引用作品</span></div><div class="stat"><b>' + K.vocab.length + '</b><span>個單字卡</span></div><div class="stat"><b>' + nDone + '</b><span>課已讀完</span></div></div>';
    h += '<h2 class="sec-h">八個階段</h2><p class="sec-p">每個階段用一種日本傳統色標示。前四階段把文法從零建到 N2，後四階段專攻動漫台詞、歌詞、文學原文和敬語，最後一課是不靠字幕的自學路線。</p><div class="road">';
    K.stages.forEach(function (S) {
      var ls = stageLessons(S.n);
      if (!ls.length) return;
      var nd = doneCount(ls);
      h += '<a class="road-card" href="#' + ls[0].id + '" style="--sc:var(--s' + S.n + ')"><div class="road-top"><span class="road-no">' + S.n + '</span><span class="road-name">' + S.name + '</span><span class="road-lv">' + S.level + '</span></div>';
      h += '<div class="road-sub">' + S.sub + '・' + ls.length + ' 課</div>';
      h += '<div class="road-list">' + ls.slice(0, 4).map(function (L) { return esc(K.plain(L.title)); }).join('、') + (ls.length > 4 ? '…' : '') + '</div>';
      h += '<div class="bar"><i style="width:' + Math.round(nd / ls.length * 100) + '%"></i></div><div class="road-color">' + S.color + '</div></a>';
    });
    h += '</div>';
    h += '<h2 class="sec-h">歌單</h2><p class="sec-p">你的 Spotify 歌單裡的每一首歌都有自己的一頁：歌名拆解、重要單字、文法重點，還有它出自哪部動畫或電影。單字可以一鍵加進單字卡。本站不收錄歌詞，歌詞請在 Spotify 裡看。</p><div class="btns" style="margin-bottom:34px"><a class="btn primary" href="#songs">打開歌單</a><a class="btn" href="#s5-anisong">按作品看動畫歌</a></div>';
    h += '<div class="daily"><div class="daily-h"><h2 class="sec-h">隨機一句</h2><button class="btn small" data-act="daily">換一句</button></div><div id="daily">' + dailyHtml() + '</div></div>';
    var counts = {};
    works.forEach(function (id) { var t = K.works[id].type; counts[t] = (counts[t] || 0) + 1; });
    h += '<h2 class="sec-h">例句從哪裡來</h2><p class="sec-p">點類別可以到出處索引，看每部作品在哪幾課出現。</p><div class="chips">';
    K.typeOrder.forEach(function (t) {
      if (!counts[t]) return;
      h += '<a class="chip t-' + t + '" href="#works.type-' + t + '"><span class="seal">' + K.types[t].seal + '</span>' + K.types[t].label + ' <b>' + counts[t] + '</b></a>';
    });
    h += '</div>';
    h += '<h2 class="sec-h">怎麼使用</h2><div class="howto">';
    h += '<div><b>先聽，再看</b>每個例句右邊的圓鈕會用瀏覽器的日文語音朗讀。先聽一次，再看字。</div>';
    h += '<div><b>關掉讀音</b>上方的「振」可以切換振假名：顯示、滑過才顯示、隱藏。隱藏時點一下漢字可以偷看。</div>';
    h += '<div><b>遮住翻譯</b>「譯」切到「點開」，翻譯會先模糊，自己翻完再點開對答案。</div>';
    h += '<div><b>做完就標記</b>每課最後的按鈕會記錄進度，進度只存在這個瀏覽器。</div>';
    h += '</div></div>';
    main.innerHTML = h;
    addSameWork(main);
    renderOutline(null);
  }

  /* ───────── works index ───────── */
  var worksType = 'all', worksQ = '';
  function yearNum(w) { var m = String(w.y || '').match(/\d{3,4}/); return m ? +m[0] : 9999; }
  function showWorks(arg) {
    if (arg && arg.indexOf('type-') === 0) { worksType = arg.slice(5); arg = ''; }
    var h = '<div class="page page-wide"><div class="eyebrow">出處索引</div><h1>所有引用的作品</h1>';
    h += '<p class="lead">全站例句引用的每一部作品都在這裡，附上作者、年份和它在哪幾課出現。歌曲只引用歌名，不轉載歌詞；文學作品除了已進入公有領域的原文外，現代作品只引用一兩句。</p>';
    h += '<div class="works-tools"><label class="sr" for="wq">篩選作品</label><input id="wq" type="search" placeholder="篩選作品名、作者、歌手…" value="' + esc(worksQ) + '" autocomplete="off"></div><div class="chips" id="wchips"></div><div id="wlist"></div></div>';
    main.innerHTML = h;
    renderOutline(null);
    $('#wq').addEventListener('input', function (e) { worksQ = e.target.value; worksList(); });
    worksList();
    if (arg) {
      if (K.works[arg]) { worksType = 'all'; worksQ = ''; $('#wq').value = ''; worksList(); }
      setTimeout(function () { scrollToId('w-' + arg); }, 30);
    }
  }
  function worksList() {
    var cites = {};
    realEx().forEach(function (e) { if (e.work === 'self' || !K.works[e.work]) return; (cites[e.work] = cites[e.work] || []).push(e); });
    var ids = Object.keys(cites);
    var counts = { all: ids.length };
    ids.forEach(function (id) { var t = K.works[id].type; counts[t] = (counts[t] || 0) + 1; });
    var ch = '<button class="chip' + (worksType === 'all' ? ' on' : '') + '" data-wtype="all">全部 <b>' + counts.all + '</b></button>';
    K.typeOrder.forEach(function (t) {
      if (!counts[t]) return;
      ch += '<button class="chip t-' + t + (worksType === t ? ' on' : '') + '" data-wtype="' + t + '"><span class="seal">' + K.types[t].seal + '</span>' + K.types[t].label + ' <b>' + counts[t] + '</b></button>';
    });
    $('#wchips').innerHTML = ch;
    var q = worksQ.trim().toLowerCase();
    var h = '', shownAny = false;
    K.typeOrder.forEach(function (t) {
      if (worksType !== 'all' && worksType !== t) return;
      var list = ids.filter(function (id) {
        var w = K.works[id];
        if (w.type !== t) return false;
        if (!q) return true;
        return (w.t + ' ' + (w.r || '') + ' ' + (w.by || '') + ' ' + (w.tie || '') + ' ' + (w.note || '')).toLowerCase().indexOf(q) >= 0;
      }).sort(function (a, b) { return yearNum(K.works[a]) - yearNum(K.works[b]) || K.works[a].t.localeCompare(K.works[b].t, 'ja'); });
      if (!list.length) return;
      shownAny = true;
      h += '<h2 class="wtype-h t-' + t + '"><span class="seal">' + K.types[t].seal + '</span>' + K.types[t].label + '<small>' + list.length + ' 部</small></h2>';
      list.forEach(function (id) {
        var w = K.works[id];
        h += '<div class="work-card t-' + t + '" id="w-' + id + '"><div class="wc-head"><span class="seal">' + K.types[t].seal + '</span><span class="wc-title" lang="ja">' + esc(K.workTitle(w)) + '</span>' + (w.r ? '<span class="wc-read" lang="ja">' + esc(w.r) + '</span>' : '') + '</div>';
        h += '<div class="wc-meta">' + [w.by ? inline(w.by) : '', w.y ? esc(w.y) : '', w.tie ? inline(w.tie) : ''].filter(Boolean).join('・') + '</div>';
        if (w.note) h += '<p class="wc-note">' + inline(w.note) + '</p>';
        h += '<ul class="wc-cites">';
        cites[id].forEach(function (e) {
          var L = K.byId[e.lesson];
          h += '<li><a href="#' + e.lesson + '.' + e.xid + '"><span class="cj" lang="ja">' + inline(e.jp) + '</span><span class="cl">第 ' + L.stage + ' 階段・' + esc(K.plain(L.title)) + (e.loc ? '・' + esc(K.plain(e.loc)) : '') + '</span></a></li>';
        });
        h += '</ul></div>';
      });
    });
    $('#wlist').innerHTML = shownAny ? h : '<p class="sec-p">沒有符合的作品。</p>';
  }

  /* ───────── search ───────── */
  var lastQ = '';
  function markQ(text, q) {
    var t = esc(text), qq = esc(q);
    if (!qq) return t;
    var i = t.toLowerCase().indexOf(qq.toLowerCase());
    return i < 0 ? t : t.slice(0, i) + '<mark>' + t.slice(i, i + qq.length) + '</mark>' + t.slice(i + qq.length);
  }
  function snippet(text, q) {
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return text.slice(0, 90);
    var a = Math.max(0, i - 40), b = Math.min(text.length, i + q.length + 60);
    return (a > 0 ? '…' : '') + text.slice(a, b) + (b < text.length ? '…' : '');
  }
  function searchAll(q) {
    q = q.trim();
    if (!q) return [];
    var ql = q.toLowerCase(), out = [];
    Object.keys(K.works).forEach(function (id) {
      var w = K.works[id];
      var hay = (w.t + ' ' + (w.r || '') + ' ' + (w.by || '') + ' ' + (w.tie || '')).toLowerCase();
      if (hay.indexOf(ql) >= 0 && citedWorks().indexOf(id) >= 0) out.push({ k: '作品・' + K.types[w.type].label, href: '#works.' + id, t: K.workTitle(w), s: [w.by, w.y].filter(Boolean).join('・'), rank: 0 });
    });
    realEx().forEach(function (e) {
      var hay = (K.plain(e.jp) + ' ' + K.sayText(e.jp) + ' ' + e.zh).toLowerCase();
      if (hay.indexOf(ql) < 0) return;
      var w = K.works[e.work];
      out.push({ k: '例句' + (w ? '・' + K.workTitle(w) : ''), href: '#' + e.lesson + '.' + e.xid, t: K.plain(e.jp), s: e.zh, rank: 1 });
    });
    if (K.songsReady()) K.songs.forEach(function (s) {
      var words = (s.v || []).map(function (x) { var p = x.split('|'); return K.plain(p[0]) + ' ' + K.sayText(p[0]) + ' ' + p[1]; }).join(' ');
      var inName = songHay(s).indexOf(ql) >= 0;
      if (!inName && words.toLowerCase().indexOf(ql) < 0) return;
      out.push({ k: '歌單・第 ' + s.n + ' 首' + (inName ? '' : '・單字'), href: '#song.' + s.k, t: s.t, s: [s.by, s.y, s.tie].filter(Boolean).join('・'), rank: inName ? 0 : 3 });
    });
    if (K.dictReady()) K.dict.forEach(function (e) {
      var hay = (e.w + ' ' + e.r + ' ' + hira(e.r) + ' ' + e.m).toLowerCase();
      if (hay.indexOf(ql) < 0) return;
      out.push({ k: '單字大全・' + K.dictCatById[e.cat].name, href: dictHref(e), t: e.w + '（' + e.r + '）', s: e.m, rank: 0.5 });
    });
    K.ordered.forEach(function (L) {
      var inTitle = K.plain(L.title).toLowerCase().indexOf(ql) >= 0;
      if (!inTitle && L.hay.toLowerCase().indexOf(ql) < 0) return;
      out.push({ k: '課程・第 ' + L.stage + ' 階段', href: '#' + L.id, t: K.plain(L.title), s: snippet(L.hay, q), rank: inTitle ? -1 : 2 });
    });
    out.sort(function (a, b) { return a.rank - b.rank; });
    return out.slice(0, 120);
  }
  function showSearch() {
    var h = '<div class="page"><div class="eyebrow">搜尋</div><h1>搜尋</h1><p class="lead">可以用中文、日文漢字或假名搜尋。輸入「ちゃう」會找到所有含這個讀音的例句，輸入「宮崎駿」會找到作品，輸入「心配」會找到單字大全裡的詞。</p>';
    h += '<div class="works-tools"><label class="sr" for="sq">搜尋關鍵字</label><input id="sq" type="search" placeholder="例如：てしまう、宮崎駿、條件、命令形" value="' + esc(lastQ) + '" autocomplete="off"></div><div id="sres"></div></div>';
    main.innerHTML = h;
    renderOutline(null);
    var inp = $('#sq');
    inp.addEventListener('input', function () { lastQ = inp.value; $('#q').value = lastQ; searchResults(); });
    searchResults();
    K.loadSongs(searchResults);
    K.loadDict(searchResults);
    if (window.innerWidth > 560 || !lastQ) inp.focus();
  }
  function searchResults() {
    var box = $('#sres');
    if (!box) return;
    var q = lastQ.trim();
    if (!q) { box.innerHTML = ''; return; }
    var rs = searchAll(q);
    if (!rs.length) { box.innerHTML = '<p class="sec-p">找不到「' + esc(q) + '」。試試換成假名或較短的詞。</p>'; return; }
    box.innerHTML = '<p class="sec-p" style="margin-top:12px">找到 ' + rs.length + (rs.length >= 120 ? '+' : '') + ' 筆。</p><div class="results">' + rs.map(function (r) {
      return '<a class="res" href="' + r.href + '"><span class="rk">' + esc(r.k) + '</span><span class="rt" lang="ja">' + markQ(r.t, q) + '</span>' + (r.s ? '<span class="rs">' + markQ(r.s, q) + '</span>' : '') + '</a>';
    }).join('') + '</div>';
  }
  var qTimer;
  $('#q').addEventListener('input', function (e) {
    lastQ = e.target.value;
    clearTimeout(qTimer);
    qTimer = setTimeout(function () {
      if (location.hash !== '#search') location.hash = '#search';
      else { var s = $('#sq'); if (s) s.value = lastQ; searchResults(); }
    }, 180);
  });
  $('#search-form').addEventListener('submit', function (e) { e.preventDefault(); if (location.hash !== '#search') location.hash = '#search'; });

  /* ───────── about ───────── */
  function showAbout() {
    var P = K.pages.about;
    main.innerHTML = '<article class="page"><div class="eyebrow">關於</div><h1>' + inline(P ? P.title : '關於本站') + '</h1>' + (P && P.lead ? '<p class="lead">' + inline(P.lead) + '</p>' : '') + '<div class="prose">' + (P ? P.html : '') + '</div></article>';
    renderOutline(P ? P.toc : null, '本頁目錄');
  }

  /* ───────── playlist songs ───────── */
  var SONG_CATS = { a: '動畫', d: '日劇', f: '電影', n: '小說改編', v: '虛擬歌手', g: '遊戲', o: '其他' };
  var songQ = '', songCat = 'all', songSort = store.get('songSort', 'list');
  var songDeck = store.get('songDeck', {});
  function songWait(fn) {
    if (K.songsReady()) { fn(); return; }
    main.innerHTML = '<div class="page"><p class="sec-p">正在載入歌單…</p></div>';
    renderOutline(null);
    var want = location.hash;
    K.loadSongs(function () { if (location.hash === want) fn(); });
  }
  function songTitleHtml(s) {
    return s.r ? '<ruby lang="ja">' + esc(s.t) + '<rt>' + esc(s.r) + '</rt></ruby>' : '<span lang="ja">' + esc(s.t) + '</span>';
  }
  function showSongs() {
    songWait(function () {
      var cats = { all: K.songs.length };
      K.songs.forEach(function (s) { var c = s.c || 'o'; cats[c] = (cats[c] || 0) + 1; });
      var h = '<div class="page page-wide"><div class="eyebrow">歌單</div><h1>歌單：每首歌的單字與文法</h1>';
      h += '<p class="lead">你的 Spotify 歌單裡的 ' + K.songs.length + ' 首歌，每一首都有歌名拆解、重要單字和文法重點。本站不收錄歌詞，請在 Spotify App 打開歌曲，一邊看正版歌詞，一邊對照這裡的說明。</p>';
      h += '<div class="tool-bar"><label class="sr" for="songq">篩選歌曲</label><input class="song-q" id="songq" type="search" placeholder="歌名、歌手、作品…" value="' + esc(songQ) + '" autocomplete="off">';
      h += '<label for="ssort">排列</label><select id="ssort">' + [['list', '歌單順序'], ['artist', '依歌手'], ['work', '依作品'], ['year', '依年份']].map(function (o) { return '<option value="' + o[0] + '"' + (songSort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select><span class="counter" id="scount"></span></div>';
      h += '<div class="chips"><button class="chip' + (songCat === 'all' ? ' on' : '') + '" data-scat="all">全部 <b>' + cats.all + '</b></button>';
      Object.keys(SONG_CATS).forEach(function (c) { if (cats[c]) h += '<button class="chip' + (songCat === c ? ' on' : '') + '" data-scat="' + c + '">' + SONG_CATS[c] + ' <b>' + cats[c] + '</b></button>'; });
      h += '</div><div id="slist"></div></div>';
      main.innerHTML = h;
      renderOutline(null);
      $('#songq').addEventListener('input', function (e) { songQ = e.target.value; songList(); });
      $('#ssort').addEventListener('change', function (e) { songSort = e.target.value; store.set('songSort', songSort); songList(); });
      songList();
    });
  }
  function songHay(s) { return (s.t + ' ' + (s.r || '') + ' ' + s.by + ' ' + (s.tie || '') + ' ' + (s.w || '') + ' ' + (s.alt || '')).toLowerCase(); }
  function songList() {
    var q = songQ.trim().toLowerCase();
    var list = K.songs.filter(function (s) { return (songCat === 'all' || (s.c || 'o') === songCat) && (!q || songHay(s).indexOf(q) >= 0); });
    var groupOf = null;
    if (songSort === 'artist') { list.sort(function (a, b) { return a.by.localeCompare(b.by, 'ja') || a.n - b.n; }); groupOf = function (s) { return s.by; }; }
    else if (songSort === 'work') { list.sort(function (a, b) { return (a.w ? 0 : 1) - (b.w ? 0 : 1) || (a.w || '').localeCompare(b.w || '', 'zh-Hant') || a.n - b.n; }); groupOf = function (s) { return s.w || '沒有搭配作品的歌'; }; }
    else if (songSort === 'year') { list.sort(function (a, b) { return (b.y || 0) - (a.y || 0) || a.n - b.n; }); groupOf = function (s) { return s.y ? s.y + ' 年' : '年份不詳'; }; }
    $('#scount').textContent = list.length + ' 首';
    var h = '', last = null;
    list.forEach(function (s) {
      if (groupOf) { var g = groupOf(s); if (g !== last) { h += (last !== null ? '</div>' : '') + '<h2 class="song-grp">' + esc(g) + '</h2><div class="song-rows">'; last = g; } }
      else if (last === null) { h += '<div class="song-rows">'; last = ''; }
      h += '<a class="song-row" href="#song.' + s.k + '"><span class="sr-n">' + s.n + '</span><span class="sr-t">' + songTitleHtml(s) + '</span><span class="sr-by">' + esc(s.by) + '</span><span class="sr-tie">' + (s.tie ? esc(s.tie) : '') + '</span><span class="sr-y">' + (s.y || '') + '</span></a>';
    });
    if (last !== null) h += '</div>';
    $('#slist').innerHTML = h || '<p class="sec-p">沒有符合的歌。</p>';
  }
  function songVocab(s) {
    return (s.v || []).map(function (x) { var p = x.split('|'); return { w: p[0], m: p[1] || '', n: p[2] || '', song: s.k }; });
  }
  function showSong(k) {
    songWait(function () {
      var s = K.songById[k];
      if (!s) { main.innerHTML = '<div class="page"><h1>找不到這首歌</h1><p class="sec-p"><a href="#songs">回到歌單</a></p></div>'; renderOutline(null); return; }
      doc.title = s.t + '｜歌單｜言の葉日文課';
      var ids = String(s.sp || '').split(',').filter(Boolean);
      var h = '<div class="page song-page"><div class="eyebrow"><a href="#songs">歌單</a><span class="dot">第 ' + s.n + ' 首</span>' + (s.c ? '<span class="dot">' + SONG_CATS[s.c] + '</span>' : '') + '</div>';
      h += '<h1 class="song-h">' + songTitleHtml(s) + '</h1>';
      h += '<p class="song-meta">' + [esc(s.by), s.y ? s.y + ' 年' : '', s.tie ? inline(s.tie) : ''].filter(Boolean).join('<span class="sep">・</span>') + '</p>';
      h += '<div class="btns song-acts">';
      ids.forEach(function (id, i) { h += '<a class="btn' + (i ? ' small' : ' primary') + '" href="https://open.spotify.com/track/' + id + '" target="_blank" rel="noopener">' + (i ? '另一個版本' : '在 Spotify 開啟（看正版歌詞）') + '</a>'; });
      var inDeck = !!songDeck[s.k], vs = songVocab(s);
      if (vs.length) h += '<button class="btn small' + (inDeck ? ' is-done' : '') + '" data-act="song-deck" data-k="' + s.k + '">' + (inDeck ? '單字已在單字卡 ✓' : '把 ' + vs.length + ' 個單字加入單字卡') + '</button>';
      h += '</div>';
      var toc = [];
      function sec(id, title) { toc.push({ id: id, text: title }); return '<h2 id="' + id + '">' + title + '</h2>'; }
      if (s.ti) h += sec('sg-title', '歌名拆解') + '<p>' + inline(s.ti) + '</p>';
      if (s.ab) h += sec('sg-about', '這首歌在說什麼') + '<p>' + inline(s.ab) + '</p>';
      if (s.en) h += '<div class="callout note"><div class="callout-b"><p>這首歌的歌詞以英文為主，這裡只整理歌名和日文的部分。</p></div></div>';
      var baseV = vs.filter(function (v) { return !v.mine; });
      if (baseV.length) {
        h += sec('sg-vocab', '單字') + '<p class="sec-p">' + (s.vt ? '依歌名和作品主題整理，聽歌前先認識這些詞。' : '歌裡的重要單字，都是字典形。在 Spotify 看歌詞時找找它們出現在哪裡。') + '</p>';
        h += '<div class="vocab"><div class="vocab-h">' + esc(s.t) + ' 的單字</div>';
        baseV.forEach(function (v) {
          h += '<div class="vrow"><div class="vw" lang="ja">' + inline(v.w) + '</div><div class="vm">' + inline(v.m) + '</div>' + (v.n ? '<div class="vn">' + inline(v.n) + '</div>' : '') + K.sayBtn(K.sayText(v.w), '朗讀單字') + '</div>';
        });
        h += '</div>';
      }
      if (s.g && s.g.length) {
        h += sec('sg-gram', '文法重點') + '<ul class="song-gram">';
        s.g.forEach(function (x) {
          var p = x.split('|'), G = K.songG[p[0]];
          if (!G) { console.warn('unknown grammar key', p[0], s.k); return; }
          h += '<li><a href="#' + G[0] + '">' + inline(G[1]) + '</a>' + (p[1] ? '<span class="sg-n">' + inline(p[1]) + '</span>' : '') + '</li>';
        });
        h += '</ul>';
      }
      var sameW = s.w ? K.songs.filter(function (o) { return o.w === s.w && o !== s; }) : [];
      var sameA = K.songs.filter(function (o) { return o.by === s.by && o !== s && sameW.indexOf(o) < 0; });
      if (sameW.length) h += sec('sg-work', '同一部作品的歌') + songMini(sameW);
      if (sameA.length) h += sec('sg-artist', '同一位歌手') + songMini(sameA);
      var cited = K.ex.filter(function (e) { return e.work === s.k; });
      if (cited.length) {
        h += sec('sg-lessons', '這首歌在課程裡') + '<ul class="wc-cites">';
        cited.forEach(function (e) { var L = K.byId[e.lesson]; h += '<li><a href="#' + e.lesson + '.' + e.xid + '"><span class="cj" lang="ja">' + inline(e.jp) + '</span><span class="cl">第 ' + L.stage + ' 階段・' + esc(K.plain(L.title)) + '</span></a></li>'; });
        h += '</ul>';
      }
      var prev = K.songs[s.n - 2], next = K.songs[s.n];
      h += '<footer class="lesson-end"><nav class="pn" aria-label="上一首與下一首">' + (prev ? '<a class="prev" href="#song.' + prev.k + '"><span class="pk">← 上一首</span><span class="pt">' + songTitleHtml(prev) + '</span></a>' : '') + (next ? '<a class="next" href="#song.' + next.k + '"><span class="pk">下一首 →</span><span class="pt">' + songTitleHtml(next) + '</span></a>' : '') + '</nav></footer></div>';
      main.innerHTML = h;
      renderOutline(toc, '本首目錄');
    });
  }

  function songMini(list) {
    return '<div class="song-rows mini">' + list.map(function (o) { return '<a class="song-row" href="#song.' + o.k + '"><span class="sr-t">' + songTitleHtml(o) + '</span><span class="sr-by">' + esc(o.by) + '</span><span class="sr-y">' + (o.y || '') + '</span></a>'; }).join('') + '</div>';
  }

  /* ───────── 單字大全 ───────── */
  var POS = { '名': '名詞', '代': '代名詞', '動1': '動詞・第一類', '動2': '動詞・第二類', '動3': '動詞・第三類', 'い形': 'い形容詞', 'な形': 'な形容詞', '副': '副詞', '擬': '擬聲擬態語', '接': '接續詞', '連': '片語', '尾': '接尾語', '感': '招呼與感嘆' };
  var POS_GROUP = [['名詞', ['名', '代']], ['動詞', ['動1', '動2', '動3']], ['形容詞', ['い形', 'な形']], ['副詞與擬態語', ['副', '擬']], ['接續詞與片語', ['接', '連', '尾']], ['招呼與感嘆', ['感']]];
  var LV = ['N5', 'N4', 'N3', 'N2', 'N1'];
  var KANA_ROWS = [['あ行', 'あいうえおぁぃぅぇぉゔ'], ['か行', 'かきくけこがぎぐげご'], ['さ行', 'さしすせそざじずぜぞ'], ['た行', 'たちつてとだぢづでどっ'], ['な行', 'なにぬねの'], ['は行', 'はひふへほばびぶべぼぱぴぷぺぽ'], ['ま行', 'まみむめも'], ['や行', 'やゆよゃゅょ'], ['ら行', 'らりるれろ'], ['わ行', 'わをん']];
  var dictDeck = store.get('dictDeck', {}), dictLv = 'all';
  function hira(s) { return String(s).replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); }); }
  function kanaRow(e) { var c = hira(e.r).charAt(0); for (var i = 0; i < KANA_ROWS.length; i++) if (KANA_ROWS[i][1].indexOf(c) >= 0) return i; return KANA_ROWS.length - 1; }
  /* the headword gets one ruby over the whole word when it contains kanji */
  function dictWordMarkup(e) { return /[㐀-鿿々]/.test(e.w) && e.r && e.r !== e.w ? '{' + e.w + '|' + e.r + '}' : e.w; }
  function dictWordHtml(e) { return inline(dictWordMarkup(e)); }
  function dictHref(e) { return '#dict.w.' + encodeURIComponent(e.id); }
  function dictWaitThen(fn) {
    if (K.dictReady()) { fn(); return; }
    main.innerHTML = '<div class="page"><p class="sec-p">正在載入單字大全…</p></div>';
    renderOutline(null);
    var want = location.hash;
    K.loadDict(function () { if (location.hash === want) fn(); });
  }
  function dictLessons(e) {
    var ids = [], k = K.plain(e.w);
    if (e.see && K.byId[e.see]) ids.push(e.see);
    K.vocab.forEach(function (v) { if (K.plain(v.w) === k && ids.indexOf(v.lesson) < 0 && K.byId[v.lesson]) ids.push(v.lesson); });
    return ids;
  }
  function dictRows(list) {
    if (!list.length) return '<p class="sec-p">這裡還沒有單字。</p>';
    return '<div class="dict-rows">' + list.map(function (e) {
      return '<a class="dict-row" href="' + dictHref(e) + '"><span class="dr-w" lang="ja">' + dictWordHtml(e) + '</span><span class="dr-m">' + esc(e.m) + '</span><span class="dr-tag">' + esc(POS[e.pos] || e.pos) + '</span><span class="dr-lv">' + esc(e.lv) + '</span></a>';
    }).join('') + '</div>';
  }
  function dictTabs(on) {
    var tabs = [['', '依主題'], ['by.pos', '依詞類'], ['by.lv', '依程度'], ['by.kana', '依五十音']];
    return '<nav class="dict-tabs" aria-label="瀏覽方式">' + tabs.map(function (t) { return '<a href="#dict' + (t[0] ? '.' + t[0] : '') + '"' + (t[0] === on ? ' class="on"' : '') + '>' + t[1] + '</a>'; }).join('') + '</nav>';
  }
  function dictHead(title, lead, crumbs) {
    return '<div class="page dict-page"><div class="eyebrow"><a href="#dict">單字大全</a>' + (crumbs || '') + '</div><h1>' + title + '</h1>' + (lead ? '<p class="lead">' + lead + '</p>' : '');
  }
  function showDict(arg) {
    dictWaitThen(function () {
      var m;
      arg = arg || '';
      if ((m = arg.match(/^w\.(.+)$/))) { dictEntry(m[1]); return; }
      if ((m = arg.match(/^c\.(.+)$/))) { dictCat(m[1]); return; }
      dictIndex(arg.replace(/^by\./, ''));
    });
  }
  function dictIndex(mode) {
    var h = dictHead('單字大全', '日常生活、學校、工作、情感、動漫、奇幻和型月世界的常用詞，一共 ' + K.dict.length + ' 個。每個詞都寫了「什麼時候用」：適合的場合、語氣、常見的搭配和容易搞混的地方，再配上兩句例句。點任何一個詞，就能看到完整的說明。');
    var toc = [];
    h += dictTabs(mode ? 'by.' + mode : '');
    if (mode === 'pos') {
      POS_GROUP.forEach(function (g, i) {
        var list = K.dict.filter(function (e) { return g[1].indexOf(e.pos) >= 0; });
        if (!list.length) return;
        h += '<h2 id="dp-' + i + '">' + g[0] + '<span class="dict-cnt">' + list.length + ' 個</span></h2>' + dictRows(list);
        toc.push({ id: 'dp-' + i, text: g[0] });
      });
    } else if (mode === 'lv') {
      h += '<p class="sec-p">程度參考常見的日語能力試驗（JLPT）單字分級，只代表大概的難度，不是官方的清單。</p>';
      LV.forEach(function (lv) {
        var list = K.dict.filter(function (e) { return e.lv === lv; });
        if (!list.length) return;
        h += '<h2 id="dl-' + lv + '">' + lv + '<span class="dict-cnt">' + list.length + ' 個</span></h2>' + dictRows(list);
        toc.push({ id: 'dl-' + lv, text: lv });
      });
    } else if (mode === 'kana') {
      KANA_ROWS.forEach(function (row, i) {
        var list = K.dict.filter(function (e) { return kanaRow(e) === i; }).sort(function (a, b) { return hira(a.r).localeCompare(hira(b.r), 'ja'); });
        if (!list.length) return;
        h += '<h2 id="dk-' + i + '">' + row[0] + '<span class="dict-cnt">' + list.length + ' 個</span></h2>' + dictRows(list);
        toc.push({ id: 'dk-' + i, text: row[0] });
      });
    } else {
      h += '<div class="dict-cats">';
      K.dictCats.forEach(function (C) {
        h += '<a class="dict-cat" href="#dict.c.' + C.id + '"><span class="dc-name">' + esc(C.name) + '</span><span class="dc-n">' + C.words.length + ' 個</span><span class="dc-ex" lang="ja">' + C.words.slice(0, 5).map(function (e) { return esc(e.w); }).join('・') + '</span>' + (C.desc ? '<span class="dc-desc">' + esc(C.desc) + '</span>' : '') + '</a>';
      });
      h += '</div>';
    }
    main.innerHTML = h + '</div>';
    renderOutline(toc.length ? toc : null, '目錄');
  }
  function dictCat(id) {
    var C = K.dictCatById[id];
    if (!C) { dictIndex(''); return; }
    var lvs = LV.filter(function (lv) { return C.words.some(function (e) { return e.lv === lv; }); });
    if (dictLv !== 'all' && lvs.indexOf(dictLv) < 0) dictLv = 'all';
    var list = dictLv === 'all' ? C.words : C.words.filter(function (e) { return e.lv === dictLv; });
    var on = !!dictDeck[id];
    var h = dictHead(esc(C.name), C.desc ? esc(C.desc) : '', '<span class="dot">' + C.words.length + ' 個單字</span>');
    h += '<div class="btns"><button class="btn small' + (on ? ' is-done' : '') + '" data-act="dict-deck" data-cat="' + id + '">' + (on ? '已加入單字卡 ✓' : '把這 ' + C.words.length + ' 個單字加入單字卡') + '</button></div>';
    if (lvs.length > 1) h += '<div class="chips"><button class="chip' + (dictLv === 'all' ? ' on' : '') + '" data-dlv="all">全部</button>' + lvs.map(function (lv) { return '<button class="chip' + (dictLv === lv ? ' on' : '') + '" data-dlv="' + lv + '">' + lv + '</button>'; }).join('') + '</div>';
    h += dictRows(list);
    var i = K.dictCats.indexOf(C), prev = K.dictCats[i - 1], next = K.dictCats[i + 1];
    h += '<footer class="lesson-end"><nav class="pn" aria-label="上一類與下一類">' + (prev ? '<a class="prev" href="#dict.c.' + prev.id + '"><span class="pk">← 上一類</span><span class="pt">' + esc(prev.name) + '</span></a>' : '') + (next ? '<a class="next" href="#dict.c.' + next.id + '"><span class="pk">下一類 →</span><span class="pt">' + esc(next.name) + '</span></a>' : '') + '</nav></footer>';
    main.innerHTML = h + '</div>';
    renderOutline(null);
    doc.title = C.name + '｜單字大全｜言の葉日文課';
  }
  function dictEntry(id) {
    var e = K.dictById[id];
    if (!e) { main.innerHTML = '<div class="page"><h1>找不到這個單字</h1><p class="sec-p"><a href="#dict">回到單字大全</a></p></div>'; renderOutline(null); return; }
    var C = K.dictCatById[e.cat], ws = C.words, i = ws.indexOf(e), prev = ws[i - 1], next = ws[i + 1], toc = [];
    function sec(sid, t) { toc.push({ id: sid, text: t }); return '<h2 id="' + sid + '">' + t + '</h2>'; }
    var h = dictHead('<span class="dict-hw" lang="ja">' + dictWordHtml(e) + '</span>', '', '<a class="dot" href="#dict.c.' + C.id + '">' + esc(C.name) + '</a>');
    h += '<div class="dict-meta"><span class="dict-read" lang="ja">' + esc(e.r) + '</span>' + K.sayBtn(e.r || e.w, '朗讀單字') + '<span class="dr-tag">' + esc(POS[e.pos] || e.pos) + '</span><span class="dr-lv">' + esc(e.lv) + '</span></div>';
    h += '<p class="dict-mean">' + esc(e.m) + '</p>';
    if (e.use) h += sec('de-use', '什麼時候用') + '<p>' + inline(e.use) + '</p>';
    if (e.ex.length) {
      h += sec('de-ex', '例句');
      e.ex.forEach(function (x) {
        h += '<figure class="ex t-self"><div class="ex-main"><div class="ex-jp" lang="ja"><span class="ln">' + inline(x.jp) + '</span></div>' + K.sayBtn(K.sayText(x.jp), '朗讀這句') + '</div>' + (x.zh ? '<div class="ex-zh">' + inline(x.zh) + '</div>' : '') + '</figure>';
      });
    }
    if (e.rel.length) {
      h += sec('de-rel', '相關的詞') + '<div class="dict-rel">';
      e.rel.forEach(function (r) {
        var o = K.dictById[r];
        h += o ? '<a href="' + dictHref(o) + '"><span lang="ja">' + dictWordHtml(o) + '</span><span class="dr-m">' + esc(o.m) + '</span></a>' : '<span class="dict-rel-x" lang="ja">' + esc(r) + '</span>';
      });
      h += '</div>';
    }
    var ls = dictLessons(e);
    if (ls.length) {
      h += sec('de-ls', '在課程裡') + '<ul class="wc-cites">';
      ls.forEach(function (lid) { var L = K.byId[lid]; h += '<li><a href="#' + lid + '"><span class="cj">' + inline(L.title) + '</span><span class="cl">第 ' + L.stage + ' 階段・' + esc(K.stages[L.stage].name) + '</span></a></li>'; });
      h += '</ul>';
    }
    h += '<footer class="lesson-end"><nav class="pn" aria-label="上一個與下一個單字">' + (prev ? '<a class="prev" href="' + dictHref(prev) + '"><span class="pk">← 上一個</span><span class="pt" lang="ja">' + esc(prev.w) + '</span></a>' : '') + (next ? '<a class="next" href="' + dictHref(next) + '"><span class="pk">下一個 →</span><span class="pt" lang="ja">' + esc(next.w) + '</span></a>' : '') + '</nav></footer>';
    main.innerHTML = h + '</div>';
    renderOutline(toc, '本詞目錄');
    doc.title = e.w + '｜單字大全｜言の葉日文課';
  }
  function dictCards() {
    if (!K.dictReady()) return [];
    var out = [];
    K.dictCats.forEach(function (C) { if (dictDeck[C.id]) C.words.forEach(function (e) { out.push({ w: dictWordMarkup(e), m: e.m, n: '', stage: 'dict', dict: e.id }); }); });
    return out;
  }

  /* ───────── flashcards ───────── */
  var known = store.get('known', {});
  var card = { stage: 'all', withKnown: false, deck: [], i: 0, flipped: false };
  function vkey(v) { return K.plain(v.w) + '｜' + K.plain(v.m); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function songCards() {
    if (!K.songsReady()) return [];
    var out = [];
    K.songs.forEach(function (s) { if (songDeck[s.k]) songVocab(s).forEach(function (v) { v.stage = 'song'; out.push(v); }); });
    return out;
  }
  function buildDeck() {
    var seen = {};
    card.deck = shuffle(K.vocab.concat(songCards(), dictCards()).filter(function (v) {
      if (card.stage !== 'all' && String(v.stage) !== card.stage) return false;
      var k = vkey(v);
      if (seen[k]) return false;
      seen[k] = 1;
      return card.withKnown || !known[k];
    }));
    card.i = 0; card.flipped = false;
  }
  function showCards() {
    if (Object.keys(songDeck).length && !K.songsReady()) { songWait(showCards); return; }
    if (Object.keys(dictDeck).length && !K.dictReady()) { dictWaitThen(showCards); return; }
    var stagesWith = {}, sc = songCards(), dc = dictCards();
    K.vocab.forEach(function (v) { stagesWith[v.stage] = (stagesWith[v.stage] || 0) + 1; });
    var h = '<div class="page"><div class="eyebrow">單字卡</div><h1>單字卡</h1><p class="lead">各課「單字」區塊裡的詞都會收進這裡；在<a href="#songs">歌單</a>的歌曲頁按「加入單字卡」，那首歌的單字也會加進來。正面只有漢字，先在心裡唸出讀音和意思，再點卡片翻面。按「記住了」的卡之後不再出現。</p>';
    h += '<div class="tool-bar"><label for="cstage">範圍</label><select id="cstage"><option value="all">全部</option>';
    if (sc.length) h += '<option value="song"' + (card.stage === 'song' ? ' selected' : '') + '>歌曲單字（' + Object.keys(songDeck).length + ' 首，' + sc.length + ' 個）</option>';
    if (dc.length) h += '<option value="dict"' + (card.stage === 'dict' ? ' selected' : '') + '>單字大全（' + Object.keys(dictDeck).length + ' 類，' + dc.length + ' 個）</option>';
    K.stages.forEach(function (S) { if (stagesWith[S.n]) h += '<option value="' + S.n + '"' + (card.stage === String(S.n) ? ' selected' : '') + '>第 ' + S.n + ' 階段・' + S.name + '（' + stagesWith[S.n] + '）</option>'; });
    h += '</select><label><input type="checkbox" id="cknown"' + (card.withKnown ? ' checked' : '') + '> 包含已記住的</label><span class="counter" id="ccount"></span></div><div id="cbox"></div></div>';
    main.innerHTML = h;
    renderOutline(null);
    $('#cstage').addEventListener('change', function (e) { card.stage = e.target.value; buildDeck(); renderCard(); });
    $('#cknown').addEventListener('change', function (e) { card.withKnown = e.target.checked; buildDeck(); renderCard(); });
    buildDeck(); renderCard();
  }
  function renderCard() {
    var box = $('#cbox');
    var nKnown = Object.keys(known).length;
    $('#ccount').textContent = card.deck.length ? '第 ' + Math.min(card.i + 1, card.deck.length) + ' / ' + card.deck.length + ' 張・已記住 ' + nKnown : '已記住 ' + nKnown;
    if (!card.deck.length) { box.innerHTML = '<div class="flash"><div><p class="flash-m">這個範圍的卡都記住了。</p><p class="flash-n">勾選「包含已記住的」可以再複習一輪。</p></div></div>'; return; }
    if (card.i >= card.deck.length) { box.innerHTML = '<div class="flash"><div><p class="flash-m">這一輪看完了。</p><div class="flash-btns"><button class="btn primary" data-act="card-restart">再來一輪</button></div></div></div>'; return; }
    var v = card.deck[card.i], L = K.byId[v.lesson], S = v.song && K.songById[v.song], D = v.dict && K.dictById[v.dict];
    var from = S ? '<a href="#song.' + S.k + '">出自歌曲：' + songTitleHtml(S) + '・' + esc(S.by) + '</a>' : D ? '<a href="' + dictHref(D) + '">單字大全：' + esc(K.dictCatById[D.cat].name) + '</a>' : L ? '<a href="#' + v.lesson + '">出自：' + inline(L.title) + '</a>' : '';
    var h = '<div class="flash" data-act="card-flip" role="button" tabindex="0" aria-label="翻面">';
    if (!card.flipped) h += '<div class="flash-w" lang="ja">' + esc(K.plain(v.w)) + '</div><div class="flash-hint">點一下翻面</div>';
    else h += '<div class="flash-w flash-back" lang="ja">' + inline(v.w) + '</div><div class="flash-m">' + inline(v.m) + '</div>' + (v.n ? '<div class="flash-n">' + inline(v.n) + '</div>' : '') + '<div class="flash-l">' + from + '</div>';
    h += '</div><div class="flash-btns">' + K.sayBtn(K.sayText(v.w), '朗讀單字') + '<button class="btn" data-act="card-next">還不熟</button><button class="btn primary" data-act="card-known">記住了</button></div>';
    box.innerHTML = h;
  }

  /* ───────── kana drill ───────── */
  var drill = { sets: store.get('drillSets', ['hira']), mode: store.get('drillMode', 'k2r'), cur: null, opts: [], right: 0, total: 0, streak: 0, stats: store.get('drillStats', {}), lock: false };
  function drillPool() {
    var pool = [];
    drill.sets.forEach(function (s) {
      var T = KANA[s];
      if (!T) return;
      T.rows.forEach(function (R) { R.cells.forEach(function (C) { if (C && C.drill) pool.push({ k: C.k, r: C.r, set: s }); }); });
    });
    return pool;
  }
  function showKana() {
    var h = '<div class="page"><div class="eyebrow">練習</div><h1>假名練習</h1><p class="lead">選要練的假名和題型。答錯的假名之後會更常出現，下方會列出目前最常錯的字。</p>';
    h += '<div class="tool-bar">';
    Object.keys(KANA_NAMES).forEach(function (s) { h += '<label><input type="checkbox" data-dset="' + s + '"' + (drill.sets.indexOf(s) >= 0 ? ' checked' : '') + '> ' + KANA_NAMES[s] + '</label>'; });
    h += '</div><div class="tool-bar"><label for="dmode">題型</label><select id="dmode"><option value="k2r">看假名，選讀音</option><option value="r2k">看讀音，選假名</option><option value="say">聽發音，選假名</option></select><span class="counter" id="dscore"></span></div>';
    h += '<div id="dbox"></div><h2 class="sec-h" style="font-size:19px;margin-top:36px">最常錯的字</h2><div class="weak" id="dweak"></div></div>';
    main.innerHTML = h;
    renderOutline(null);
    $('#dmode').value = drill.mode;
    $('#dmode').addEventListener('change', function (e) { drill.mode = e.target.value; store.set('drillMode', drill.mode); nextDrill(); });
    $$('[data-dset]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        drill.sets = $$('[data-dset]').filter(function (x) { return x.checked; }).map(function (x) { return x.getAttribute('data-dset'); });
        store.set('drillSets', drill.sets);
        nextDrill();
      });
    });
    nextDrill();
  }
  function nextDrill() {
    var box = $('#dbox');
    if (!box) return;
    var pool = drillPool();
    drill.lock = false;
    if (pool.length < 4) { box.innerHTML = '<p class="sec-p">至少勾選一組假名。</p>'; return; }
    var weights = pool.map(function (p) { var s = drill.stats[p.k] || { r: 0, w: 0 }; return 1 + 4 * s.w / (s.r + s.w + 1) + (s.r + s.w === 0 ? 0.6 : 0); });
    var sum = weights.reduce(function (a, b) { return a + b; }, 0), x = Math.random() * sum, pick = pool[0];
    for (var i = 0; i < pool.length; i++) { x -= weights[i]; if (x <= 0) { pick = pool[i]; break; } }
    if (drill.cur && pick.k === drill.cur.k && pool.length > 1) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
    var others = shuffle(pool.filter(function (p) { return p.r !== pick.r; }));
    var opts = [pick], used = {};
    used[pick.r] = 1;
    for (var j = 0; j < others.length && opts.length < 4; j++) { if (!used[others[j].r]) { used[others[j].r] = 1; opts.push(others[j]); } }
    drill.cur = pick; drill.opts = shuffle(opts);
    var h = '<div class="drill-q">';
    if (drill.mode === 'k2r') h += '<div class="drill-k" lang="ja">' + pick.k + '</div>';
    else if (drill.mode === 'r2k') h += '<div class="drill-k romaji">' + pick.r + '</div>';
    else h += '<button class="say" style="width:84px;height:84px" data-say="' + pick.k + '" aria-label="再聽一次">' + K.SPEAKER + '</button><div class="flash-hint">點喇叭再聽一次</div>';
    h += '</div><div class="drill-opts">';
    drill.opts.forEach(function (o) {
      var label = drill.mode === 'k2r' ? o.r : o.k;
      h += '<button class="opt' + (drill.mode === 'k2r' ? '' : ' kana') + '" data-drill="' + o.k + '"' + (drill.mode === 'k2r' ? '' : ' lang="ja"') + '>' + label + '</button>';
    });
    h += '</div>';
    box.innerHTML = h;
    if (drill.mode === 'say') say(pick.k);
    drillScore();
  }
  function drillScore() {
    var s = $('#dscore');
    if (s) s.textContent = '答對 ' + drill.right + ' / ' + drill.total + (drill.streak > 2 ? '・連續 ' + drill.streak + ' 題' : '');
    var wk = $('#dweak');
    if (!wk) return;
    var list = Object.keys(drill.stats).filter(function (k) { return drill.stats[k].w > 0; }).sort(function (a, b) {
      var A = drill.stats[a], B = drill.stats[b];
      return B.w / (B.r + B.w) - A.w / (A.r + A.w) || B.w - A.w;
    }).slice(0, 12);
    wk.innerHTML = list.length ? list.map(function (k) { return '<span lang="ja" title="錯 ' + drill.stats[k].w + ' 次，對 ' + drill.stats[k].r + ' 次">' + k + '</span>'; }).join('') : '<span style="background:none;font-family:inherit;font-size:14px;color:var(--ink-3)">還沒有答錯的字。</span>';
  }
  function answerDrill(btn) {
    if (drill.lock) return;
    drill.lock = true;
    var k = btn.getAttribute('data-drill'), ok = k === drill.cur.k;
    var st = drill.stats[drill.cur.k] || (drill.stats[drill.cur.k] = { r: 0, w: 0 });
    if (ok) { st.r++; drill.right++; drill.streak++; } else { st.w++; drill.streak = 0; }
    drill.total++;
    store.set('drillStats', drill.stats);
    $$('#dbox .opt').forEach(function (o) {
      o.disabled = true;
      if (o.getAttribute('data-drill') === drill.cur.k) o.classList.add('right');
    });
    if (!ok) btn.classList.add('wrong');
    if (drill.mode !== 'say') say(drill.cur.k);
    drillScore();
    var q = $('#dbox .drill-q');
    if (q && !ok) q.insertAdjacentHTML('beforeend', '<div class="flash-hint"><span lang="ja" style="font-size:22px">' + drill.cur.k + '</span> 讀作 ' + drill.cur.r + '</div>');
    setTimeout(nextDrill, ok ? 750 : 1900);
  }

  /* ───────── global events ───────── */
  doc.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;
    var sb = t.closest('[data-say]');
    if (sb) { e.preventDefault(); say(sb.getAttribute('data-say'), sb.classList.contains('say') ? sb : null); return; }
    var opt = t.closest('.quiz .opt');
    if (opt) { answerQuiz(opt); return; }
    var dr = t.closest('[data-drill]');
    if (dr) { answerDrill(dr); return; }
    var zh = t.closest('.ex-zh, .dl-zh');
    if (zh && settings.zh === 'tap') { zh.classList.toggle('shown'); return; }
    var rb = t.closest('ruby');
    if (rb && settings.furi !== 'show' && !t.closest('a')) rb.classList.toggle('peek');
    var to = t.closest('[data-to]');
    if (to) { e.preventDefault(); var el = doc.getElementById(to.getAttribute('data-to')); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
    var st = t.closest('.stage-btn');
    if (st) {
      var n = st.getAttribute('data-stage'), li = st.parentNode, open = !li.classList.contains('open');
      li.classList.toggle('open', open);
      st.setAttribute('aria-expanded', String(open));
      if (open) openStages[n] = 1; else delete openStages[n];
      store.set('openStages', openStages);
      return;
    }
    var gb = t.closest('.grp-btn');
    if (gb) {
      var gk = gb.getAttribute('data-grp'), gli = gb.parentNode, gopen = !gli.classList.contains('open');
      gli.classList.toggle('open', gopen);
      gb.setAttribute('aria-expanded', String(gopen));
      if (gopen) openGroups[gk] = 1; else delete openGroups[gk];
      store.set('openGroups', openGroups);
      return;
    }
    var seg = t.closest('.seg button');
    if (seg) { settings[seg.parentNode.getAttribute('data-set')] = seg.getAttribute('data-v'); saveSettings(); return; }
    var wt = t.closest('[data-wtype]');
    if (wt) { worksType = wt.getAttribute('data-wtype'); worksList(); return; }
    var dlv = t.closest('[data-dlv]');
    if (dlv) { dictLv = dlv.getAttribute('data-dlv'); var dm = location.hash.match(/^#dict\.c\.(.+)$/); if (dm) dictCat(decodeURIComponent(dm[1])); return; }
    var scat = t.closest('[data-scat]');
    if (scat) { songCat = scat.getAttribute('data-scat'); $$('[data-scat]').forEach(function (b) { b.classList.toggle('on', b === scat); }); songList(); return; }
    var act = t.closest('[data-act]');
    if (act) {
      var a = act.getAttribute('data-act');
      if (a === 'menu') { if (doc.body.classList.contains('menu-open')) closeMenu(); else openMenu(); return; }
      if (a === 'menu-close') { closeMenu(); return; }
      if (a === 'settings') { var p = $('#settings'); p.hidden = !p.hidden; act.setAttribute('aria-expanded', String(!p.hidden)); if (!p.hidden) pickVoice(); return; }
      if (a === 'furi') { settings.furi = { show: 'hover', hover: 'hide', hide: 'show' }[settings.furi] || 'show'; saveSettings(); toast('振假名：' + { show: '顯示', hover: '滑過才顯示', hide: '隱藏（點漢字可偷看）' }[settings.furi]); return; }
      if (a === 'zh') { settings.zh = settings.zh === 'show' ? 'tap' : 'show'; saveSettings(); toast(settings.zh === 'tap' ? '翻譯先模糊，點一下才顯示' : '翻譯直接顯示'); return; }
      if (a === 'done') { var id = act.getAttribute('data-id'), v = !done[id]; setDone(id, v); act.classList.toggle('is-done', v); act.textContent = v ? '已讀完這一課 ✓' : '標記為讀完'; return; }
      if (a === 'daily') { var d = $('#daily'); if (d) { d.innerHTML = dailyHtml(); addSameWork(d); } return; }
      if (a === 'card-flip') { card.flipped = !card.flipped; renderCard(); return; }
      if (a === 'card-next') { card.i++; card.flipped = false; renderCard(); return; }
      if (a === 'card-known') { known[vkey(card.deck[card.i])] = 1; store.set('known', known); card.i++; card.flipped = false; renderCard(); return; }
      if (a === 'card-restart') { buildDeck(); renderCard(); return; }
      if (a === 'dict-deck') {
        var dk = act.getAttribute('data-cat'), don = !dictDeck[dk];
        if (don) dictDeck[dk] = 1; else delete dictDeck[dk];
        store.set('dictDeck', dictDeck);
        act.classList.toggle('is-done', don);
        act.textContent = don ? '已加入單字卡 ✓' : '把這 ' + K.dictCatById[dk].words.length + ' 個單字加入單字卡';
        toast(don ? '已加入單字卡，到「單字卡」選「單字大全」就能練習' : '已從單字卡移除');
        return;
      }
      if (a === 'song-deck') {
        var sk = act.getAttribute('data-k'), on = !songDeck[sk];
        if (on) songDeck[sk] = 1; else delete songDeck[sk];
        store.set('songDeck', songDeck);
        act.classList.toggle('is-done', on);
        act.textContent = on ? '單字已在單字卡 ✓' : '把 ' + songVocab(K.songById[sk]).length + ' 個單字加入單字卡';
        toast(on ? '已加入單字卡，到「單字卡」選「歌曲單字」就能練習' : '已從單字卡移除');
        return;
      }
    }
    var setPanel = $('#settings');
    if (!setPanel.hidden && !t.closest('#settings')) closeSettings();
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); closeSettings(); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('data-act') === 'card-flip') { e.preventDefault(); card.flipped = !card.flipped; renderCard(); }
  });

  try {
    Object.keys(localStorage).forEach(function (k) {
      if (/^kotonoha\.(lyrics\.|cbk|lyrRomaji|closed$)/.test(k)) localStorage.removeItem(k);
    });
  } catch (e) { /* storage unavailable */ }

  sideList();
  route();
})();
