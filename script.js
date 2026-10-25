/* ============================================================
   Footer year (detail pages)
   ============================================================ */
(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

/* ============================================================
   Contact — the email never appears in the HTML source (base64,
   decoded at runtime), so harvester bots that read raw HTML can't
   scrape it. Clicking any contact element copies it to the clipboard.
   ============================================================ */
(function () {
  var email = atob('YWxlZW5hLnlheGkueGlhb0BnbWFpbC5jb20=');

  document.querySelectorAll('.js-emailshow').forEach(function (el) {
    el.textContent = email;
  });

  document.querySelectorAll('.js-contact, .js-emailshow').forEach(function (el) {
    el.setAttribute('title', 'Click to copy my email');
    el.addEventListener('click', function (ev) {
      ev.preventDefault();
      var original = el.textContent;
      var flash = function (msg) {
        el.textContent = msg;
        setTimeout(function () { el.textContent = original; }, 1600);
      };
      var reveal = function () { el.textContent = email; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () { flash('Copied ✓'); }, reveal);
      } else {
        reveal();
      }
    });
  });
})();

/* ============================================================
   Sidebar nav — highlight the section currently in view
   ============================================================ */
(function () {
  var links = document.querySelectorAll('.side-nav a');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (a) { a.classList.remove('on'); });
        var a = map[e.target.id];
        if (a) a.classList.add('on');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  Object.keys(map).forEach(function (id) {
    var s = document.getElementById(id);
    if (s) obs.observe(s);
  });
})();

/* ============================================================
   Binary footer — a field of 0s and 1s with a wave oscillating
   through it: the bits bob vertically and a band of brightness
   sweeps across. The cursor adds a local spotlight, and a few
   bits turn red on the crest.
   ============================================================ */
