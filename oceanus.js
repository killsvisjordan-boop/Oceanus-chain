
/* ═══════════════════════════════════════════════════════
   OCEANUS OS — COMPLETE RUNTIME ENGINE
   Boot sequence properly animates 0→100%, fades out,
   shows gate, then desktop on "ENTER THE DEEP" click.
═══════════════════════════════════════════════════════ */

/* ── 1. BOOT SEQUENCE (runs immediately on parse) ────── */
(function () {
  var bar    = document.getElementById('ld-bar');
  var pct    = document.getElementById('ld-pct');
  var txt    = document.getElementById('ld-text');
  var screen = document.getElementById('screen-loading');
  var gate   = document.getElementById('screen-gate');

  if (!bar || !screen || !gate) return; // safety

  var steps = [
    [8,   'Loading kernel modules...'],
    [18,  'Establishing ETH node connection...'],
    [30,  'Verifying blockchain integrity...'],
    [44,  'Syncing wallet interface...'],
    [56,  'Decrypting pioneer credentials...'],
    [68,  'Mounting Oceanus filesystem...'],
    [78,  'Calibrating OCS price oracle...'],
    [88,  'Loading desktop environment...'],
    [96,  'Finalizing system boot...'],
    [100, 'Oceanus OS ready.']
  ];

  var idx = 0;

  function tick() {
    if (idx >= steps.length) {
      // All steps done → wait briefly, then fade loading screen, show gate
      setTimeout(function () {
        screen.classList.add('fade');
        setTimeout(function () {
          screen.style.display = 'none';
          gate.classList.add('show');
        }, 900);
      }, 500);
      return;
    }
    var step = steps[idx++];
    bar.style.width   = step[0] + '%';
    pct.textContent   = step[0] + '%';
    if (txt) txt.textContent = step[1];
    var delay = step[0] < 50 ? 280 : step[0] < 90 ? 360 : 480;
    setTimeout(tick, delay);
  }

  setTimeout(tick, 700); // initial pause to show "0%"
})();

/* ── 2. GATE → SITE ──────────────────────────────────── */
function enterSite() {
  var gate = document.getElementById('screen-gate');
  var site = document.getElementById('site');
  if (!gate || !site) return;
  gate.classList.add('hide');
  setTimeout(function () {
    gate.style.display = 'none';
    site.classList.add('visible');
    _initDesktop();
  }, 650);
}

/* ── 3. DESKTOP INIT (called once) ──────────────────── */
var _desktopReady = false;
function _initDesktop() {
  if (_desktopReady) return;
  _desktopReady = true;
  _startClock();
  _startCanvas();
  _startCountdown();
  _initDrag();
  _initCursor();
  _initReveal();
  _initActivityFeed();
  _initLeaderboard();
  _initLiveCounters();
  _animPresaleBar();
  _initOcsBuyEstimates();
  setTimeout(function () { openWindow('win-hero'); }, 200);
}

/* ── 4. CLOCK ─────────────────────────────────────────── */
function _startClock() {
  function tick() {
    var n = new Date();
    var h = ('0'+n.getHours()).slice(-2);
    var m = ('0'+n.getMinutes()).slice(-2);
    var s = ('0'+n.getSeconds()).slice(-2);
    var mo = ('0'+(n.getMonth()+1)).slice(-2);
    var d  = ('0'+n.getDate()).slice(-2);
    var el = document.getElementById('sys-clock');
    var de = document.getElementById('sys-date');
    if (el) el.textContent = h+':'+m+':'+s;
    if (de) de.textContent = mo+'/'+d+'/'+n.getFullYear();
  }
  tick(); setInterval(tick, 1000);
}

/* ── 5. COUNTDOWN ─────────────────────────────────────── */
function _startCountdown() {
  var target = Date.now() + 15 * 86400000;
  function tick() {
    var diff = target - Date.now();
    if (diff < 0) diff = 0;
    var days  = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins  = Math.floor((diff % 3600000) / 60000);
    var secs  = Math.floor((diff % 60000) / 1000);
    function set(id, v) { var el=document.getElementById(id); if(el) el.textContent=('0'+v).slice(-2); }
    set('cd-d', days); set('cd-h', hours); set('cd-m', mins); set('cd-s', secs);
  }
  tick(); setInterval(tick, 1000);
}

