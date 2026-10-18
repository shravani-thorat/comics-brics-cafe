(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rupee(n) { return '\u20B9' + n; }
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function pad(n) { return ('0' + n).slice(-2); }
  function dstr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayStr() { return dstr(new Date()); }
  function fmtHour(h) { return (h > 12 ? h - 12 : h) + ':00 ' + (h >= 12 ? 'pm' : 'am'); }
  function cleanPhone(v) { return v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, ''); }
  function niceDate(s) { return new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }); }
  var WA = '919876543210';

  /* ---------- routing ---------- */
  var PAGES = ['home', 'library', 'build', 'eat', 'visit'];
  var TITLES = { home: 'Comics & Brics | The Hub for Comics, Games, Lego and Food', library: 'Library | Comics & Brics', build: 'Build | Comics & Brics', eat: 'Eat | Comics & Brics', visit: 'Visit | Comics & Brics' };
  var pendingFocus = null;
  function showPage(name) {
    if (PAGES.indexOf(name) < 0) { name = 'home'; }
    qsa('.page').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-page') === name); });
    qsa('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === name); });
    document.title = TITLES[name];
    window.scrollTo(0, 0);
    if (name === 'build') { drawBoard(); }
    if (pendingFocus) {
      var target = $(pendingFocus);
      pendingFocus = null;
      if (target) { setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); }
    }
  }
  function route() { showPage((location.hash || '').replace('#', '')); }
  function go(name) { if (location.hash === '#' + name) { showPage(name); } else { location.hash = name; } }
  window.addEventListener('hashchange', route);
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]');
    if (!g) { return; }
    if (g.getAttribute('data-focus') === 'games') { pendingFocus = 'sec-games'; }
    go(g.getAttribute('data-go'));
  });

  /* ---------- open status + today ---------- */
  var TODAY = [
    ['Sunday', 'Lego build-off', 'One theme, one hour and a bucket of bricks. The room votes for the winner.'],
    ['Monday', 'Quiet reading night', 'Low music, soft lights and the whole comics wall to yourself.'],
    ['Tuesday', 'Strategy table', 'Heavier board games with a host who teaches and plays along.'],
    ['Wednesday', 'Draw and doodle', 'Paper, pens and a theme. No talent needed.'],
    ['Thursday', 'Co-op night', 'Team up against the game. Great for first-timers.'],
    ['Friday', 'Game league', 'Friendly weekly tournament on a rotating board game.'],
    ['Saturday', 'Comic swap', 'Bring one, take one and talk shop with other collectors.']
  ];
  function renderStatus() {
    var now = new Date(), h = now.getHours(), open = h >= 11 && h < 23;
    $('stDot').classList.toggle('on', open);
    $('stText').textContent = open ? 'Open now' : 'Closed right now';
    $('stSub').textContent = open ? 'Open daily until 11 pm' : (h < 11 ? 'Opens today at 11 am' : 'Opens tomorrow at 11 am');
    var t = TODAY[now.getDay()];
    $('todayTitle').textContent = t[1];
    $('todayText').textContent = t[0] + ' special. ' + t[2];
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  /* ---------- gallery lightbox ---------- */
  var imgs = qsa('#gal .gi img'), li = 0;
  function lbShow(i) {
    li = (i + imgs.length) % imgs.length;
    $('lbImg').src = imgs[li].getAttribute('src');
    $('lbImg').alt = imgs[li].getAttribute('alt');
  }
  $('gal').addEventListener('click', function (e) {
    var b = e.target.closest('.gi');
    if (!b) { return; }
    lbShow(parseInt(b.getAttribute('data-i'), 10));
    $('lb').hidden = false;
    document.body.style.overflow = 'hidden';
    $('lbX').focus();
  });
  function lbClose() { if (!$('lb').hidden) { $('lb').hidden = true; document.body.style.overflow = ''; } }
  $('lbX').addEventListener('click', lbClose);
  $('lbP').addEventListener('click', function () { lbShow(li - 1); });
  $('lbN').addEventListener('click', function () { lbShow(li + 1); });
  $('lb').addEventListener('click', function (e) { if (e.target === this) { lbClose(); } });

  /* ---------- dialog ---------- */
  var lastFocus = null;
  function openDialog(html) {
    lastFocus = document.activeElement;
    $('dBody').innerHTML = html;
    $('overlay').hidden = false;
    document.body.style.overflow = 'hidden';
    var f = $('dBody').querySelector('input,a,button');
    (f || $('dClose')).focus();
  }
  function closeDialog() {
    if ($('overlay').hidden) { return; }
    $('overlay').hidden = true;
    $('dBody').innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
  }
  $('dClose').addEventListener('click', closeDialog);
  $('overlay').addEventListener('click', function (e) { if (e.target === this) { closeDialog(); } });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDialog(); lbClose(); }
    if (!$('lb').hidden) {
      if (e.key === 'ArrowLeft') { lbShow(li - 1); }
      if (e.key === 'ArrowRight') { lbShow(li + 1); }
    }
  });

  /* ---------- comics shelf ---------- */
  var COMICS = [
    ['Watchmen', 'Superhero', 'A dark, clever take on what heroes would really do. A landmark of the medium.'],
    ['Batman: Year One', 'Superhero', 'A rookie vigilante and a rookie cop in one gritty city.'],
    ['Ms. Marvel', 'Superhero', 'A teenager finds her powers and her voice. Warm, funny and fast.'],
    ['Spider-Man: Blue', 'Superhero', 'A gentle, nostalgic look back at early days and old loves.'],
    ['X-Men: Days of Future Past', 'Superhero', 'A bleak future, a time-twisting mission and big stakes.'],
    ['Hellboy', 'Superhero', 'A demon raised to fight the paranormal, with a sense of humour.'],
    ['One Piece', 'Manga', 'A rubber-limbed captain and his crew chase the greatest treasure at sea.'],
    ['Naruto', 'Manga', 'An outcast ninja dreams of becoming his village\'s leader.'],
    ['Death Note', 'Manga', 'A notebook, a genius and a cat-and-mouse thriller.'],
    ['Fullmetal Alchemist', 'Manga', 'Two brothers search for a way to undo a terrible mistake.'],
    ['Dragon Ball', 'Manga', 'A boy with a tail, seven magic orbs and a lot of training.'],
    ['Attack on Titan', 'Manga', 'Humanity hides behind walls from giants. Then the walls fall.'],
    ['Maus', 'Graphic novel', 'A son interviews his father about surviving history\'s darkest chapter.'],
    ['Persepolis', 'Graphic novel', 'A girlhood memoir told in bold black and white.'],
    ['Fun Home', 'Graphic novel', 'A thoughtful family memoir about secrets and growing up.'],
    ['Blankets', 'Graphic novel', 'A tender story of first love, faith and a snowy winter.'],
    ['Scott Pilgrim', 'Indie', 'A slacker must beat seven evil exes. Video-game logic, real feelings.'],
    ['Bone', 'Indie', 'Three cousins lost in a valley full of dragons and dreams.'],
    ['Daytripper', 'Indie', 'A writer\'s life seen through its most important days.'],
    ['Nimona', 'Indie', 'A shapeshifter teams up with a villain. Mischief follows.'],
    ['Saga', 'Sci-fi and fantasy', 'Star-crossed parents run from two warring worlds.'],
    ['The Sandman', 'Sci-fi and fantasy', 'The Lord of Dreams, a long escape and a thousand stories.'],
    ['Y: The Last Man', 'Sci-fi and fantasy', 'One man survives a world-changing event. Why him?'],
    ['Akira', 'Sci-fi and fantasy', 'Neo-Tokyo, psychic power and a gang gone wrong.'],
    ['Tintin', 'Kids and classics', 'A young reporter, a loyal dog and globe-trotting mysteries.'],
    ['Asterix', 'Kids and classics', 'One small village resists an empire with magic potion and puns.'],
    ['Calvin and Hobbes', 'Kids and classics', 'A boy and his tiger turn every day into an adventure.'],
    ['Amar Chitra Katha', 'Kids and classics', 'Indian myths, legends and history in illustrated form.'],
    ['Tinkle', 'Kids and classics', 'Beloved Indian kids\' stories, puzzles and recurring characters.'],
    ['Chacha Chaudhary', 'Kids and classics', 'A wise old man whose mind works faster than a computer.']
  ];
  var GCOL = { 'Superhero': '#e3000b', 'Manga': '#f57c00', 'Graphic novel': '#0055bf', 'Indie': '#237841', 'Sci-fi and fantasy': '#6a3fb5', 'Kids and classics': '#d19b00' };
  var GENRES = ['All', 'Superhero', 'Manga', 'Graphic novel', 'Indie', 'Sci-fi and fantasy', 'Kids and classics'];
  var sGenre = 'All', sQuery = '', sSel = -1;
  function matches(c) { return (sGenre === 'All' || c[1] === sGenre) && (!sQuery || c[0].toLowerCase().indexOf(sQuery) > -1); }
  function renderPills() {
    $('sPills').innerHTML = GENRES.map(function (g) { return '<button type="button" class="pill' + (g === sGenre ? ' on' : '') + '" data-g="' + esc(g) + '" aria-pressed="' + (g === sGenre) + '">' + esc(g) + '</button>'; }).join('');
  }
  function renderShelf() {
    $('shelf').innerHTML = COMICS.map(function (c, i) {
      var hgt = 120 + ((i * 37) % 60), w = 40 + ((i * 17) % 18), m = matches(c);
      return '<div class="slot" role="listitem"><button type="button" class="spine' + (m ? '' : ' dim') + (i === sSel ? ' sel' : '') + '" data-s="' + i + '" style="height:' + hgt + 'px;width:' + w + 'px;background:' + GCOL[c[1]] + '" aria-label="' + esc(c[0]) + ', ' + esc(c[1]) + '"' + (m ? '' : ' tabindex="-1"') + '>' + esc(c[0]) + '</button></div>';
    }).join('');
  }
  function showDetail(i) {
    sSel = i;
    var c = COMICS[i];
    $('detail').style.borderLeftColor = GCOL[c[1]];
    $('detail').innerHTML = '<h3>' + esc(c[0]) + '</h3><p><span class="tag" style="background:' + GCOL[c[1]] + '">' + esc(c[1]) + '</span>' + esc(c[2]) + '</p>';
    qsa('.spine').forEach(function (s) { s.classList.toggle('sel', parseInt(s.getAttribute('data-s'), 10) === i); });
  }
  $('shelf').addEventListener('click', function (e) {
    var b = e.target.closest('[data-s]');
    if (b) { showDetail(parseInt(b.getAttribute('data-s'), 10)); }
  });
  $('sPills').addEventListener('click', function (e) {
    var b = e.target.closest('[data-g]');
    if (!b) { return; }
    sGenre = b.getAttribute('data-g'); renderPills(); renderShelf();
  });
  $('sSearch').addEventListener('input', function () { sQuery = this.value.trim().toLowerCase(); renderShelf(); });
  $('sRandom').addEventListener('click', function () {
    var pool = [];
    COMICS.forEach(function (c, i) { if (matches(c)) { pool.push(i); } });
    if (!pool.length) { toast('Nothing matches. Clear the search first.'); return; }
    var i = pool[Math.floor(Math.random() * pool.length)];
    renderShelf(); showDetail(i);
    $('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  renderPills(); renderShelf();

  /* ---------- game finder ---------- */
  var GAMES = [
    ['Catan', 3, 4, 90, ['brainy']], ['Ticket to Ride', 2, 5, 60, ['brainy']], ['Codenames', 4, 8, 20, ['party', 'quick']], ['Pandemic', 2, 4, 60, ['coop', 'brainy']], ['Azul', 2, 4, 40, ['brainy']],
    ['Carcassonne', 2, 5, 40, ['brainy']], ['Exploding Kittens', 2, 5, 15, ['party', 'quick']], ['Sushi Go!', 2, 5, 15, ['quick']], ['Splendor', 2, 4, 30, ['brainy', 'quick']], ['Sagrada', 1, 4, 40, ['brainy']],
    ['Wingspan', 1, 5, 70, ['brainy']], ['Terraforming Mars', 1, 5, 150, ['brainy']], ['Twilight Imperium', 3, 6, 180, ['brainy']], ['Werewolf', 6, 12, 30, ['party']], ['Dixit', 3, 6, 30, ['party']],
    ['Jenga', 1, 8, 15, ['party', 'quick']], ['Uno', 2, 10, 20, ['party', 'quick']], ['Chess', 2, 2, 45, ['brainy']], ['Forbidden Island', 2, 4, 30, ['coop', 'quick']], ['Hanabi', 2, 5, 25, ['coop', 'quick']],
    ['Cluedo', 3, 6, 60, ['party', 'brainy']], ['7 Wonders', 3, 7, 45, ['brainy']], ['Taboo', 4, 10, 30, ['party']], ['Betrayal at House on the Hill', 3, 6, 75, ['coop', 'party']], ['Connect 4', 2, 2, 10, ['quick']], ['Pictionary', 4, 10, 40, ['party']]
  ];
  var fPlayers = 2, fVibe = 'any';
  function renderGames() {
    var out = GAMES.filter(function (g) {
      var fit = fPlayers === 2 ? g[1] <= 2 : fPlayers === 8 ? g[2] >= 7 : (g[1] <= fPlayers && g[2] >= fPlayers - 1);
      return fit && (fVibe === 'any' || g[4].indexOf(fVibe) > -1);
    });
    $('fCount').textContent = out.length + ' of ' + GAMES.length + ' sample games match (hundreds on our shelves)';
    $('gl').innerHTML = out.length ? out.map(function (g) {
      return '<article class="gcard"><h3>' + esc(g[0]) + '</h3><p>' + g[1] + (g[1] === g[2] ? '' : ' to ' + g[2]) + ' players &middot; about ' + g[3] + ' min</p></article>';
    }).join('') : '<p>No games match that mix. Try another vibe.</p>';
  }
  function pillGroup(id, cb) {
    $(id).addEventListener('click', function (e) {
      var b = e.target.closest('[data-v]');
      if (!b) { return; }
      qsa('.pill', $(id)).forEach(function (p) { var on = p === b; p.classList.toggle('on', on); p.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      cb(b.getAttribute('data-v'));
    });
  }
  pillGroup('fPlayers', function (v) { fPlayers = parseInt(v, 10); renderGames(); });
  pillGroup('fVibe', function (v) { fVibe = v; renderGames(); });
  renderGames();

  /* ---------- brick builder ---------- */
  var COLS = 20, ROWS = 12, CELL = 40;
  var COLORS = [['Red', '#e3000b'], ['Orange', '#f57c00'], ['Yellow', '#ffd500'], ['Lime', '#7ac143'], ['Blue', '#0055bf'], ['White', '#f4f4f4'], ['Black', '#1c1c1c'], ['Erase', '']];
  var canvas = $('canvas'), ctx = canvas.getContext('2d');
  var board = [], history = [], curColor = 0, drawing = false, strokeSnap = null;
  function emptyBoard() { var b = []; for (var i = 0; i < COLS * ROWS; i++) { b.push(-1); } return b; }
  try {
    var saved = JSON.parse(localStorage.getItem('cb_board') || 'null');
    board = (saved && saved.length === COLS * ROWS) ? saved : emptyBoard();
  } catch (e) { board = emptyBoard(); }
  function saveBoard() { try { localStorage.setItem('cb_board', JSON.stringify(board)); } catch (e) { /* ignore */ } }
  function drawBoard() {
    ctx.fillStyle = '#2d8a52';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var n = 0;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var x = c * CELL, y = r * CELL, v = board[r * COLS + c];
        if (v < 0) {
          ctx.fillStyle = 'rgba(255,255,255,.14)';
          ctx.beginPath(); ctx.arc(x + CELL / 2, y + CELL / 2, 11, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,.18)';
          ctx.beginPath(); ctx.arc(x + CELL / 2, y + CELL / 2 + 2, 11, 0.1, Math.PI - 0.1); ctx.fill();
        } else {
          n++;
          var col = COLORS[v][1];
          ctx.fillStyle = col;
          roundRect(x + 2, y + 2, CELL - 4, CELL - 4, 6); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,.22)';
          roundRect(x + 2, y + CELL - 9, CELL - 4, 7, 4); ctx.fill();
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(x + CELL / 2, y + CELL / 2 - 1, 11, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.35)';
          ctx.beginPath(); ctx.arc(x + CELL / 2 - 3, y + CELL / 2 - 4, 4, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    $('bCount').textContent = n;
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  }
  function renderPalette() {
    $('palette').innerHTML = COLORS.map(function (c, i) {
      var style = c[1] ? '--c:' + c[1] : '--c:#cfd6e6';
      return '<button type="button" class="sw' + (c[0] === 'White' ? ' white' : '') + '" data-c="' + i + '" style="' + style + '" aria-pressed="' + (i === curColor) + '" aria-label="' + c[0] + (c[1] ? ' brick' : ' tool') + '">' + (c[1] ? '' : 'Erase') + '</button>';
    }).join('');
  }
  $('palette').addEventListener('click', function (e) {
    var b = e.target.closest('[data-c]');
    if (!b) { return; }
    curColor = parseInt(b.getAttribute('data-c'), 10);
    renderPalette();
  });
  function cellAt(e) {
    var rect = canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) * (canvas.width / rect.width), y = (e.clientY - rect.top) * (canvas.height / rect.height);
    var c = Math.floor(x / CELL), r = Math.floor(y / CELL);
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) { return -1; }
    return r * COLS + c;
  }
  function place(idx) {
    if (idx < 0) { return; }
    var v = COLORS[curColor][1] ? curColor : -1;
    if (board[idx] !== v) { board[idx] = v; drawBoard(); }
  }
  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    drawing = true;
    strokeSnap = board.slice();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    place(cellAt(e));
  });
  canvas.addEventListener('pointermove', function (e) { if (drawing) { place(cellAt(e)); } });
  function endStroke() {
    if (!drawing) { return; }
    drawing = false;
    if (strokeSnap && strokeSnap.join() !== board.join()) { history.push(strokeSnap); if (history.length > 60) { history.shift(); } saveBoard(); }
    strokeSnap = null;
  }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  $('bUndo').addEventListener('click', function () {
    if (!history.length) { toast('Nothing to undo'); return; }
    board = history.pop(); saveBoard(); drawBoard();
  });
  $('bClear').addEventListener('click', function () {
    if (board.every(function (v) { return v < 0; })) { toast('The baseplate is already empty'); return; }
    history.push(board.slice()); board = emptyBoard(); saveBoard(); drawBoard();
  });
  $('bSurprise').addEventListener('click', function () {
    history.push(board.slice());
    board = emptyBoard();
    var mid = (COLS - 1) / 2;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c <= mid; c++) {
        if (Math.random() < 0.5) { var v = Math.floor(Math.random() * 7); board[r * COLS + c] = v; board[r * COLS + (COLS - 1 - c)] = v; }
      }
    }
    saveBoard(); drawBoard();
  });
  $('bSave').addEventListener('click', function () {
    if (board.every(function (v) { return v < 0; })) { toast('Place a few bricks first'); return; }
    try {
      var a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'my-brick-build.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast('Picture downloaded');
    } catch (err) { toast('Could not save the picture on this device'); }
  });
  renderPalette(); drawBoard();

  /* ---------- Lego room booking ---------- */
  var lHour = null, lBuilders = 2, lStyle = 'Free build', lHours = [12, 13, 14, 15, 16, 17, 18, 19, 20];
  function spotsLeft(dateStr, h) {
    var d = new Date(dateStr + 'T00:00:00'), seed = d.getDate() * 7 + d.getMonth() * 5 + h * 13;
    return seed % 11;
  }
  function renderSlots() {
    var date = $('lDate').value, isToday = date === todayStr(), nowH = new Date().getHours();
    if (lHour !== null && ((isToday && lHour <= nowH) || spotsLeft(date, lHour) === 0)) { lHour = null; }
    $('lSlots').innerHTML = lHours.map(function (h) {
      var left = spotsLeft(date, h), past = isToday && h <= nowH, dis = past || left === 0;
      return '<button type="button" class="slotb' + (lHour === h ? ' on' : '') + '" data-h="' + h + '"' + (dis ? ' disabled' : '') + '>' + fmtHour(h) + '<small>' + (past ? 'Passed' : left === 0 ? 'Full' : left + (left === 1 ? ' spot left' : ' spots left')) + '</small></button>';
    }).join('');
  }
  (function initLego() {
    var max = new Date(); max.setDate(max.getDate() + 30);
    $('lDate').min = todayStr(); $('lDate').max = dstr(max); $('lDate').value = todayStr();
    renderSlots();
  })();
  $('lDate').addEventListener('change', function () {
    if (!this.value || this.value < todayStr()) { this.value = todayStr(); }
    $('eSlot').textContent = ''; renderSlots();
  });
  $('lSlots').addEventListener('click', function (e) {
    var b = e.target.closest('[data-h]');
    if (!b || b.disabled) { return; }
    lHour = parseInt(b.getAttribute('data-h'), 10); $('eSlot').textContent = ''; $('eBuild').textContent = ''; renderSlots();
  });
  $('lm').addEventListener('click', function () { lBuilders = Math.max(1, lBuilders - 1); $('lc').textContent = lBuilders; $('eBuild').textContent = ''; });
  $('lp').addEventListener('click', function () { lBuilders = Math.min(10, lBuilders + 1); $('lc').textContent = lBuilders; $('eBuild').textContent = ''; });
  pillGroup('lStyle', function (v) { lStyle = v; });
  $('lHold').addEventListener('click', function () {
    var date = $('lDate').value;
    if (lHour === null) { $('eSlot').textContent = 'Choose a session.'; return; }
    var left = spotsLeft(date, lHour);
    if (lBuilders > left) { $('eBuild').textContent = 'Only ' + left + (left === 1 ? ' spot is' : ' spots are') + ' left in that session.'; return; }
    openDialog('<h2 id="dTitle">Hold your spot</h2><p>' + esc(lStyle) + ' on ' + esc(niceDate(date)) + ' at ' + fmtHour(lHour) + ' for ' + lBuilders + (lBuilders === 1 ? ' builder' : ' builders') + '.</p>' +
      '<form id="holdForm" novalidate><div class="field"><label for="hName">Name</label><input type="text" id="hName" autocomplete="name"><small class="er" id="eHName"></small></div>' +
      '<div class="field"><label for="hPhone">Mobile number</label><input type="tel" id="hPhone" inputmode="numeric" placeholder="10 digits"><small class="er" id="eHPhone"></small></div>' +
      '<button type="submit" class="btn b-red wide">Confirm</button></form>');
  });
  function codeFor(prefix) { return prefix + '-' + Math.floor(1000 + Math.random() * 9000); }
  $('dBody').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target.id, ok = true, name, phone;
    if (f === 'holdForm') {
      name = $('hName').value.trim(); phone = cleanPhone($('hPhone').value);
      $('eHName').textContent = name.length < 2 ? 'Enter your name.' : ''; if (name.length < 2) { ok = false; }
      var pv = /^[6-9]\d{9}$/.test(phone); $('eHPhone').textContent = pv ? '' : 'Enter a valid 10-digit mobile number.'; if (!pv) { ok = false; }
      if (!ok) { return; }
      var code = codeFor('LG'), date = $('lDate').value;
      var msg = 'Hi Comics & Brics! Lego room ' + code + '\nName: ' + name + '\nDate: ' + niceDate(date) + '\nSession: ' + fmtHour(lHour) + ' (' + lStyle + ')\nBuilders: ' + lBuilders;
      openDialog('<h2 id="dTitle">Spot held!</h2><span class="code">' + code + '</span><p>' + esc(name) + ', your ' + esc(lStyle.toLowerCase()) + ' session is on ' + esc(niceDate(date)) + ' at ' + fmtHour(lHour) + '. Send the details on WhatsApp so the team can confirm.</p>' +
        '<div class="btns"><a class="btn b-green sm" id="dWa" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '">Send on WhatsApp</a><button type="button" class="btn b-white sm" id="dDone">Done</button></div>');
    }
    if (f === 'joinForm') {
      name = $('jName').value.trim(); phone = cleanPhone($('jPhone').value);
      $('eJName').textContent = name.length < 2 ? 'Enter your name.' : ''; if (name.length < 2) { ok = false; }
      var pv2 = /^[6-9]\d{9}$/.test(phone); $('eJPhone').textContent = pv2 ? '' : 'Enter a valid 10-digit mobile number.'; if (!pv2) { ok = false; }
      if (!ok) { return; }
      var p = PASSES[joinIdx], c2 = codeFor('HP');
      var m2 = 'Hi Comics & Brics! I want the ' + p.n + ' (' + c2 + ')\nName: ' + name + '\nPhone: ' + phone;
      openDialog('<h2 id="dTitle">Welcome aboard!</h2><span class="code">' + c2 + '</span><p>' + esc(name) + ', you picked the ' + esc(p.n) + '. Send a message on WhatsApp and the team will set up your pass.</p>' +
        '<div class="btns"><a class="btn b-green sm" id="dWa" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(m2) + '">Send on WhatsApp</a><button type="button" class="btn b-white sm" id="dDone">Done</button></div>');
    }
  });
  $('dBody').addEventListener('click', function (e) {
    if (e.target.id === 'dDone') { closeDialog(); toast('All set. See you soon!'); }
    if (e.target.id === 'rDone') { closeDialog(); resetRes(); toast('Table noted. See you at the hub!'); go('home'); }
  });

  /* ---------- eat: combo builder ---------- */
  var COMBO = {
    cMain: { label: 'main', items: [['Foundation Burger', 'Chicken patty, cheese, pickles', 279], ['Baseplate Pizza', 'Four cheeses, thin crust', 319], ['Stacked Sandwich', 'Grilled veg, cheese, chutney', 199], ['Blueprint Pasta', 'Creamy penne, herbs, parmesan', 279]] },
    cSide: { label: 'side', items: [['Snap-Fit Fries', 'Crisp, with peri-peri dust', 129], ['Corner Piece Garlic Bread', 'Toasted, cheesy, buttery', 149], ['Mini-fig Nuggets', 'Crunchy bites, smoky dip', 169], ['Plain Side Salad', 'Fresh and light', 99]] },
    cDrink: { label: 'drink', items: [['Foreman\'s Cold Coffee', 'Thick and chilled', 159], ['Builder\'s Chai', 'Strong masala chai', 89], ['Blue Block Lagoon', 'Blue citrus fizz', 149], ['Yellow Brick Lemonade', 'Fresh and zesty', 119]] },
    cSweet: { label: 'sweet', items: [['No sweet today', 'Skip dessert', 0], ['Brownie Bricks', 'Warm brownie with ice cream', 179], ['Waffle Baseplate', 'Waffle with chocolate sauce', 189], ['Tiramisu Tower', 'Coffee sponge and cream', 199]] }
  };
  var combo = { cMain: -1, cSide: -1, cDrink: -1, cSweet: -1 };
  function renderCombo() {
    Object.keys(COMBO).forEach(function (k) {
      $(k).innerHTML = COMBO[k].items.map(function (it, i) {
        return '<button type="button" class="opt" role="radio" aria-checked="' + (combo[k] === i) + '" data-k="' + k + '" data-i="' + i + '"><strong>' + esc(it[0]) + '</strong><span>' + esc(it[1]) + '</span><b>' + (it[2] ? rupee(it[2]) : 'Free') + '</b></button>';
      }).join('');
    });
    var lines = [], total = 0;
    Object.keys(COMBO).forEach(function (k) {
      if (combo[k] > -1) { var it = COMBO[k].items[combo[k]]; if (it[2]) { lines.push([it[0], it[2]]); total += it[2]; } }
    });
    $('stackList').innerHTML = lines.map(function (l) { return '<li><span>' + esc(l[0]) + '</span><span>' + rupee(l[1]) + '</span></li>'; }).join('');
    $('stackEmpty').hidden = lines.length > 0;
    $('stackTotal').textContent = rupee(total);
    return { lines: lines, total: total };
  }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('.opt');
    if (!o) { return; }
    var k = o.getAttribute('data-k'), i = parseInt(o.getAttribute('data-i'), 10);
    combo[k] = combo[k] === i && k !== 'cSweet' ? -1 : i;
    renderCombo();
    var again = document.querySelector('.opt[data-k="' + k + '"][data-i="' + i + '"]');
    if (again) { again.focus(); }
  });
  $('stackReset').addEventListener('click', function () { combo = { cMain: -1, cSide: -1, cDrink: -1, cSweet: -1 }; renderCombo(); toast('Stack cleared'); });
  $('stackSend').addEventListener('click', function () {
    var s = renderCombo();
    if (!s.lines.length) { toast('Pick something for your stack first'); return; }
    var who = $('stackName').value.trim();
    var msg = 'Hi Comics & Brics! Combo order' + (who ? ' for ' + who : '') + ':\n' + s.lines.map(function (l) { return '- ' + l[0] + ' (' + rupee(l[1]) + ')'; }).join('\n') + '\nTotal: ' + rupee(s.total);
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    toast('Opening WhatsApp with your order');
  });
  renderCombo();

  var FULL = {
    'Mains': [['Foundation Burger', 'Chicken patty, cheese, pickles, house sauce', 279], ['Baseplate Pizza', 'Four cheeses on a thin crust', 319], ['Stacked Sandwich', 'Grilled vegetables, cheese, chutney', 199], ['Blueprint Pasta', 'Creamy penne, herbs and parmesan', 279], ['Roll Call Wrap', 'Tandoori chicken, onions, mint mayo', 249]],
    'Sides and snacks': [['Snap-Fit Fries', 'Crisp, with peri-peri dust and garlic dip', 129], ['Corner Piece Garlic Bread', 'Toasted baguette with mozzarella', 149], ['Mini-fig Nuggets', 'Crunchy chicken bites with a smoky dip', 169], ['Cheese Brick Nachos', 'Chips, cheese sauce, jalapenos, salsa', 229]],
    'Drinks': [['Foreman\'s Cold Coffee', 'Thick and chilled', 159], ['Builder\'s Chai', 'Strong masala chai in a kulhad', 89], ['Blue Block Lagoon', 'Blue citrus fizz', 149], ['Yellow Brick Lemonade', 'Fresh and zesty', 119], ['Red Brick Berry Cooler', 'Mixed berries, mint and soda', 159]],
    'Sweets': [['Brownie Bricks', 'Warm brownie with vanilla ice cream', 179], ['Waffle Baseplate', 'Belgian waffle with chocolate sauce', 189], ['Tiramisu Tower', 'Coffee-soaked sponge and mascarpone', 199]]
  };
  $('fullMenu').innerHTML = Object.keys(FULL).map(function (k, i) {
    return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(k) + '</summary><ul>' + FULL[k].map(function (m) { return '<li><div><strong>' + esc(m[0]) + '</strong><span>' + esc(m[1]) + '</span></div><b>' + rupee(m[2]) + '</b></li>'; }).join('') + '</ul></details>';
  }).join('');

  /* ---------- visit: reservation, pass, faq ---------- */
  function buildTimes() {
    var isToday = $('rDate').value === todayStr(), nowH = new Date().getHours(), cur = $('rTime').value, html = '<option value="">Choose a time</option>';
    for (var h = 11; h <= 22; h++) { html += '<option value="' + h + '"' + (isToday && h <= nowH ? ' disabled' : '') + '>' + fmtHour(h) + '</option>'; }
    $('rTime').innerHTML = html;
    if (cur && !(isToday && parseInt(cur, 10) <= nowH)) { $('rTime').value = cur; }
  }
  (function initRes() {
    var g = '';
    for (var i = 1; i <= 12; i++) { g += '<option value="' + i + '"' + (i === 4 ? ' selected' : '') + '>' + i + (i === 1 ? ' guest' : ' guests') + '</option>'; }
    $('rGuests').innerHTML = g;
    $('rDate').min = todayStr(); $('rDate').value = todayStr();
    buildTimes();
  })();
  $('rDate').addEventListener('change', buildTimes);
  function resetRes() { $('resForm').reset(); $('rDate').value = todayStr(); $('rGuests').value = '4'; buildTimes(); }
  function setErr(id, msg) { $(id).textContent = msg || ''; $(id).parentNode.classList.toggle('bad', !!msg); }
  $('resForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, date = $('rDate').value, time = $('rTime').value, name = $('rName').value.trim(), phone = cleanPhone($('rPhone').value);
    if (!date || date < todayStr()) { setErr('eRDate', 'Choose today or a later date.'); ok = false; } else { setErr('eRDate'); }
    if (!time) { setErr('eRTime', 'Choose a time.'); ok = false; } else { setErr('eRTime'); }
    if (name.length < 2) { setErr('eRName', 'Enter your name.'); ok = false; } else { setErr('eRName'); }
    if (!/^[6-9]\d{9}$/.test(phone)) { setErr('eRPhone', 'Enter a valid 10-digit mobile number.'); ok = false; } else { setErr('eRPhone'); }
    if (!ok) { var first = document.querySelector('.res .bad'); if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    var guests = $('rGuests').value, zone = $('rZone').value, note = $('rNote').value.trim(), code = codeFor('CB'), h = parseInt(time, 10);
    var msg = 'Hi Comics & Brics! Reservation ' + code + '\nName: ' + name + '\nDate: ' + niceDate(date) + '\nTime: ' + fmtHour(h) + '\nGuests: ' + guests + '\nSeating: ' + zone + (note ? '\nNotes: ' + note : '');
    try { localStorage.setItem('cb4_last_res', JSON.stringify({ code: code, date: date, hour: h })); } catch (err) { /* ignore */ }
    openDialog('<h2 id="dTitle">Table reserved!</h2><span class="code">' + code + '</span><p>' + esc(name) + ', that is ' + guests + (guests === '1' ? ' guest' : ' guests') + ' on ' + esc(niceDate(date)) + ' at ' + fmtHour(h) + '. We hold your table for 15 minutes past your time. Send the details on WhatsApp for the team to confirm.</p>' +
      '<div class="btns"><a class="btn b-green sm" id="rWa" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '">Send on WhatsApp</a><button type="button" class="btn b-white sm" id="rDone">Done</button></div>');
  });

  var PASSES = [
    { n: 'Reader Pass', p: 499, l: ['Unlimited comics wall time', 'A reserved reading corner on request', 'Early look at new arrivals'] },
    { n: 'Builder Pass', p: 699, l: ['Four Lego room sessions a month', 'Priority on challenge builds', 'Display shelf space for one model'] },
    { n: 'Hub Pass', p: 999, l: ['Everything in Reader and Builder', 'Game league entry', 'Member days with extra perks'] }
  ];
  var joinIdx = 0;
  $('passes').innerHTML = PASSES.map(function (p, i) {
    return '<article class="pass"><h3>' + esc(p.n) + '</h3><p class="price">' + rupee(p.p) + ' <small>per month</small></p><ul>' + p.l.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><button type="button" class="btn ' + (i === 1 ? 'b-red' : 'b-blue') + '" data-join="' + i + '">Join ' + esc(p.n) + '</button></article>';
  }).join('');
  $('passes').addEventListener('click', function (e) {
    var b = e.target.closest('[data-join]');
    if (!b) { return; }
    joinIdx = parseInt(b.getAttribute('data-join'), 10);
    var p = PASSES[joinIdx];
    openDialog('<h2 id="dTitle">' + esc(p.n) + '</h2><p>' + rupee(p.p) + ' per month. Tell us who you are and we will set it up.</p><form id="joinForm" novalidate><div class="field"><label for="jName">Name</label><input type="text" id="jName" autocomplete="name"><small class="er" id="eJName"></small></div>' +
      '<div class="field"><label for="jPhone">Mobile number</label><input type="tel" id="jPhone" inputmode="numeric" placeholder="10 digits"><small class="er" id="eJPhone"></small></div><button type="submit" class="btn b-red wide">Join now</button></form>');
  });

  var FAQ = [
    ['Do I have to buy something to read the comics?', 'Reading time is part of your visit. We just ask that you order something from the kitchen while you settle in.'],
    ['Can kids use the Lego room?', 'Yes. Little builders sessions are made for ages 4 to 8 with a grown-up, and older kids can join free or challenge builds.'],
    ['Can I buy the comics?', 'The wall is for reading in the cafe. Ask the team if you would like help finding a copy to buy elsewhere.'],
    ['Do you teach the board games?', 'Always. Pick a box and a team member will explain it in a few minutes.'],
    ['Is there vegetarian food?', 'Yes, plenty. Each dish is clearly described, and the kitchen can adjust many dishes on request.']
  ];
  $('faq').innerHTML = FAQ.map(function (f) { return '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>'; }).join('');

  route();
})();
