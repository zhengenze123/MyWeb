/* ===========================================================
   荒野乱斗 · 英雄图鉴 —— 交互脚本
   只做三件事：移动端导航、英雄筛选、滚动出现动画
   =========================================================== */
(function () {
  'use strict';

  /* ---------- 1. 移动端导航 ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    var label = toggle.querySelector('.sr-only');

    var setLabel = function (text) {
      if (label) label.textContent = text;
    };

    var closeNav = function () {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      setLabel('打开导航菜单');
    };

    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      setLabel(open ? '关闭导航菜单' : '打开导航菜单');
    });

    // 点击导航里的链接后自动收起
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    // Esc 关闭
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
        closeNav();
        toggle.focus();
      }
    });

    // 点击页头外部关闭
    document.addEventListener('click', function (event) {
      if (!document.body.classList.contains('nav-open')) return;
      if (!event.target.closest('.site-header')) closeNav();
    });

    // 视口变宽后重置状态，避免桌面端残留遮罩状态
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------- 2. 英雄筛选 + 搜索 ---------- */
  var grid = document.querySelector('[data-brawler-grid]');

  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.brawler'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var input = document.querySelector('[data-search]');
    var countEl = document.querySelector('[data-count]');
    var emptyEl = document.querySelector('[data-empty]');
    var total = cards.length;
    var state = { role: 'all', q: '' };

    var render = function () {
      var shown = 0;
      var q = state.q.trim().toLowerCase();

      cards.forEach(function (card) {
        var roleOk = state.role === 'all' || card.getAttribute('data-role') === state.role;
        var text = card.getAttribute('data-search') || '';
        var textOk = !q || text.indexOf(q) !== -1;
        var visible = roleOk && textOk;

        card.hidden = !visible;
        if (visible) shown += 1;
      });

      if (countEl) {
        countEl.textContent = String(shown);
      }
      if (emptyEl) {
        emptyEl.style.display = shown === 0 ? 'block' : 'none';
      }
      grid.setAttribute('aria-busy', 'false');
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.role = chip.getAttribute('data-filter');
        chips.forEach(function (other) {
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        render();
      });
    });

    if (input) {
      input.addEventListener('input', function () {
        state.q = input.value;
        render();
      });
      input.addEventListener('search', function () {
        state.q = input.value;
        render();
      });
      // 回车不提交表单，只是收起输入法
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') event.preventDefault();
      });
    }

    // 支持从主页带 ?role=xxx 直接跳到某个分类
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get('role');
    if (wanted) {
      var match = chips.filter(function (chip) {
        return chip.getAttribute('data-filter') === wanted;
      })[0];
      if (match) {
        state.role = wanted;
        chips.forEach(function (other) {
          other.setAttribute('aria-pressed', other === match ? 'true' : 'false');
        });
      }
    }

    if (params.get('q')) {
      state.q = params.get('q');
      if (input) input.value = state.q;
    }

    render();
    if (countEl && total) countEl.setAttribute('data-total', String(total));
  }

  /* ---------- 3. 滚动出现动画 ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reveals.length) {
    /* 没有需要动画的元素 */
  } else if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) {
      el.classList.add('in');
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    reveals.forEach(function (el) {
      // 首屏内的元素立即显示，避免等待回调造成闪烁或空白
      var box = el.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.92) {
        el.classList.add('in');
      } else {
        io.observe(el);
      }
    });
  }

  /* ---------- 4. 页脚年份 ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