(function () {
  var cvs = document.getElementById('bits');
  if (!cvs) return;
  var ctx = cvs.getContext('2d');
  var foot = cvs.parentElement;
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  var CELL = 16, cols = 0, rows = 0, grid = [], W = 0, H = 0;
  var mx = -9999, my = -9999;

  function build() {
    W = foot.clientWidth; H = foot.clientHeight;
    cvs.width = W * DPR; cvs.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    cols = Math.ceil(W / CELL) + 1; rows = Math.ceil(H / CELL) + 1;
    grid = [];
    for (var y = 0; y < rows; y++) {
      var r = [];
      for (var x = 0; x < cols; x++) r.push({ v: Math.random() < 0.5 ? 0 : 1, p: Math.random() });
      grid.push(r);
    }
  }
  window.addEventListener('resize', build);
  foot.addEventListener('pointermove', function (e) {
    var b = foot.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top;
  });
  foot.addEventListener('pointerleave', function () { mx = -9999; my = -9999; });
  build();

  var R = 95, t = 0;
  function frame() {
    t += 0.016;
    ctx.clearRect(0, 0, W, H);
    ctx.font = '12px ui-monospace, "SF Mono", Menlo, monospace';
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var c = grid[y][x];
        var cx = x * CELL + CELL / 2;
        // a wave travels across: bits bob vertically, and a band of brightness sweeps through
        var bob = Math.sin(x * 0.45 + y * 0.18 - t * 2.2) * 5;
        var cy = y * CELL + CELL / 2 + bob;
        var wave = (Math.sin(x * 0.28 - t * 1.7) + 1) / 2;
        var dx = cx - mx, dy = cy - my, d = Math.sqrt(dx * dx + dy * dy);
        var near = Math.max(0, 1 - d / R);
        c.p += 0.016 * (near > 0 ? (0.4 + near * 6) : 0.03);
        if (c.p >= 1) { c.p = 0; if (Math.random() < (near > 0 ? 0.6 : 0.04)) c.v ^= 1; }
        var alpha = Math.min(1, 0.05 + wave * 0.30 + near * 0.72);
        if ((near > 0.72 && (x + y) % 7 === 0) || (wave > 0.9 && x % 9 === 0)) {
          ctx.fillStyle = 'rgba(217,45,30,' + alpha + ')';
        } else {
          ctx.fillStyle = 'rgba(40,40,46,' + alpha + ')';
        }
        ctx.fillText(c.v ? '1' : '0', cx, cy);
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ============================================================
   Symbol IC — a rotating QFN chip built from ECE schematic
   symbols. Auto-rotates like a turntable; on hover it bursts
   apart into a red cloud of symbols, then reassembles.
   ============================================================ */
(function () {
  var cvs = document.getElementById('ic');
  var wrap = document.getElementById('icWrap');
  if (!cvs || !wrap) return;
  var ctx = cvs.getContext('2d');
  var SIZE = 264, CX = SIZE / 2, CY = SIZE / 2;
  var FOCAL = 320, CAMX = -0.72;                 // look-down tilt
  var sinX = Math.sin(CAMX), cosX = Math.cos(CAMX);
  var INK = [40, 40, 46], RED = [217, 45, 30];

  // ---- symbol drawers (centered at 0,0, half-size r) ----
  var SYM = [
    function res(c, r) { // resistor zigzag
      c.beginPath(); var n = 6, w = r * 1.8, x = -w / 2, step = w / n;
      c.moveTo(-r, 0); c.lineTo(x, 0);
      for (var i = 0; i < n; i++) { x += step; c.lineTo(x, (i % 2 ? -1 : 1) * r * 0.55); }
      c.lineTo(r, 0); c.stroke();
    },
    function cap(c, r) { // capacitor
      c.beginPath(); c.moveTo(-r, 0); c.lineTo(-r * 0.3, 0); c.moveTo(r * 0.3, 0); c.lineTo(r, 0); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.3, -r * 0.8); c.lineTo(-r * 0.3, r * 0.8);
      c.moveTo(r * 0.3, -r * 0.8); c.lineTo(r * 0.3, r * 0.8); c.stroke();
    },
    function gnd(c, r) { // ground
      c.beginPath(); c.moveTo(0, -r); c.lineTo(0, 0); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.9, 0); c.lineTo(r * 0.9, 0);
      c.moveTo(-r * 0.55, r * 0.45); c.lineTo(r * 0.55, r * 0.45);
      c.moveTo(-r * 0.22, r * 0.9); c.lineTo(r * 0.22, r * 0.9); c.stroke();
    },
    function diode(c, r) { // diode
      c.beginPath(); c.moveTo(-r, 0); c.lineTo(-r * 0.5, 0); c.moveTo(r * 0.5, 0); c.lineTo(r, 0); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.5, -r * 0.7); c.lineTo(-r * 0.5, r * 0.7); c.lineTo(r * 0.5, 0); c.closePath(); c.stroke();
      c.beginPath(); c.moveTo(r * 0.5, -r * 0.7); c.lineTo(r * 0.5, r * 0.7); c.stroke();
    },
    function ind(c, r) { // inductor
      c.beginPath(); var k = 3, w = r * 1.8, x0 = -w / 2, rad = w / (2 * k);
      c.moveTo(-r, 0);
      for (var i = 0; i < k; i++) { c.arc(x0 + rad + i * 2 * rad, 0, rad, Math.PI, 0, false); }
      c.lineTo(r, 0); c.stroke();
    },
    function node(c, r) { // junction dot
      c.beginPath(); c.arc(0, 0, r * 0.5, 0, 7); c.fill();
    }
  ];

  // ---- build IC point cloud: square QFN body in XZ plane, pins on 4 sides ----
  var pts = [];
  function add(x, y, z, s, red) { pts.push({ bx: x, by: y, bz: z, sym: s, red: red || 0, sxr: 0, syr: 0, szr: 0 }); }

  var HALF = 46, N = 7;
  for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
    var gx = -HALF + (2 * HALF) * i / (N - 1), gz = -HALF + (2 * HALF) * j / (N - 1);
    add(gx, 7, gz, (i * 3 + j) % 5, 0);
  }
  for (var bi = 0; bi < 4; bi++) for (var bj = 0; bj < 4; bj++) add(-42 + 28 * bi, -7, -42 + 28 * bj, 5, 0);
  var PIN = [-36, -18, 0, 18, 36];
  for (var k = 0; k < PIN.length; k++) {
    add(58, 0, PIN[k], 0, 0); add(70, 0, PIN[k], 5, 0);
    add(-58, 0, PIN[k], 0, 0); add(-70, 0, PIN[k], 5, 0);
    add(PIN[k], 0, 58, 0, 0); add(PIN[k], 0, 70, 5, 0);
    add(PIN[k], 0, -58, 0, 0); add(PIN[k], 0, -70, 5, 0);
  }
  add(-40, 8, -40, 5, 1); // pin-1 marker (red)

  for (var m = 0; m < pts.length; m++) {
    var th = Math.random() * 6.2832, ph = Math.acos(2 * Math.random() - 1), rr = 74 + Math.random() * 58;
    pts[m].sxr = Math.sin(ph) * Math.cos(th) * rr;
    pts[m].syr = Math.cos(ph) * rr;
    pts[m].szr = Math.sin(ph) * Math.sin(th) * rr;
  }
  var CORN = [[-HALF, 7, -HALF], [HALF, 7, -HALF], [HALF, 7, HALF], [-HALF, 7, HALF]];

  var angle = 0, hover = 0, hoverT = 0, t = 0, sinA = 0, cosA = 1;
  wrap.addEventListener('pointerenter', function () { hoverT = 1; });
  wrap.addEventListener('pointerleave', function () { hoverT = 0; });

  function col(a, b, mm) {
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * mm) + ',' + Math.round(a[1] + (b[1] - a[1]) * mm) + ',' + Math.round(a[2] + (b[2] - a[2]) * mm) + ')';
  }
  function proj(x, y, z) {
    var x1 = x * cosA + z * sinA, z1 = -x * sinA + z * cosA, y1 = y;
    var y2 = y1 * cosX - z1 * sinX, z2 = y1 * sinX + z1 * cosX;
    var s = FOCAL / (FOCAL + z2);
    return { x: CX + x1 * s, y: CY - y2 * s, s: s, z: z2 };
  }

  function frame() {
    t += 0.016;
    hover += (hoverT - hover) * 0.09;
    var ease = hover < 0.5 ? 2 * hover * hover : 1 - Math.pow(-2 * hover + 2, 2) / 2;
    angle += 0.005 + hover * 0.03;
    sinA = Math.sin(angle); cosA = Math.cos(angle);
    ctx.clearRect(0, 0, SIZE, SIZE);

    var bodyA = 1 - ease;
    if (bodyA > 0.02) {
      ctx.beginPath();
      for (var ci = 0; ci < 4; ci++) { var pc = proj(CORN[ci][0], CORN[ci][1], CORN[ci][2]); ci ? ctx.lineTo(pc.x, pc.y) : ctx.moveTo(pc.x, pc.y); }
      ctx.closePath();
      ctx.fillStyle = 'rgba(28,28,32,' + (0.05 * bodyA) + ')';
      ctx.strokeStyle = 'rgba(28,28,32,' + (0.20 * bodyA) + ')';
      ctx.lineWidth = 1.3; ctx.fill(); ctx.stroke();
    }

    var order = [];
    for (var i2 = 0; i2 < pts.length; i2++) {
      var p = pts[i2];
      var jit = hover > 0.01 ? Math.sin(t * 3 + i2) * 3 * hover : 0;
      var lx = p.bx + (p.sxr - p.bx) * ease, ly = p.by + (p.syr - p.by) * ease + jit, lz = p.bz + (p.szr - p.bz) * ease;
      var pr = proj(lx, ly, lz); pr.sym = p.sym; pr.red = p.red; order.push(pr);
    }
    order.sort(function (a, b) { return a.z - b.z; });

    for (var jx = 0; jx < order.length; jx++) {
      var o = order[jx];
      var depth = Math.max(0, Math.min(1, (o.s - 0.78) / 0.42));
      var r = 5.2 * o.s;
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.globalAlpha = 0.4 + depth * 0.55;
      var mm = o.red ? Math.max(0.85, hover) : hover * 0.9;
      var c = col(INK, RED, mm);
      ctx.strokeStyle = c; ctx.fillStyle = c;
      ctx.lineWidth = Math.max(0.7, r * 0.16);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      SYM[o.sym](ctx, r);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();
