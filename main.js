  /* ============================================================
     PROJECT DATA
  ============================================================ */
  const projectData = [
    {
      title: 'WhyBrowser · 浏览器',
      thumb: 'Resources/App/WhyBrowser.png',
      tags: ['下载', '工具'],
      desc: 'WhyBrowser基于Electron架构实现，速度快，体积小，功能全。',
      detail: 'WhyBrowser 拥有和其它的浏览器大致相同的功能。日后我们会持续优化并推送更新。'
    },
    {
      title: 'Countdown · WhyAPP',
      thumb: 'Resources/App/Countdown.png',
      tags: ['下载', '工具'],
      desc: '倒计时工具，支持桌面小组件与事件提醒，让重要时刻不再错过。',
      detail: 'Countdown-WhyAPP支持桌面倒计时，北京时间大时钟等特色功能，日后我们会推出和优化更多功能。'
    },
    {
      title: '上课点名 · 在线点名工具',
      thumb: 'Resources/App/RollCall.png',
      tags: ['网站', '工具'],
      desc: '简洁高效的课堂随机点名工具，支持名单导入、点名历史记录与数据分析，老师上课的好帮手。',
      detail: '界面美观，功能强大，完全免费。'
    }
  ];

  /* ============================================================
     NAVIGATION — Scroll Effect & Active State
  ============================================================ */
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === current) {
        link.classList.add('active');
      }
    });

    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
      if (scrollY > 600) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ============================================================
     MOBILE MENU
  ============================================================ */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ============================================================
     SMOOTH SCROLL
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     SCROLL TO TOP
  ============================================================ */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     SCROLL REVEAL (Intersection Observer)
  ============================================================ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ============================================================
     PROJECT FILTER
  ============================================================ */
  const filterBtns = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('.project-card');
  const projectsGrid = document.getElementById('projectsGrid');
  const filterTargets = projectsGrid
    ? projectsGrid.querySelectorAll('.project-card, .projects-downloads-inline')
    : projectCards;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      filterTargets.forEach((card, i) => {
        const categories = card.dataset.category || '';
        const show = filter === 'all' || categories.includes(filter);

        if (show) {
          card.style.display = '';
          card.style.animation = 'fadeSlideUp 0.5s ease ' + (i * 0.08) + 's both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ============================================================
     PROJECT MODAL
  ============================================================ */
  const modal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalThumb = document.getElementById('modalThumb');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalDetailText = document.getElementById('modalDetailText');
  const modalTags = document.getElementById('modalTags');

  function openModal(index) {
    const p = projectData[index];
    if (!p) return;

    if (modalThumb) modalThumb.src = p.thumb;
    if (modalThumb) modalThumb.alt = p.title;
    if (modalTitle) modalTitle.textContent = p.title;
    if (modalDesc) modalDesc.textContent = p.desc;
    if (modalDetailText) modalDetailText.textContent = p.detail;
    if (modalTags) modalTags.innerHTML = p.tags.map(t => '<span class="project-tag">' + t + '</span>').join('');

    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  projectCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // 点名工具直接跳转到外部链接
      if (card.dataset.project === '3') {
        window.open('RollCallSystem/index.html', '_blank');
        return;
      }
      openModal(parseInt(card.dataset.project));
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ============================================================
     CONTACT FORM
  ============================================================ */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !message) {
        [[contactForm.name, name], [contactForm.email, email], [contactForm.message, message]]
          .filter(function(item) { return !item[1]; })
          .forEach(function(item) {
            item[0].style.animation = 'none';
            item[0].offsetHeight;
            item[0].style.animation = 'shake 0.4s ease';
          });
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        contactForm.email.style.animation = 'none';
        contactForm.email.offsetHeight;
        contactForm.email.style.animation = 'shake 0.4s ease';
        return;
      }

      const submitBtn = contactForm.querySelector('.form-submit');
      if (submitBtn) {
        submitBtn.textContent = '发送中…';
        submitBtn.disabled = true;
      }

      setTimeout(function() {
        if (formSuccess) {
          contactForm.style.display = 'none';
          formSuccess.style.display = 'block';
          formSuccess.style.animation = 'fadeSlideUp 0.5s ease';
        }
      }, 1200);
    });
  }

  /* ============================================================
     SHAKE ANIMATION (for validation)
  ============================================================ */
  var styleSheet = document.createElement('style');
  styleSheet.textContent = [
    '@keyframes shake {',
    '  0%, 100% { transform: translateX(0); }',
    '  20% { transform: translateX(-8px); }',
    '  40% { transform: translateX(8px); }',
    '  60% { transform: translateX(-6px); }',
    '  80% { transform: translateX(6px); }',
    '}'
  ].join('\n');
  document.head.appendChild(styleSheet);

  /* ============================================================
     TYPEWRITER in hero (subtle)
  ============================================================ */
  var typewriterPhrases = [
    'Why自有Why的骄傲。',
    '来自荣怀，一起创造不凡。',
    '共创精神，打破边界。'
  ];
  var phraseIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typeSpeed = 80;

  function typeWriter() {
    var heroSub = document.querySelector('.hero-subtitle');
    if (!heroSub) return;

    var current = typewriterPhrases[phraseIndex];

    if (isDeleting) {
      heroSub.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      heroSub.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 90;
    }

    if (!isDeleting && charIndex === current.length) {
      typeSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
      typeSpeed = 400;
    }

    setTimeout(typeWriter, typeSpeed);
  }

  setTimeout(typeWriter, 2800);

  /* ============================================================
     PARALLAX on hero blobs (desktop only)
  ============================================================ */
  if (window.matchMedia('(min-width: 769px)').matches) {
    var blobs = document.querySelectorAll('.blob');

    window.addEventListener('mousemove', function(e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;

      blobs.forEach(function(blob, i) {
        var factor = (i + 1) * 12;
        blob.style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
      });
    }, { passive: true });
  }
  /* ============================================================
     Electron 安装包 — OSS latest.yml（electron-builder 输出）
     WhyBrowser：桶根目录；Countdown WhyAPP：release/ 前缀（与 OSS 实际路径一致）
  ============================================================ */
  (function initElectronOssDownloads() {
    function objectUrl(base, key) {
      var b = base.replace(/\/$/, '');
      var parts = String(key || '').split('/').filter(Boolean);
      if (!parts.length) return b;
      return b + '/' + parts.map(encodeURIComponent).join('/');
    }

    function parseLatestYml(text) {
      var vm = text.match(/^version:\s*([\d.]+)\s*$/m);
      var pm = text.match(/^path:\s*(.+)\s*$/m);
      var p = pm ? pm[1].trim() : '';
      if ((p.charAt(0) === '"' && p.charAt(p.length - 1) === '"') ||
          (p.charAt(0) === "'" && p.charAt(p.length - 1) === "'")) {
        p = p.slice(1, -1);
      }
      return { version: vm ? vm[1] : '', path: p };
    }

    var HINT_BASE = '支持Windows 10/11操作系统 · ';

    function bindOssDownload(cfg) {
      var ossBase = cfg.ossBase;
      var latestYml = cfg.latestYml;
      var fallbackVersion = cfg.fallbackVersion;
      var fallbackPath = cfg.fallbackPath;
      var link = document.getElementById(cfg.linkId);
      var hint = cfg.hintId ? document.getElementById(cfg.hintId) : null;
      if (!link) return;

      function apply(meta) {
        var url = objectUrl(ossBase, meta.path || fallbackPath);
        link.href = url;
        link.dataset.href = url;
        if (hint) {
          hint.textContent = meta.version
            ? HINT_BASE + '最新版本 v' + meta.version
            : HINT_BASE + '最新版本';
        }
      }

      apply({ version: fallbackVersion, path: fallbackPath });

      if (window.location.protocol === 'file:') return;

      fetch(latestYml, { cache: 'no-store', credentials: 'omit' })
        .then(function (r) {
          if (!r.ok) throw new Error('latest.yml ' + r.status);
          return r.text();
        })
        .then(function (text) {
          var meta = parseLatestYml(text);
          if (!meta.path) throw new Error('no path');
          apply(meta);
        })
        .catch(function () {
          apply({ version: fallbackVersion, path: fallbackPath });
          if (hint) {
            hint.textContent =
              HINT_BASE + '最新版本（若版本号未刷新，请在 OSS 桶上配置 CORS 允许本站域名）';
          }
        });
    }

    bindOssDownload({
      ossBase: 'https://whybrowser.oss-cn-hangzhou.aliyuncs.com',
      latestYml: 'https://whybrowser.oss-cn-hangzhou.aliyuncs.com/latest.yml',
      fallbackVersion: '3.0.2',
      fallbackPath: 'WhyBrowser Setup 3.0.2.exe',
      linkId: 'whybrowserDownload',
      hintId: 'whybrowserVersionHint'
    });

    bindOssDownload({
      ossBase: 'https://countdown-app-updater.oss-cn-hangzhou.aliyuncs.com/release',
      latestYml: 'https://countdown-app-updater.oss-cn-hangzhou.aliyuncs.com/release/latest.yml',
      fallbackVersion: '1.1.21',
      fallbackPath: 'countdown-whyapp Setup 1.1.21.exe',
      linkId: 'countdownDownload',
      hintId: 'countdownVersionHint'
    });
  })();

  /* ============================================================
     DOWNLOAD UA CHECK — Non-Windows Warning
  ============================================================ */
  (function initDownloadUaCheck() {
    function detectOS() {
      var ua = navigator.userAgent;
      if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
      if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1';
      if (/Windows NT 6\.2/.test(ua)) return 'Windows 8';
      if (/Windows NT 6\.1/.test(ua)) return 'Windows 7';
      if (/Windows NT 6\.0/.test(ua)) return 'Windows Vista';
      if (/Windows NT 5/.test(ua)) return 'Windows XP';
      if (/Mac OS X/.test(ua)) return 'macOS';
      if (/Linux/.test(ua) && !/Android/.test(ua)) return 'Linux';
      if (/Android/.test(ua)) return 'Android';
      if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
      return '未知系统';
    }

    function isWindows10Plus() {
      var ua = navigator.userAgent;
      return /Windows NT 1[0-9]/.test(ua);
    }

    var uaModal = document.getElementById('uaWarningModal');
    var uaModalOverlay = document.getElementById('uaWarningOverlay');
    var uaModalText = document.getElementById('uaWarningText');
    var uaModalForceLink = document.getElementById('uaWarningForceLink');
    var uaModalClose = document.getElementById('uaWarningClose');

    if (!uaModal) return;

    function openUaModal(url) {
      uaModalText.textContent = '此App目前仅支持微软Windows 10及以上操作系统，您目前是：' + detectOS() + '系统，如果您仍然要下载 请点击此链接';
      uaModalForceLink.href = url;
      uaModalOverlay.classList.add('open');
      uaModal.classList.add('open');
    }

    function closeUaModal() {
      uaModalOverlay.classList.remove('open');
      uaModal.classList.remove('open');
    }

    document.querySelectorAll('.btn-download').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.dataset.href;
        if (!href) return;
        if (!isWindows10Plus()) {
          e.preventDefault();
          openUaModal(href);
        }
      });
    });

    if (uaModalClose) uaModalClose.addEventListener('click', closeUaModal);
    if (uaModalOverlay) uaModalOverlay.addEventListener('click', closeUaModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeUaModal();
    });
  })();

  /* ============================================================
     INITIAL LOAD
  ============================================================ */
  onScroll();