/* ── 6. CANVAS ─────────────────────────────────────────── */
function _startCanvas() {
  var canvas = document.getElementById('ocean-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, frame = 0;
  var particles = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (var i = 0; i < 50; i++) {
    particles.push({ x: Math.random()*2000, y: Math.random()*1200,
      vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3,
      r: Math.random()*1.6+.3, a: Math.random()*.45+.1 });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    for (var w = 0; w < 3; w++) {
      ctx.beginPath();
      var amp = 16+w*10, speed = .0007+w*.0003, yb = H*.5+w*55;
      for (var x = 0; x <= W; x += 4) {
        var y = yb + Math.sin(x*.011+frame*speed+w*2)*amp + Math.sin(x*.021+frame*speed*.7)*amp*.5;
        if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = 'rgba(0,'+(138+w*20)+',255,'+(0.038-w*.008)+')';
      ctx.lineWidth = 1.5; ctx.stroke();
    }
    particles.forEach(function (p) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(0,184,255,'+p.a+')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── 7. CURSOR ─────────────────────────────────────────── */
function _initCursor() {
  var cur  = document.getElementById('cursor');
  var ring = document.getElementById('cursor-ring');
  if (!cur) return;
  var mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', function(e){ mx=e.clientX; my=e.clientY; cur.style.left=mx+'px'; cur.style.top=my+'px'; });
  (function loop(){ rx+=(mx-rx)*.12; ry+=(my-ry)*.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); })();
  document.addEventListener('click', function(e){
    var r=document.createElement('div'); r.className='cursor-ripple';
    r.style.left=e.clientX+'px'; r.style.top=e.clientY+'px';
    document.body.appendChild(r); setTimeout(function(){ r.remove(); },650);
  });
}

/* ── 8. REVEAL OBSERVER ────────────────────────────────── */
function _initReveal() {
  if (!window.IntersectionObserver) {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
}

/* ── 9. WINDOW MANAGEMENT ─────────────────────────────── */
var _zTop = 60;
var _winState = {};

var _WIN_LABELS = {
  'win-hero':       ['🌊','Oceanus'],
  'win-stats':      ['📊','Stats'],
  'win-leaderboard':['🏆','Pioneers'],
  'win-how':        ['⚙️','How It Works'],
  'win-whitepaper': ['📄','Whitepaper'],
  'win-partners':   ['🤝','Partners'],
  'win-buy-ocs':    ['💎','Buy $OCS']
};

function openWindow(id) {
  var win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'flex';
  win.style.flexDirection = 'column';
  if (!_winState[id]) {
    // First open: cascade position on desktop
    if (window.innerWidth > 768) {
      var n = Object.keys(_winState).length;
      win.style.left = (50 + n*26) + 'px';
      win.style.top  = (30 + n*20) + 'px';
    }
    _winState[id] = { min: false, max: false };
  }
  win.classList.add('win-opening');
  setTimeout(function(){ win.classList.remove('win-opening'); }, 300);
  _focusWin(id);
  _addTbBtn(id);
  // Trigger reveals inside this window
  win.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
}

function _focusWin(id) {
  document.querySelectorAll('.os-win').forEach(function(w){ w.classList.remove('focused'); });
  var win = document.getElementById(id);
  if (win) { win.style.zIndex = ++_zTop; win.classList.add('focused'); }
  document.querySelectorAll('.tb-wbtn').forEach(function(b){ b.classList.remove('active-win'); });
  var btn = document.getElementById('tb-'+id);
  if (btn) btn.classList.add('active-win');
}

function closeWin(id) {
  var win = document.getElementById(id);
  if (win) win.style.display = 'none';
  _removeTbBtn(id);
}

function minimizeWin(id) {
  var win = document.getElementById(id);
  if (!win) return;
  if (!_winState[id]) _winState[id] = {};
  if (_winState[id].min) {
    win.style.display = 'flex'; win.style.flexDirection = 'column';
    _winState[id].min = false; _focusWin(id);
  } else {
    win.style.display = 'none'; _winState[id].min = true;
    var btn = document.getElementById('tb-'+id);
    if (btn) btn.classList.remove('active-win');
  }
}

function maximizeWin(id) {
  var win = document.getElementById(id);
  if (!win) return;
  if (!_winState[id]) _winState[id] = {};
  var st = _winState[id];
  if (st.max) {
    win.style.left = st.pl||'50px'; win.style.top = st.pt||'30px';
    win.style.width = st.pw||''; win.style.height = st.ph||'';
    st.max = false;
  } else {
    st.pl=win.style.left; st.pt=win.style.top; st.pw=win.style.width; st.ph=win.style.height;
    win.style.left='0'; win.style.top='0';
    win.style.width='100%'; win.style.height='calc(100vh - 46px)';
    st.max = true;
  }
  _focusWin(id);
}

/* ── 10. TASKBAR BUTTONS ──────────────────────────────── */
function _addTbBtn(id) {
  if (document.getElementById('tb-'+id)) return;
  var bar = document.getElementById('tb-wins');
  if (!bar) return;
  var lbl = _WIN_LABELS[id] || ['🗗', id];
  var btn = document.createElement('div');
  btn.className = 'tb-wbtn'; btn.id = 'tb-'+id;
  btn.innerHTML = '<span class="tb-wbtn-ico">'+lbl[0]+'</span><span>'+lbl[1]+'</span>';
  btn.onclick = function(){ minimizeWin(id); };
  bar.appendChild(btn);
}
function _removeTbBtn(id) {
  var btn = document.getElementById('tb-'+id);
  if (btn) btn.remove();
  delete _winState[id];
}

/* ── 11. DRAG WINDOWS ─────────────────────────────────── */
var _drag = null, _dox = 0, _doy = 0;

function _initDrag() {
  document.querySelectorAll('.win-tb').forEach(function(tb){
    tb.addEventListener('mousedown', function(e){
      if (e.target.classList.contains('wbtn')) return;
      var win = tb.closest('.os-win'); if (!win) return;
      _drag = win; _dox = e.clientX - win.offsetLeft; _doy = e.clientY - win.offsetTop;
      _focusWin(win.id);
    });
    tb.addEventListener('touchstart', function(e){
      if (e.target.classList.contains('wbtn')) return;
      e.preventDefault();
      var t = e.touches[0]; var win = tb.closest('.os-win'); if (!win) return;
      _drag = win; _dox = t.clientX - win.offsetLeft; _doy = t.clientY - win.offsetTop;
      _focusWin(win.id);
    }, { passive: false });
  });
  document.addEventListener('mousemove', function(e){
    if (!_drag) return;
    _drag.style.left = Math.max(0, e.clientX - _dox) + 'px';
    _drag.style.top  = Math.max(0, Math.min(e.clientY - _doy, window.innerHeight-46-20)) + 'px';
  });
  document.addEventListener('mouseup', function(){ _drag = null; });
  document.addEventListener('touchmove', function(e){
    if (!_drag) return; e.preventDefault();
    var t = e.touches[0];
    _drag.style.left = Math.max(0, t.clientX - _dox) + 'px';
    _drag.style.top  = Math.max(0, t.clientY - _doy) + 'px';
  }, { passive: false });
  document.addEventListener('touchend', function(){ _drag = null; });
}

/* ── 12. START MENU ───────────────────────────────────── */
function toggleStartMenu() {
  var m = document.getElementById('start-menu');
  if (m) m.classList.toggle('open');
}
document.addEventListener('click', function(e){
  var m = document.getElementById('start-menu');
  var b = document.getElementById('start-btn');
  if (m && m.classList.contains('open') && !m.contains(e.target) && b && !b.contains(e.target))
    m.classList.remove('open');
});

/* ── 13. APPLY MODAL ──────────────────────────────────── */
function openModal() {
  var el = document.getElementById('modal-overlay');
  if (el) el.classList.add('open');
}
function closeModal() {
  var el = document.getElementById('modal-overlay');
  if (el) el.classList.remove('open');
}
function submitModal() {
  var emailEl  = document.getElementById('modal-email');
  var walletEl = document.getElementById('modal-wallet');
  var email    = emailEl ? emailEl.value : '';
  if (!email || email.indexOf('@') < 0) { alert('Please enter a valid email address.'); return; }
  var content = document.getElementById('modal-content');
  if (content) {
    content.innerHTML = '<div style="font-family:\'Orbitron\',monospace;font-size:18px;letter-spacing:4px;color:var(--success);margin-bottom:12px;">✅ CONFIRMED</div>'
      +'<p style="font-size:13px;color:rgba(255,255,255,.5);line-height:1.8;">Application received! You\'ll be contacted when exclusive access opens.</p>';
  }
  setTimeout(closeModal, 3000);
}

/* ── 14. LIVE COUNTERS ────────────────────────────────── */
function _initLiveCounters() {
  var counters = [
    { id:'cnt1', v:7210 }, { id:'cnt2', v:2790 },
    { id:'cnt3', v:12480 }, { id:'cnt4', v:3640 },
    { id:'soc-wallets', v:4217 }, { id:'soc-today', v:138 }
  ];
  setInterval(function(){
    counters.forEach(function(c){
      var el = document.getElementById(c.id); if (!el) return;
      var cur = parseInt(el.textContent.replace(/,/g,'')) || c.v;
      var delta = Math.random() < .5 ? 1 : 0;
      if (c.id === 'cnt2') delta = -delta;
      el.textContent = (cur + delta).toLocaleString();
    });
  }, 4500);
}

/* ── 15. PRESALE BAR ANIMATION ────────────────────────── */
function _animPresaleBar() {
  var fill = document.getElementById('ocs-progress-fill');
  var lbl  = document.getElementById('ocs-presale-pct-label');
  var stat = document.getElementById('ocs-sb-stage');
  if (!fill) return;
  var p = 0, target = 86;
  var iv = setInterval(function(){
    p = Math.min(p + 2, target);
    fill.style.width = p + '%';
    if (lbl) lbl.textContent = p + '% FILLED';
    if (p >= target) clearInterval(iv);
  }, 25);
}

/* ── 16. ACTIVITY FEED ────────────────────────────────── */
var _WALLETS = ['0x3f…a12','0x7b…c44','0xe1…f88','0x2a…d19','0x9c…b77','0x5d…e33','0x8f…012','0x1e…ca5'];
var _AMOUNTS = ['$100','$300','$600','$1,000','$250','$500','$150','$750'];

function _initActivityFeed() {
  var list = document.getElementById('ocs-activity-list');
  if (!list) return;
  for (var i=0; i<4; i++) _addActRow(list, true);
  setInterval(function(){ _addActRow(list, false); }, 5500);
}
function _addActRow(list, silent) {
  var w = _WALLETS[Math.floor(Math.random()*_WALLETS.length)];
  var a = _AMOUNTS[Math.floor(Math.random()*_AMOUNTS.length)];
  var t = Math.floor(Math.random()*12)+1;
  var row = document.createElement('div');
  row.className = 'ocs-act-row';
  if (silent) row.style.animation = 'none';
  row.innerHTML = '<span class="ocs-act-addr">'+w+'</span>'
    +'<span class="ocs-act-msg">purchased $OCS</span>'
    +'<span class="ocs-act-amt">'+a+'</span>'
    +'<span class="ocs-act-time">'+t+'m ago</span>';
  list.insertBefore(row, list.firstChild);
  while (list.children.length > 8) list.removeChild(list.lastChild);
}

/* ── 17. LEADERBOARD ──────────────────────────────────── */
function _initLeaderboard() {
  var list = document.getElementById('lb-list');
  if (!list) return;
  var names  = ['0x3f…a12','0x9c…b77','0x7b…c44','0xe1…f88','0x5d…e33','0x2a…d19','0x8f…012','0x1e…ca5','0x4d…f56','0x6a…91b'];
  var scores = [9840,8720,7650,6920,6110,5480,4930,4210,3870,3250];
  var medals = ['🥇','🥈','🥉'];
  list.innerHTML = names.map(function(n,i){
    var rank = i < 3 ? medals[i] : '#'+(i+1);
    var rankColor = i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'rgba(255,255,255,.3)';
    return '<div class="lb-row">'
      +'<span class="lb-rank'+(i<3?' t3':'')+'" style="color:'+rankColor+'">'+rank+'</span>'
      +'<div class="lb-av">'+(i+1)+'</div>'
      +'<span class="lb-name">'+n+'</span>'
      +'<span class="lb-pts">'+scores[i].toLocaleString()+' pts</span>'
      +'</div>';
  }).join('');
}

/* ── 18. BUY $OCS MODAL ───────────────────────────────── */
var OCS_PRICE = 0.0085;
var ETH_USD   = 3280;
var _selAmt   = 0;

function _initOcsBuyEstimates() {
  [100,300,600,1000].forEach(function(amt){
    var el = document.getElementById('ocs-est-'+amt);
    if (el) el.textContent = Math.floor(amt/OCS_PRICE).toLocaleString()+' OCS';
  });
}

function openOcsBuyModal() {
  var m = document.getElementById('ocs-buy-modal');
  if (m) m.classList.add('open');
}
function closeOcsBuyModal() {
  var m = document.getElementById('ocs-buy-modal');
  if (m) m.classList.remove('open');
  goBackStep();
}

function selectAmt(amt, el) {
  _selAmt = amt;
  document.querySelectorAll('.ocs-amt-btn').forEach(function(b){ b.classList.remove('selected'); });
  el.classList.add('selected');
  var ci = document.getElementById('ocs-custom-amt'); if(ci) ci.value='';
  _updateCalc(amt);
}
function onCustomAmt(val) {
  _selAmt = parseFloat(val)||0;
  document.querySelectorAll('.ocs-amt-btn').forEach(function(b){ b.classList.remove('selected'); });
  _updateCalc(_selAmt);
}
function _updateCalc(usd) {
  var ocs = usd > 0 ? Math.floor(usd/OCS_PRICE) : 0;
  var co = document.getElementById('ocs-calc-ocs'); if(co) co.textContent = ocs>0?ocs.toLocaleString()+' OCS':'0 OCS';
  var cu = document.getElementById('ocs-calc-usd'); if(cu) cu.textContent = usd>0?usd.toFixed(2):'0.00';
  var btn = document.getElementById('ocs-step1-next'); if(btn) btn.disabled = (usd < 10);
}
function goDirectStep() {
  if (_selAmt < 10) return;
  var eth = (_selAmt/ETH_USD).toFixed(5);
  var ocs = Math.floor(_selAmt/OCS_PRICE);
  var su=document.getElementById('ocs-send-usd'); if(su) su.textContent='$'+_selAmt.toLocaleString();
  var se=document.getElementById('ocs-send-eth'); if(se) se.textContent='≈ '+eth+' ETH';
  var ro=document.getElementById('ocs-recv-ocs'); if(ro) ro.textContent=ocs.toLocaleString()+' OCS';
  // Switch steps
  var s1=document.getElementById('ocs-step-1'); if(s1) s1.style.display='none';
  var s2=document.getElementById('ocs-step-2'); if(s2) s2.style.display='block';
  var d1=document.getElementById('step-dot-1'); if(d1){d1.classList.remove('active');d1.style.background='var(--success)';}
  var d2=document.getElementById('step-dot-2'); if(d2) d2.classList.add('active');
  var l1=document.getElementById('step-line-1'); if(l1) l1.classList.add('done');
  var mt=document.getElementById('ocs-modal-title'); if(mt) mt.textContent='BUY $OCS — SEND ETH';
  _drawQR();
}
function goBackStep() {
  var s1=document.getElementById('ocs-step-1'); if(s1) s1.style.display='block';
  var s2=document.getElementById('ocs-step-2'); if(s2) s2.style.display='none';
  var d1=document.getElementById('step-dot-1'); if(d1){d1.classList.add('active');d1.style.background='';}
  var d2=document.getElementById('step-dot-2'); if(d2) d2.classList.remove('active');
  var l1=document.getElementById('step-line-1'); if(l1) l1.classList.remove('done');
  var mt=document.getElementById('ocs-modal-title'); if(mt) mt.textContent='BUY $OCS — SELECT AMOUNT';
}
function copyOcsAddr() {
  var addr = (document.getElementById('ocs-eth-addr')||{}).textContent||'';
  navigator.clipboard && navigator.clipboard.writeText(addr).then(function(){
    var btn=document.getElementById('ocs-copy-addr-btn');
    if(btn){btn.textContent='✅ COPIED!';btn.classList.add('copied');setTimeout(function(){btn.textContent='📋 COPY ADDRESS';btn.classList.remove('copied');},2000);}
  });
}
function _drawQR() {
  var canvas = document.getElementById('ocs-qr-canvas'); if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var size=160, cell=8, cols=size/cell;
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,size,size);
  for(var r=0;r<cols;r++) for(var c=0;c<cols;c++){
    var inFinder=(r<7&&c<7)||(r<7&&c>=cols-7)||(r>=cols-7&&c<7);
    var v=Math.sin(r*cols+c+42)*10000, on=(v-Math.floor(v))>.5;
    if(on||inFinder){ ctx.fillStyle=inFinder?'#00B8FF':'#222'; ctx.fillRect(c*cell+1,r*cell+1,cell-2,cell-2); }
  }
}

/* ── Close overlays on bg click ─────────────────────── */
document.addEventListener('click', function(e){
  var mo = document.getElementById('modal-overlay');
  if (mo && e.target===mo) closeModal();
  var om = document.getElementById('ocs-buy-modal');
  if (om && e.target===om) closeOcsBuyModal();
});
