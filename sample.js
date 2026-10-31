/* KuArte sample: "coming soon" for anything outside the 3 pages, design filters, map list. */
(function () {
  'use strict';

  function toast(msg) {
    var old = document.querySelector('.ktoast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'ktoast';
    t.setAttribute('role', 'status');
    t.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span></span>';
    t.querySelector('span').textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('in'); }); });
    var timer = setTimeout(hide, 3000);
    function hide() { t.classList.remove('in'); t.classList.add('out'); setTimeout(function () { t.remove(); }, 180); }
    t.addEventListener('pointerenter', function () { clearTimeout(timer); });
    t.addEventListener('pointerleave', function () { timer = setTimeout(hide, 1200); });
    t.addEventListener('click', hide);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-soon]');
    if (!el) return;
    e.preventDefault();
    toast((el.getAttribute('data-soon') || 'This') + ' is coming soon.');
  });

  var params = new URLSearchParams(location.search);

  /* ---------- designs: filter by style ---------- */
  var chips = document.querySelectorAll('[data-f]');
  if (chips.length) {
    var tiles = document.querySelectorAll('.tile');
    var empty = document.getElementById('empty');
    var pick = function (f) {
      var n = 0;
      chips.forEach(function (c) { var on = c.getAttribute('data-f') === f; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      tiles.forEach(function (t) { var show = f === 'All' || t.getAttribute('data-tag').split(',').indexOf(f) >= 0; t.hidden = !show; if (show) n++; });
      if (empty) empty.hidden = n > 0;
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { pick(c.getAttribute('data-f')); }); });
    var start = params.get('f');
    pick(start && document.querySelector('[data-f="' + start.replace(/"/g, '') + '"]') ? start : 'All');
    document.querySelectorAll('.fav').forEach(function (b) {
      b.addEventListener('click', function () { var on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); toast(on ? 'Saved to your favourites' : 'Removed from favourites'); });
    });
  }

  /* ---------- map: list, pins and sorting share one selection ---------- */
  var list = document.getElementById('list');
  if (list) {
    var q = params.get('q');
    var input = document.querySelector('.mtop input');
    if (q && input) input.value = q;
    var STAR = '<svg class="i xs f" viewBox="0 0 24 24" style="color: #C49A45" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
    var TECHS = [
      { id: 'viper', name: 'Viper Cullen Nail Studio', short: 'Viper', price: 350, rating: 4.9, count: 38, km: 1.2, area: 'Gredu', modes: 'Walk-in · Home service', next: 'Today, 2:30 PM', today: true, badge: 'Top Rated', bcls: 'gold', img: 'n5-autumn-florals.svg', x: 24, y: 30 },
      { id: 'killjoy', name: 'Killjoy Nails', short: 'Killjoy', price: 300, rating: 4.8, count: 21, km: 2.4, area: 'New Visayas', modes: 'Home service only', next: 'Tomorrow, 10:00 AM', today: false, badge: 'Reliable', bcls: '', img: 'n6-emerald-cateye.svg', x: 62, y: 13 },
      { id: 'sage', name: 'Sage Nail Bar', short: 'Sage', price: 450, rating: 4.6, count: 12, km: 2.9, area: 'San Francisco', modes: 'Walk-in', next: 'Today, 6:00 PM', today: true, badge: 'Verified Work', bcls: '', img: 'n7-noir-gold.svg', x: 82, y: 42 },
      { id: 'reyna', name: 'Reyna Nail Studio', short: 'Reyna', price: 280, rating: 4.7, count: 16, km: 3.1, area: 'Sto. Niño', modes: 'Walk-in', next: 'Today, 5:00 PM', today: true, badge: 'Verified Work', bcls: '', img: 'n3-classic-french.svg', x: 70, y: 68 },
      { id: 'lumi', name: 'Lumi Nails by Kat', short: 'Lumi', price: 320, rating: 5.0, count: 4, km: 3.8, area: 'Cagangohan', modes: 'Walk-in · Home service', next: 'Sat, 9:00 AM', today: false, badge: 'New on KuArte', bcls: 'new', img: 'n8-pastel-mix.svg', x: 20, y: 74 }
    ];
    var SORTS = {
      near: { label: 'distance', fn: function (a, b) { return a.km - b.km; } },
      top: { label: 'rating', fn: function (a, b) { return b.rating - a.rating || b.count - a.count; } },
      low: { label: 'price', fn: function (a, b) { return a.price - b.price; } }
    };
    var st = { sort: 'near', today: false, sel: 'viper' };
    var pins = document.getElementById('pins');
    var count = document.getElementById('count');

    function render() {
      var rows = TECHS.filter(function (t) { return !st.today || t.today; }).sort(SORTS[st.sort].fn);
      if (rows.length && !rows.some(function (t) { return t.id === st.sel; })) st.sel = rows[0].id;
      count.innerHTML = '<b class="strong">' + rows.length + ' verified techs</b> within 5 km · sorted by ' + SORTS[st.sort].label;
      list.innerHTML = rows.map(function (t) {
        return '<article class="card lc' + (t.id === st.sel ? ' on' : '') + '" data-id="' + t.id + '" tabindex="0" aria-label="' + t.name + '">' +
          '<div class="ph"><img src="assets/' + t.img + '" alt=""><span class="ver"><svg class="i xs" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>Verified</span></div>' +
          '<div class="tb"><div class="row between" style="align-items: flex-start"><span class="ttl">' + t.name + '</span><span class="sm only-l" style="white-space: nowrap">from <b class="price">₱' + t.price + '</b></span></div>' +
          '<span class="row cap" style="gap: 4px">' + STAR + '<b class="strong">' + t.rating.toFixed(1) + '</b> (' + t.count + ') · ' + t.km + ' km · ' + t.area + '</span>' +
          '<span class="cap">Next open: <b class="strong"' + (t.today ? ' style="color: #2F7A4E"' : '') + '>' + t.next + '</b></span>' +
          '<span class="sm only-s">from <b class="price">₱' + t.price + '</b></span>' +
          '<div class="row go" style="gap: 10px"><span class="badge ' + t.bcls + '">' + t.badge + '</span><a class="lnk" href="#" data-soon="Tech profiles">View profile</a></div></div></article>';
      }).join('');
      pins.innerHTML = rows.map(function (t) {
        var on = t.id === st.sel;
        return '<button class="pin' + (on ? ' on' : '') + '" data-id="' + t.id + '" style="left: ' + t.x + '%; top: ' + t.y + '%" aria-label="' + t.name + ', from ₱' + t.price + '" aria-pressed="' + on + '">' + (on ? STAR.replace('style="color: #C49A45" ', '') : '') + '₱' + t.price + (on ? ' · ' + t.short : '') + '</button>';
      }).join('');
      if (!rows.length) list.innerHTML = '<div class="card empty"><p class="ttl">No techs open today nearby</p><p class="sm">Turn off "Open today" to see everyone.</p></div>';
    }
    function select(id, from) {
      st.sel = id; render();
      var target = from === 'pin' ? list.querySelector('[data-id="' + id + '"]') : null;
      if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    }
    pins.addEventListener('click', function (e) { var b = e.target.closest('.pin'); if (b) select(b.getAttribute('data-id'), 'pin'); });
    list.addEventListener('click', function (e) { if (e.target.closest('[data-soon]')) return; var c = e.target.closest('.lc'); if (c) select(c.getAttribute('data-id'), 'list'); });
    list.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('lc')) { e.preventDefault(); select(e.target.getAttribute('data-id'), 'list'); } });
    document.querySelectorAll('[data-sort]').forEach(function (c) {
      c.addEventListener('click', function () {
        st.sort = c.getAttribute('data-sort');
        document.querySelectorAll('[data-sort]').forEach(function (o) { var on = o === c; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        render();
      });
    });
    var td = document.querySelector('[data-today]');
    if (td) td.addEventListener('click', function () { st.today = !st.today; td.classList.toggle('on', st.today); td.setAttribute('aria-pressed', st.today ? 'true' : 'false'); render(); });
    render();
  }
})();
