/* ==========================================================================
   SHEKKEER MUHAMMED — INTERACTIVE PORTFOLIO SCRIPTS
   ========================================================================== */

(() => {
  'use strict';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  /* ------------------------------------------------------------------------
     1. STICKY HEADER & COLLAPSING MOBILE MENU
     ------------------------------------------------------------------------ */
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  function setMenuOpen(open) {
    if (!menuToggle || !navMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    navMenu.classList.toggle('is-open', open);
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!isOpen);
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (
        menuToggle.getAttribute('aria-expanded') === 'true' &&
        !navMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) {
        setMenuOpen(false);
      }
    });
  }

  function updateHeaderScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  }
  window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  /* Active section observer */
  const sections = ['home', 'about', 'work', 'services', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeHref = `#${entry.target.id}`;
            navLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === activeHref);
            });
          }
        });
      },
      {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  /* ------------------------------------------------------------------------
     2. WORK GALLERY FILTERING
     ------------------------------------------------------------------------ */
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const galleryGrid = document.getElementById('gallery-grid');
  const workCards = Array.from(document.querySelectorAll('.work-card'));
  const galleryStatus = document.getElementById('gallery-status');

  function applyFilter(category, labelText) {
    filterBtns.forEach((btn) => {
      const active = btn.dataset.filter === category;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    if (galleryGrid) {
      galleryGrid.classList.toggle('is-filtered', category !== 'all');
    }

    let visibleCount = 0;
    workCards.forEach((card) => {
      const match = category === 'all' || card.dataset.category === category;
      card.hidden = !match;
      if (match) visibleCount += 1;
    });

    if (galleryStatus) {
      galleryStatus.textContent = `Showing ${visibleCount} ${
        visibleCount === 1 ? 'project' : 'projects'
      } in ${labelText}.`;
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset.filter || 'all', btn.textContent.trim());
    });
  });

  /* ------------------------------------------------------------------------
     3. ACCESSIBLE LIGHTBOX VIEWER
     ------------------------------------------------------------------------ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let activeTriggers = [];
  let currentIndex = 0;
  let lastFocusedTrigger = null;

  function getVisibleTriggers() {
    return workCards
      .filter((card) => !card.hidden)
      .map((card) => card.querySelector('.work-card-trigger'))
      .filter(Boolean);
  }

  function renderLightboxItem(index) {
    if (!activeTriggers.length) return;
    currentIndex = (index + activeTriggers.length) % activeTriggers.length;
    const trigger = activeTriggers[currentIndex];
    const imgEl = trigger.querySelector('img');

    if (lightboxImg) {
      lightboxImg.src = trigger.dataset.src || '';
      lightboxImg.alt = imgEl ? imgEl.alt : trigger.dataset.title || '';
    }
    if (lightboxTitle) {
      lightboxTitle.textContent = trigger.dataset.title || '';
    }
    if (lightboxMeta) {
      lightboxMeta.textContent = `${trigger.dataset.cat || ''} · ${trigger.dataset.meta || ''}`;
    }
    if (lightboxCounter) {
      const cur = String(currentIndex + 1).padStart(2, '0');
      const tot = String(activeTriggers.length).padStart(2, '0');
      lightboxCounter.textContent = `${cur} / ${tot}`;
    }
  }

  function openLightbox(trigger) {
    if (!lightbox) return;
    activeTriggers = getVisibleTriggers();
    const idx = activeTriggers.indexOf(trigger);
    if (idx === -1) return;

    lastFocusedTrigger = trigger;
    renderLightboxItem(idx);
    lightbox.hidden = false;
    document.body.classList.add('lock-scroll');
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove('lock-scroll');
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
    }
  }

  workCards.forEach((card) => {
    const trigger = card.querySelector('.work-card-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => openLightbox(trigger));
    }
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => renderLightboxItem(currentIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => renderLightboxItem(currentIndex + 1));

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-body') || e.target.classList.contains('lightbox-figure')) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      renderLightboxItem(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      renderLightboxItem(currentIndex + 1);
    } else if (e.key === 'Tab') {
      const focusables = [lightboxClose, lightboxPrev, lightboxNext].filter(Boolean);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ------------------------------------------------------------------------
     4. INTERACTIVE COMMERCIAL SHOWREEL PLAYER (CANVAS ENGINE)
     ------------------------------------------------------------------------ */
  const reelCanvas = document.getElementById('reel-canvas');
  const reelPosterBtn = document.getElementById('reel-poster-btn');
  const reelToggleBtn = document.getElementById('reel-toggle-btn');
  const reelProgress = document.getElementById('reel-progress');
  const reelProgressBar = document.getElementById('reel-progress-bar');
  const reelTimecode = document.getElementById('reel-timecode');
  const reelCutCat = document.getElementById('reel-cut-cat');
  const reelCutTitle = document.getElementById('reel-cut-title');
  const reelChapterBtns = Array.from(document.querySelectorAll('.reel-chapter-btn'));

  const reelCuts = [
    {
      src: 'assets/images/showreel-cover.jpg',
      cat: '01 // Automotive',
      title: 'Dubai Tunnel Velocity',
      zoomFrom: 1.0,
      zoomTo: 1.11,
      panX: -0.02
    },
    {
      src: 'assets/images/fashion-02.jpg',
      cat: '02 // Fashion',
      title: 'Afterhours Downtown Campaign',
      zoomFrom: 1.08,
      zoomTo: 1.0,
      panX: 0.02
    },
    {
      src: 'assets/images/product-02.jpg',
      cat: '03 // Product & Perfume',
      title: 'Obsidian Scent & Horology',
      zoomFrom: 1.0,
      zoomTo: 1.1,
      panX: -0.015
    },
    {
      src: 'assets/images/realestate-01.jpg',
      cat: '04 // Real Estate',
      title: 'Skyline Penthouse Walkthrough',
      zoomFrom: 1.09,
      zoomTo: 1.01,
      panX: 0.015
    },
    {
      src: 'assets/images/events-01.jpg',
      cat: '05 // Events',
      title: 'Prestige Live Stage Coverage',
      zoomFrom: 1.0,
      zoomTo: 1.09,
      panX: 0.0
    },
    {
      src: 'assets/images/hero-dubai.jpg',
      cat: '06 // Production',
      title: 'Night Crane Set · Dubai',
      zoomFrom: 1.07,
      zoomTo: 1.0,
      panX: -0.02
    }
  ];

  const CUT_DURATION = 4; // seconds per cut
  const TOTAL_DURATION = reelCuts.length * CUT_DURATION; // 24s
  const loadedReelImages = [];
  let reelPlaying = false;
  let reelElapsed = 0;
  let lastFrameTs = null;
  let rafId = null;

  function formatTime(sec) {
    const s = Math.max(0, Math.min(TOTAL_DURATION, Math.floor(sec)));
    return `00:${String(s).padStart(2, '0')}`;
  }

  function drawCoverImage(ctx, img, w, h, scale, offsetXRatio) {
    if (!img || !img.complete || !img.naturalWidth) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    const canvasRatio = w / h;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let drawW;
    let drawH;

    if (imgRatio > canvasRatio) {
      drawH = h * scale;
      drawW = drawH * imgRatio;
    } else {
      drawW = w * scale;
      drawH = drawW / imgRatio;
    }

    const x = (w - drawW) / 2 + w * offsetXRatio;
    const y = (h - drawH) / 2;
    ctx.drawImage(img, x, y, drawW, drawH);
  }

  function renderReelFrame() {
    if (!reelCanvas) return;
    const ctx = reelCanvas.getContext('2d');
    if (!ctx) return;

    const w = reelCanvas.width;
    const h = reelCanvas.height;
    const clampedTime = Math.min(reelElapsed, TOTAL_DURATION - 0.001);
    const cutIdx = Math.min(reelCuts.length - 1, Math.floor(clampedTime / CUT_DURATION));
    const cutProgress = (clampedTime % CUT_DURATION) / CUT_DURATION;
    const cut = reelCuts[cutIdx];
    const img = loadedReelImages[cutIdx];

    ctx.clearRect(0, 0, w, h);

    const reduce = prefersReducedMotion();
    const scale = reduce
      ? 1.02
      : cut.zoomFrom + (cut.zoomTo - cut.zoomFrom) * cutProgress;
    const pan = reduce ? 0 : cut.panX * (cutProgress - 0.5) * 2;

    drawCoverImage(ctx, img, w, h, scale, pan);

    /* Subtle dark cinema vignette + anamorphic letterbox bars */
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,0.35)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.02)');
    grad.addColorStop(1, 'rgba(0,0,0,0.58)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const barH = Math.round(h * 0.065);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, barH);
    ctx.fillRect(0, h - barH, w, barH);

    /* Sharp viewfinder crosshair ticks */
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    const m = 28;
    const len = 18;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(m, barH + 16 + len);
    ctx.lineTo(m, barH + 16);
    ctx.lineTo(m + len, barH + 16);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - m - len, barH + 16);
    ctx.lineTo(w - m, barH + 16);
    ctx.lineTo(w - m, barH + 16 + len);
    ctx.stroke();

    /* Flash cut transition accent on cut boundary (skip if reduced motion) */
    if (!reduce && reelPlaying && cutProgress < 0.05) {
      ctx.fillStyle = `rgba(255, 61, 31, ${(0.05 - cutProgress) * 3.2})`;
      ctx.fillRect(0, barH, w, h - barH * 2);
    }

    /* Update HUD & Controls */
    if (reelCutCat) reelCutCat.textContent = cut.cat;
    if (reelCutTitle) reelCutTitle.textContent = cut.title;

    const pct = Math.min(100, (reelElapsed / TOTAL_DURATION) * 100);
    if (reelProgressBar) reelProgressBar.style.width = `${pct}%`;
    if (reelProgress) reelProgress.setAttribute('aria-valuenow', String(Math.round(pct)));
    if (reelTimecode) reelTimecode.textContent = `${formatTime(reelElapsed)} / 00:${TOTAL_DURATION}`;

    reelChapterBtns.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === cutIdx);
    });
  }

  function stepReel(ts) {
    if (!reelPlaying) return;
    if (lastFrameTs === null) lastFrameTs = ts;
    const dt = (ts - lastFrameTs) / 1000;
    lastFrameTs = ts;

    reelElapsed += dt;
    if (reelElapsed >= TOTAL_DURATION) {
      reelElapsed = 0;
      setReelPlaying(false);
      renderReelFrame();
      return;
    }

    renderReelFrame();
    rafId = requestAnimationFrame(stepReel);
  }

  function setReelPlaying(play) {
    reelPlaying = play;
    lastFrameTs = null;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (reelPosterBtn) reelPosterBtn.classList.toggle('is-playing', play);
    if (reelToggleBtn) reelToggleBtn.textContent = play ? 'Pause' : 'Play';

    if (play) {
      rafId = requestAnimationFrame(stepReel);
    }
  }

  if (reelCanvas) {
    reelCuts.forEach((cut, idx) => {
      const img = new Image();
      img.src = cut.src;
      img.addEventListener('load', () => {
        if (idx === 0 && !reelPlaying) renderReelFrame();
      });
      loadedReelImages.push(img);
    });

    renderReelFrame();

    if (reelPosterBtn) {
      reelPosterBtn.addEventListener('click', () => setReelPlaying(true));
    }
    if (reelToggleBtn) {
      reelToggleBtn.addEventListener('click', () => setReelPlaying(!reelPlaying));
    }
    reelCanvas.addEventListener('click', () => setReelPlaying(!reelPlaying));

    if (reelProgress) {
      reelProgress.addEventListener('click', (e) => {
        const rect = reelProgress.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        reelElapsed = ratio * TOTAL_DURATION;
        renderReelFrame();
      });

      reelProgress.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          reelElapsed = Math.min(TOTAL_DURATION - 0.1, reelElapsed + 2);
          renderReelFrame();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          reelElapsed = Math.max(0, reelElapsed - 2);
          renderReelFrame();
        }
      });
    }

    reelChapterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.cut || 0);
        reelElapsed = idx * CUT_DURATION;
        renderReelFrame();
        setReelPlaying(true);
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. SERVICES "ENQUIRE" PRE-FILL + JUMP TO CONTACT
     ------------------------------------------------------------------------ */
  const enquireBtns = Array.from(document.querySelectorAll('.enquire-btn'));
  const contactSection = document.getElementById('contact');
  const contactPanel = document.getElementById('contact-form-panel');
  const serviceSelect = document.getElementById('contact-service');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  const prefillBanner = document.getElementById('prefill-banner');
  const prefillText = document.getElementById('prefill-text');
  const prefillClear = document.getElementById('prefill-clear');

  let lastAutoMessage = '';

  function buildServiceStarter(serviceName) {
    return `Hi Shekkeer, I'd like to book ${serviceName} in Dubai. Here are the project details and dates: `;
  }

  function applyServicePrefill(serviceName) {
    if (serviceSelect) {
      serviceSelect.value = serviceName;
    }

    if (prefillBanner && prefillText) {
      if (serviceName) {
        prefillText.textContent = `Selected service: ${serviceName}`;
        prefillBanner.hidden = false;
      } else {
        prefillBanner.hidden = true;
      }
    }

    if (contactPanel) {
      contactPanel.classList.toggle('is-prefilled', Boolean(serviceName));
    }

    if (messageInput) {
      const currentVal = messageInput.value.trim();
      if (!serviceName) {
        if (messageInput.value === lastAutoMessage) {
          messageInput.value = '';
          lastAutoMessage = '';
        }
      } else if (!currentVal || messageInput.value === lastAutoMessage) {
        const starter = buildServiceStarter(serviceName);
        messageInput.value = starter;
        lastAutoMessage = starter;
      }
    }
  }

  enquireBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const serviceName = btn.dataset.service || '';
      applyServicePrefill(serviceName);

      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start'
        });
      }

      const focusDelay = prefersReducedMotion() ? 0 : 420;
      window.setTimeout(() => {
        if (nameInput) nameInput.focus({ preventScroll: true });
      }, focusDelay);
    });
  });

  if (serviceSelect) {
    serviceSelect.addEventListener('change', () => {
      applyServicePrefill(serviceSelect.value);
    });
  }

  if (prefillClear) {
    prefillClear.addEventListener('click', () => {
      applyServicePrefill('');
      if (serviceSelect) serviceSelect.focus();
    });
  }

  /* ------------------------------------------------------------------------
     6. CONTACT FORM VALIDATION & SUBMISSION
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const errorName = document.getElementById('error-name');
  const errorEmail = document.getElementById('error-email');
  const errorMessage = document.getElementById('error-message');

  function setFieldError(inputEl, errorEl, msg) {
    if (!inputEl || !errorEl) return;
    inputEl.setAttribute('aria-invalid', msg ? 'true' : 'false');
    errorEl.textContent = msg;
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  if (contactForm) {
    [
      [nameInput, errorName],
      [emailInput, errorEmail],
      [messageInput, errorMessage]
    ].forEach(([inp, err]) => {
      if (inp) {
        inp.addEventListener('input', () => setFieldError(inp, err, ''));
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (formStatus) formStatus.hidden = true;

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const msgVal = messageInput ? messageInput.value.trim() : '';
      const serviceVal = serviceSelect && serviceSelect.value ? serviceSelect.value : 'General Enquiry';

      let firstInvalid = null;

      if (!nameVal) {
        setFieldError(nameInput, errorName, 'Enter your name.');
        firstInvalid = firstInvalid || nameInput;
      } else {
        setFieldError(nameInput, errorName, '');
      }

      if (!emailVal) {
        setFieldError(emailInput, errorEmail, 'Enter your email address.');
        firstInvalid = firstInvalid || emailInput;
      } else if (!isValidEmail(emailVal)) {
        setFieldError(emailInput, errorEmail, 'Enter a valid email address.');
        firstInvalid = firstInvalid || emailInput;
      } else {
        setFieldError(emailInput, errorEmail, '');
      }

      if (!msgVal) {
        setFieldError(messageInput, errorMessage, 'Add a short project brief or dates.');
        firstInvalid = firstInvalid || messageInput;
      } else {
        setFieldError(messageInput, errorMessage, '');
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (formStatus) {
        formStatus.textContent = `Thanks, ${nameVal}. Your ${serviceVal.toLowerCase()} enquiry is logged—Shekkeer will reply at ${emailVal} within 24 hours.`;
        formStatus.hidden = false;
      }

      contactForm.reset();
      lastAutoMessage = '';
      if (prefillBanner) prefillBanner.hidden = true;
      if (contactPanel) contactPanel.classList.remove('is-prefilled');
    });
  }
})();
