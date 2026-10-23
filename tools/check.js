/* Dev-only content checker. In the browser console on the local site:
   eval(await (await fetch('/tools/check.js', {cache: 'reload'})).text()) */
(function () {
  var K = window.K, out = { unknownWorks: [], badXref: [], longRuby: [], halfComma: [], marks: [], noSourceLines: [] };
  K.ex.forEach(function (e) {
    if (e.work !== 'self' && !K.works[e.work]) out.unknownWorks.push(e.lesson + ':' + e.work);
  });
  var ids = {};
  K.lessons.forEach(function (L) { ids[L.id] = 1; });
  Object.keys(K.pages).forEach(function (p) { ids[p] = 1; });
  var all = K.lessons.map(function (L) { return [L.id, (L.lead || '') + '\n' + L.body]; });
  Object.keys(K.pages).forEach(function (p) { all.push(['page:' + p, K.pages[p].body]); });
  all.forEach(function (pair) {
    var id = pair[0], s = pair[1];
    s.replace(/\[\[([^\[\]|]+)\|/g, function (m, t) {
      if (ids[t] || t === 'songs') return;
      if (t.indexOf('song.') === 0 && (!K.songsReady() || K.songById[t.slice(5)])) return;
      out.badXref.push(id + ' → ' + t);
    });
    s.replace(new RegExp('([' + '\\u3005-\\u3007\\u3400-\\u4dbf\\u4e00-\\u9fff' + ']{3,})\\[([^\\[\\]]+)\\]', 'g'), function (m, b, r) { out.longRuby.push(id + ' ' + b + '[' + r + ']'); });
    s.split('\n').forEach(function (line) {
      if (/[一-鿿],[一-鿿]/.test(line)) out.halfComma.push(id + ': ' + line.slice(0, 60));
      if ((line.match(/\*\*/g) || []).length % 2 || (line.match(/==/g) || []).length % 2) out.marks.push(id + ': ' + line.slice(0, 60));
    });
  });
  /* literature is light novels only: no classical works, no non-LN novels */
  out.classicWorks = Object.keys(K.works).filter(function (w) { return K.works[w].type === 'classic'; });
  /* anime: from 2000 on (JoJo / BLEACH / DEATH NOTE allowed), and TYPE-MOON must be cited the most */
  var oldOk = { jojo: 1, deathnote: 1 };
  var banned = { onepiece: 1, jujutsu: 1, kimetsu: 1, dragonball: 1, slamdunk: 1, hokuto: 1 };
  out.oldAnime = Object.keys(K.works).filter(function (w) {
    if (K.works[w].type !== 'anime' || oldOk[w]) return false;
    if (banned[w]) return true;
    var m = String(K.works[w].y || '').match(/(?:動畫|劇場版|電影)?\s*(\d{4})/g) || [];
    var anime = String(K.works[w].y || '').match(/(?:動畫|劇場版)\s*(\d{4})/);
    var y = anime ? +anime[1] : (m.length ? +String(m[m.length - 1]).match(/\d{4}/)[0] : 9999);
    return y < 2000;
  });
  var perWork = {}, tm = 0;
  K.ex.forEach(function (e) {
    var w = K.works[e.work];
    if (!w) return;
    if (w.tm) tm++; else perWork[e.work] = (perWork[e.work] || 0) + 1;
  });
  var top = Object.keys(perWork).sort(function (a, b) { return perWork[b] - perWork[a]; })[0];
  out.typemoon = { examples: tm, nextWork: top, nextCount: perWork[top], ok: tm > perWork[top] };
  /* songs must come from the playlist (js/songs/) */
  if (K.songsReady()) {
    out.songNotInPlaylist = Object.keys(K.works).filter(function (w) { return K.works[w].type === 'song' && !K.songById[w]; });
    out.badSongGrammar = [];
    K.songs.forEach(function (s) { (s.g || []).forEach(function (g) { if (!K.songG[g.split('|')[0]]) out.badSongGrammar.push(s.k + ':' + g); }); });
  }
  var unused = Object.keys(K.works).filter(function (w) { return !K.ex.some(function (e) { return e.work === w; }); });
  out.stats = { lessons: K.lessons.length, ex: K.ex.length, vocab: K.vocab.length, works: Object.keys(K.works).length, unusedWorks: unused.length };
  window.__check = out;
  return out;
})();
