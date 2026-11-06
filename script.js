(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const emailAddress = 'colbyrodriguez1991@gmail.com';
  const themeToggle = document.querySelector('#theme-toggle');
  const themeIcon = document.querySelector('.theme-icon');
  const themeLabel = document.querySelector('#theme-label');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (themeToggle) themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
    if (themeLabel) themeLabel.textContent = nextTheme === 'light' ? 'Light' : 'Dark';
  }

  let savedTheme;
  try {
    savedTheme = window.localStorage.getItem('colby-portfolio-theme');
  } catch (_) {
    // The page also works when browser storage is unavailable.
  }
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeToggle?.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try {
      window.localStorage.setItem('colby-portfolio-theme', theme);
    } catch (_) {
      // Theme changes still apply for this visit.
    }
  });

  const menuToggle = document.querySelector('#menu-toggle');
  const navigation = document.querySelector('#primary-navigation');
  const navigationLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const desktopLayout = window.matchMedia('(min-width: 760px)');

  function setMenuOpen(open) {
    menuToggle?.setAttribute('aria-expanded', String(open));
    menuToggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menuToggle?.classList.toggle('is-open', open);
    navigation?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) navigation?.querySelector('.nav-link')?.focus();
  }

  menuToggle?.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  navigationLinks.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('click', event => {
    if (menuToggle?.getAttribute('aria-expanded') === 'true' &&
        !navigation?.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
  const handleLayoutChange = event => {
    if (event.matches) setMenuOpen(false);
  };
  if (desktopLayout.addEventListener) {
    desktopLayout.addEventListener('change', handleLayoutChange);
  } else {
    desktopLayout.addListener(handleLayoutChange);
  }
  setMenuOpen(false);

  const sectionIds = ['home', 'about', 'skills', 'work', 'contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const header = document.querySelector('.site-header');
  const readingProgress = document.querySelector('#reading-progress');
  const backToTop = document.querySelector('#back-to-top');
  let scrollFrame = 0;
  let activeId = '';

  function updateActiveSection() {
    const marker = Math.min(window.innerHeight * 0.35, 260);
    let active = sections[0];
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= marker) active = section;
    });
    const atBottom = window.scrollY + window.innerHeight >= root.scrollHeight - 4;
    if (atBottom && sections.length) active = sections[sections.length - 1];
    if (!active || active.id === activeId) return;
    activeId = active.id;
    navigationLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function updateScroll() {
    scrollFrame = 0;
    const distance = Math.max(0, root.scrollHeight - window.innerHeight);
    const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    if (readingProgress) readingProgress.style.transform = `scaleX(${progress})`;
    header?.classList.toggle('scrolled', window.scrollY > 16);
    if (backToTop) backToTop.hidden = window.scrollY <= 600;
    updateActiveSection();
  }

  function queueScrollUpdate() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', queueScrollUpdate, { passive: true });
  window.addEventListener('resize', queueScrollUpdate, { passive: true });
  window.addEventListener('load', queueScrollUpdate, { once: true });
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    const home = document.querySelector('#home');
    if (home) {
      if (!home.hasAttribute('tabindex')) home.setAttribute('tabindex', '-1');
      home.focus({ preventScroll: true });
    }
  });
  updateScroll();

  if ('IntersectionObserver' in window) {
    const navigationObserver = new IntersectionObserver(updateActiveSection, {
      rootMargin: '-15% 0px -55% 0px',
      threshold: [0, 0.1, 0.5]
    });
    sections.forEach(section => navigationObserver.observe(section));
  }

  const revealElements = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    root.classList.add('js-reveal');
    revealElements.forEach(element => revealObserver.observe(element));
    const showAll = event => {
      if (event.matches) {
        revealObserver.disconnect();
        revealElements.forEach(element => element.classList.add('is-visible'));
      }
    };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', showAll);
    else reducedMotion.addListener(showAll);
  } else {
    revealElements.forEach(element => element.classList.add('is-visible'));
  }

  const skillDetails = {
    drawing: {
      title: 'Drawing',
      description: 'A creative way to turn an idea into something visual. Drawing brings together observation, imagination, and attention to detail.',
      note: 'Want to talk about drawing or share a creative idea? Get in touch below.',
      image: 'draw.png',
      alt: 'Drawing illustration',
      tags: ['Creativity', 'Visual expression', 'Details']
    },
    editing: {
      title: 'Video editing',
      description: 'Making clips work together through pacing, sequence, and sound. Video editing is a space to explore how a story feels on screen.',
      note: 'Have an idea for a video? Use the contact section to start a conversation.',
      image: 'edit.webp',
      alt: 'Video editing illustration',
      tags: ['Storytelling', 'Pacing', 'Sound & visuals']
    },
    cooking: {
      title: 'Cooking',
      description: 'One of my hobbies and a chance to be creative away from the screen. Cooking combines preparation, patience, and the fun of trying something new.',
      note: 'Food is always a good conversation starter. Share a recipe or say hello below.',
      image: 'chef.png',
      alt: 'Chef illustration',
      tags: ['Creativity', 'Preparation', 'Trying new things']
    }
  };
  const skillDialog = document.querySelector('#skill-dialog');
  const dialogTitle = document.querySelector('#dialog-title');
  const dialogDescription = document.querySelector('#dialog-description');
  const dialogNote = document.querySelector('#dialog-note');
  const dialogImage = document.querySelector('#dialog-image');
  const dialogTags = document.querySelector('#dialog-tags');
  let dialogTrigger;

  function restoreDialogFocus() {
    if (dialogTrigger?.isConnected) dialogTrigger.focus();
    dialogTrigger = null;
  }

  function closeSkillDialog() {
    if (!skillDialog) return;
    if (typeof skillDialog.close === 'function') skillDialog.close();
    else {
      skillDialog.removeAttribute('open');
      restoreDialogFocus();
    }
  }

  document.querySelectorAll('[data-skill]').forEach(button => {
    button.addEventListener('click', () => {
      const skill = skillDetails[button.dataset.skill];
      if (!skill || !skillDialog) return;
      if (dialogTitle) dialogTitle.textContent = skill.title;
      if (dialogDescription) dialogDescription.textContent = skill.description;
      if (dialogNote) dialogNote.textContent = skill.note;
      if (dialogImage) {
        dialogImage.src = skill.image;
        dialogImage.alt = skill.alt;
      }
      if (dialogTags) {
        dialogTags.replaceChildren(...skill.tags.map(tag => {
          const badge = document.createElement('span');
          badge.textContent = tag;
          return badge;
        }));
      }
      dialogTrigger = button;
      if (!skillDialog.open) {
        if (typeof skillDialog.showModal === 'function') skillDialog.showModal();
        else {
          skillDialog.setAttribute('open', '');
          document.querySelector('#dialog-close')?.focus();
        }
      }
    });
  });
  document.querySelector('#dialog-close')?.addEventListener('click', closeSkillDialog);
  skillDialog?.addEventListener('close', restoreDialogFocus);
  skillDialog?.addEventListener('click', event => {
    if (event.target !== skillDialog) return;
    const bounds = skillDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) closeSkillDialog();
  });
  skillDialog?.addEventListener('keydown', event => {
    if (event.key === 'Escape' && typeof skillDialog.close !== 'function') closeSkillDialog();
  });

  const toast = document.querySelector('#toast');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4500);
  }

  function copyWithFallback(value) {
    const focusedElement = document.activeElement;
    const temporaryField = document.createElement('textarea');
    temporaryField.value = value;
    temporaryField.setAttribute('readonly', '');
    temporaryField.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    let copied = false;
    try {
      document.body.append(temporaryField);
      temporaryField.select();
      copied = document.execCommand('copy');
    } catch (_) {
      copied = false;
    } finally {
      temporaryField.remove();
      if (focusedElement instanceof HTMLElement) focusedElement.focus({ preventScroll: true });
    }
    return copied;
  }

  const copyEmail = document.querySelector('#copy-email');
  copyEmail?.addEventListener('click', async () => {
    copyEmail.disabled = true;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailAddress);
        copied = true;
      }
    } catch (_) {
      // A browser may deny clipboard access; try the local fallback.
    }
    if (!copied) copied = copyWithFallback(emailAddress);
    copyEmail.disabled = false;
    showToast(copied ? 'Email address copied.' : 'Copy unavailable. Select the email address or use the email link.');
  });

  const contactForm = document.querySelector('#contact-form');
  const senderName = document.querySelector('#sender-name');
  const senderEmail = document.querySelector('#sender-email');
  const message = document.querySelector('#message');
  const formStatus = document.querySelector('#form-status');
  const defaultFormStatus = formStatus?.textContent || 'Your email app will open with a draft. Review it and press Send there.';

  [senderName, senderEmail, message].filter(Boolean).forEach(field => {
    field.addEventListener('input', () => {
      field.setCustomValidity('');
      if (formStatus && formStatus.textContent !== defaultFormStatus) {
        formStatus.textContent = defaultFormStatus;
      }
    });
  });

  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!senderName || !senderEmail || !message) return;
    senderName.setCustomValidity(senderName.value.trim() ? '' : 'Please enter your name.');
    message.setCustomValidity(message.value.trim() ? '' : 'Please enter a message.');
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }
    const subject = `Portfolio message from ${senderName.value.trim()}`;
    const body = `Name: ${senderName.value.trim()}\nEmail: ${senderEmail.value.trim()}\n\n${message.value.trim()}`;
    const mailto = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (formStatus) {
      formStatus.textContent = 'Opening a draft in your email app. Review it and press Send there. If no app opens, copy the email address and send your message manually.';
    }
    window.location.href = mailto;
  });
})();
