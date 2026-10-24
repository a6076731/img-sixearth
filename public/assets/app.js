(function () {
  'use strict';

  var wall = document.getElementById('wall');
  var emptyEl = document.getElementById('empty');
  var countEl = document.getElementById('count');
  var footEl = document.getElementById('foot');

  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbDate = document.getElementById('lbDate');
  var lbPos = document.getElementById('lbPos');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbClose = document.getElementById('lbClose');

  var photos = [];
  var current = 0;

  function prettyDate(p) {
    return p.date ? p.date.replace(/-/g, '.') : '';
  }

  function buildCard(p, i) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'shot';
    // 固定的微倾斜，避免每张都正正好好显得呆板；用索引算，不用随机，保证每次一样
    var tilt = (((i * 7) % 5) - 2) * 0.45;
    card.style.setProperty('--tilt', tilt.toFixed(2) + 'deg');
    card.setAttribute('aria-label', (prettyDate(p) || '未标注日期') + ' 的照片');

    var img = document.createElement('img');
    img.src = p.src;
    img.alt = p.title || '';
    img.width = p.w;          // 关键：写出真实宽高，浏览器才能按原比例预留位置
    img.height = p.h;
    img.loading = 'lazy';
    img.decoding = 'async';

    var cap = document.createElement('figcaption');
    var d = document.createElement('span');
    d.className = 'shot-date';
    d.textContent = prettyDate(p);
    var t = document.createElement('span');
    t.textContent = p.time || '';
    cap.appendChild(d);
    cap.appendChild(t);

    card.appendChild(img);
    card.appendChild(cap);
    card.addEventListener('click', function () { openAt(i); });
    return card;
  }

  function render(data) {
    photos = (data && data.photos) || [];
    if (!photos.length) {
      emptyEl.hidden = false;
      return;
    }

    countEl.textContent = photos.length + ' 张';

    var frag = document.createDocumentFragment();
    photos.forEach(function (p, i) { frag.appendChild(buildCard(p, i)); });
    wall.appendChild(frag);

    var unknown = photos.filter(function (p) { return !p.date; }).length;
    footEl.textContent = '共 ' + photos.length + ' 张照片' +
      (unknown ? ' · ' + unknown + ' 张未标日期' : '') +
      (data.generated ? ' · 整理于 ' + data.generated : '');
  }

  function openAt(i) {
    current = i;
    paint();
    if (typeof lb.showModal === 'function') lb.showModal();
  }

  function paint() {
    var p = photos[current];
    if (!p) return;
    lbImg.src = p.src;
    lbImg.alt = p.title || '';
    var when = prettyDate(p);
    lbDate.textContent = when ? when + (p.time ? ' · ' + p.time : '') : '';
    lbPos.textContent = (current + 1) + ' / ' + photos.length;
    lbPrev.disabled = current <= 0;
    lbNext.disabled = current >= photos.length - 1;
  }

  function move(delta) {
    var next = current + delta;
    if (next < 0 || next >= photos.length) return;
    current = next;
    paint();
  }

  lbPrev.addEventListener('click', function () { move(-1); });
  lbNext.addEventListener('click', function () { move(1); });
  lbClose.addEventListener('click', function () { lb.close(); });

  lb.addEventListener('click', function (e) {
    // 点空白处（不是图片本身、也不是按钮）则关闭
    if (e.target === lb) lb.close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lb.open) return;
    if (e.key === 'ArrowLeft') { move(-1); }
    else if (e.key === 'ArrowRight') { move(1); }
  });

  fetch('photos.json', { headers: { accept: 'application/json' } })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(render)
    .catch(function (err) {
      emptyEl.hidden = false;
      emptyEl.textContent = '照片清单加载失败：' + err.message;
    });
})();
