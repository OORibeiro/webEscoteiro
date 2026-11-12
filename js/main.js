/* 455º Grupo Escoteiro Fortaleza de Itaipu — interações da página */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Ano do rodapé ---------- */
  var ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Tema claro/escuro ---------- */
  var root = document.documentElement;
  var themeBtn = $('.theme-toggle');
  var themeMeta = $('meta[name="theme-color"]');
  function applyTheme(t, save) {
    root.setAttribute('data-theme', t);
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
      themeBtn.setAttribute('aria-label', t === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
    }
    if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#0F1311' : '#1A4524');
    if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
  }
  applyTheme(root.getAttribute('data-theme') || 'light', false);
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      root.classList.add('theme-anim');
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
      setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
    });
  }
  // acompanha o sistema enquanto a pessoa não escolheu manualmente
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light', false);
    });
  } catch (e) {}

  /* ---------- Cabeçalho: sombra ao rolar + botão "topo" ---------- */
  var header = $('.site-header');
  var toTop = $('.to-top');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = $('.nav-toggle');
  var nav = $('#menu');
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- Link ativo no menu (scroll spy) ---------- */
  var links = $$('.nav ul a').filter(function (a) { return a.getAttribute('href').charAt(0) === '#'; });
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
          var a = map[en.target.id];
          if (a) { a.classList.add('is-active'); a.setAttribute('aria-current', 'true'); }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Revelar ao rolar ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    // pequeno atraso escalonado entre irmãos (cards em grade)
    $$('.areas, .pillars, .branches, .bento, .faq, .stats, .contact-cards').forEach(function (group) {
      $$('.reveal', group).forEach(function (el, i) { el.style.setProperty('--d', (i * 0.07).toFixed(2) + 's'); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Carrossel de ramos (celular) ---------- */
  var branchList = $('#branches-list');
  var dotsWrap = $('.dots[data-dots-for="branches-list"]');
  var dotBtns = [];
  var isCarousel = function () { return branchList && branchList.scrollWidth > branchList.clientWidth + 4; };
  if (branchList && dotsWrap) {
    var cards = $$('.branch', branchList);
    cards.forEach(function (card) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot-btn';
      b.setAttribute('aria-label', 'Ver ' + $('h3', card).textContent);
      b.addEventListener('click', function () {
        card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      });
      dotsWrap.appendChild(b);
      dotBtns.push(b);
    });
    var ticking = false;
    var updateDots = function () {
      ticking = false;
      var rect = branchList.getBoundingClientRect();
      var center = rect.left + rect.width / 2, best = 0, bd = Infinity;
      cards.forEach(function (c, i) {
        var r = c.getBoundingClientRect();
        var d = Math.abs(r.left + r.width / 2 - center);
        if (d < bd) { bd = d; best = i; }
      });
      dotBtns.forEach(function (d, i) {
        d.classList.toggle('is-active', i === best);
        if (i === best) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    };
    branchList.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateDots); }
    }, { passive: true });
    window.addEventListener('resize', updateDots);
    updateDots();
  }

  /* ---------- Barra de ações fixa (celular) ---------- */
  var mobileCta = $('#mobile-cta');
  var ctaWatch = [$('#contato'), $('.site-footer')].filter(Boolean);
  if (mobileCta && ctaWatch.length && 'IntersectionObserver' in window) {
    var ctaSeen = new Set();
    var ctaIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? ctaSeen.add(e.target) : ctaSeen.delete(e.target); });
      mobileCta.classList.toggle('is-hidden', ctaSeen.size > 0);
    }, { threshold: 0.05 });
    ctaWatch.forEach(function (el) { ctaIo.observe(el); });
  }

  /* ---------- Buscador de ramo por idade ---------- */
  var input = $('#idade');
  var result = $('#finder-result');
  var branchesWrap = $('.branches');
  var branches = $$('.branch');
  var defaultMsg = 'Digite uma idade e a gente mostra o ramo ideal.';

  function clearMatch() {
    branches.forEach(function (b) { b.classList.remove('is-match'); });
    if (branchesWrap) branchesWrap.classList.remove('has-match');
  }

  function findBranch() {
    var raw = input.value.trim();
    clearMatch();
    if (raw === '') { result.textContent = defaultMsg; return; }
    var age = parseInt(raw, 10);
    if (isNaN(age) || age < 0) { result.textContent = 'Digite uma idade válida, em anos.'; return; }

    var found = branches.filter(function (b) {
      return age >= +b.dataset.min && age <= +b.dataset.max;
    })[0];

    if (found) {
      found.classList.add('is-match');
      branchesWrap.classList.add('has-match');
      if (isCarousel()) found.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      var name = $('h3', found).textContent;
      var range = found.dataset.min + ' a ' + found.dataset.max + ' anos';
      result.innerHTML = 'Aos <strong>' + age + '</strong> anos, o seu lugar é o <strong>' + name + '</strong> (' + range + '). ';
      var link = document.createElement('a');
      link.href = 'https://forms.gle/gKsQPSmbCHx3iXPt7';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Demonstrar interesse →';
      result.appendChild(link);
    } else if (age < 6) {
      result.textContent = 'Os ramos do grupo começam aos 6 anos. Volte quando chegar a hora, vamos adorar receber você!';
    } else {
      result.innerHTML = 'Os ramos vão até os 23 anos, mas <strong>adultos fazem muita diferença</strong> como voluntários. ';
      var a = document.createElement('a');
      a.href = '#participe';
      a.setAttribute('data-open-tab', 'adulto');
      a.textContent = 'Saiba como ajudar →';
      a.addEventListener('click', onOpenTabLink);
      result.appendChild(a);
    }
  }
  if (input && result) input.addEventListener('input', findBranch);

  /* ---------- Abas (jovem/adulto e ramos) ---------- */
  var tabRoots = $$('[data-tabs]');
  var allTabs = [];

  function selectTab(tab, focus) {
    var root = tab.closest('[data-tabs]');
    $$('[role="tab"]', root).forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    $$('[role="tabpanel"]', root).forEach(function (p) { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    if (focus) tab.focus();
  }
  function openTabByName(name) {
    var t = allTabs.filter(function (x) { return x.dataset.tab === name; })[0];
    if (t) { selectTab(t, false); return t; }
    return null;
  }
  function onOpenTabLink(e) {
    var name = e.currentTarget.getAttribute('data-open-tab');
    if (name) openTabByName(name);
  }

  tabRoots.forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    tabs.forEach(function (tab, i) {
      allTabs.push(tab);
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length, idx = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') idx = (i + 1) % n;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') idx = (i - 1 + n) % n;
        else if (k === 'Home') idx = 0;
        else if (k === 'End') idx = n - 1;
        if (idx !== null) { e.preventDefault(); selectTab(tabs[idx], true); }
      });
    });
  });
  $$('[data-open-tab]').forEach(function (a) { a.addEventListener('click', onOpenTabLink); });

  // Endereço com #adulto, #lobinho, #escoteiro... abre a aba certa e rola até a seção
  var hashTab = openTabByName(location.hash.slice(1));
  if (hashTab) {
    var sec = hashTab.closest('section');
    if (sec) setTimeout(function () { sec.scrollIntoView(); }, 60);
  }

  /* ---------- Perguntas frequentes (acordeão) ---------- */
  var accordion = $('[data-accordion]');
  if (accordion) {
    var qs = $$('.faq-q', accordion);
    qs.forEach(function (q) {
      var answer = document.getElementById(q.getAttribute('aria-controls'));
      // estado inicial fechado: esconde dos leitores de tela sem quebrar a animação
      function sync() {
        var open = q.getAttribute('aria-expanded') === 'true';
        answer.style.gridTemplateRows = open ? '1fr' : '0fr';
        answer.toggleAttribute('inert', !open);
      }
      sync();
      q.addEventListener('click', function () {
        var open = q.getAttribute('aria-expanded') === 'true';
        qs.forEach(function (other) {
          if (other !== q) {
            other.setAttribute('aria-expanded', 'false');
            var a = document.getElementById(other.getAttribute('aria-controls'));
            a.style.gridTemplateRows = '0fr';
            a.setAttribute('inert', '');
          }
        });
        q.setAttribute('aria-expanded', String(!open));
        sync();
      });
    });
  }
})();
