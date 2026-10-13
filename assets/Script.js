const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Header : renforcé au scroll ----------
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- Menu mobile ----------
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

function setMenu(open) {
  navList.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  navToggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
}

navToggle.addEventListener('click', () => setMenu(!navList.classList.contains('open')));
navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navList.classList.contains('open')) { setMenu(false); navToggle.focus(); }
});
document.addEventListener('click', e => {
  if (navList.classList.contains('open') && !e.target.closest('.header-bar')) setMenu(false);
});

// ---------- Lien actif dans la nav ----------
const navLinks = [...navList.querySelectorAll('a[href^="#"]')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => {
      if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));

// ---------- Apparition au scroll (cascade entre éléments frères) ----------
const revealEls = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  revealEls.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--delay', Math.min(siblings.indexOf(el), 5) * 90 + 'ms');
  });
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
}

// ---------- Halo qui suit la souris sur les cartes projet ----------
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// ---------- Détail des projets ----------
const projects = {
  ivorytrends: {
    meta: 'Projet de certification · 2026',
    title: "IvoryTrends — analytics du marché musical ivoirien",
    points: [
      'Collecte de données via les APIs Spotify, YouTube et Last.fm.',
      'Modèle de scoring XGBoost.',
      'Architecture complète : back FastAPI + PostgreSQL, front React.',
      'Gestion du projet en Scrum sur 5 sprints.',
      "Projet né d'un besoin observé lors de mon stage chez Universal Music Côte d'Ivoire."
    ],
    tags: ['XGBoost', 'FastAPI', 'PostgreSQL', 'React', 'Scrum']
  },
  n8n: {
    meta: 'Automatisation · 2026',
    title: "Automatisation d'un processus de candidature",
    points: [
      'Conception de bout en bout d\'un workflow planifié sur n8n self-hosted.',
      'Appel à l\'API France Travail, découpage par offre et dédoublonnage via Google Sheets.',
      'Routage conditionnel.',
      'Validation humaine avant envoi : automatiser les tâches répétitives sans perdre la maîtrise du résultat.'
    ],
    tags: ['n8n', 'API REST', 'Google Sheets', 'Self-hosted']
  },
  sql: {
    meta: 'Avril – Juin 2025',
    title: "Automatisation d'un reporting SQL avec Power Platform",
    points: [
      "Écriture et optimisation de requêtes SQL avancées : temps d'exécution réduit de 30 %.",
      'Dashboard Power BI alimenté automatiquement via Power Automate.',
      'Génération de rapports dynamiques.'
    ],
    tags: ['SQL', 'Power BI', 'Power Automate']
  },
  spotify: {
    meta: 'Janvier – Février 2025',
    title: 'Analyse des tendances Spotify avec Python & Dash',
    points: [
      "Extraction et traitement de données via l'API Spotify.",
      'Clustering pour catégoriser les morceaux les plus populaires.',
      'Dashboard interactif Dash / Plotly pour visualiser les tendances.',
      'Projet documenté sur GitHub.'
    ],
    tags: ['Python', 'Pandas', 'Clustering', 'Dash', 'Plotly']
  }
};

const dialog = document.getElementById('projectDialog');
const dialogMeta = document.getElementById('dialogMeta');
const dialogTitle = document.getElementById('dialogTitle');
const dialogList = document.getElementById('dialogList');
const dialogTags = document.getElementById('dialogTags');
const checkIcon = '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>';

document.querySelectorAll('[data-project]').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = projects[btn.dataset.project];
    if (!p) return;
    dialogMeta.textContent = p.meta;
    dialogTitle.textContent = p.title;
    dialogList.replaceChildren(...p.points.map(text => {
      const li = document.createElement('li');
      li.innerHTML = checkIcon;
      li.append(document.createElement('span'));
      li.lastChild.textContent = text;
      return li;
    }));
    dialogTags.replaceChildren(...p.tags.map(text => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }));
    dialog.showModal();
  });
});

document.getElementById('dialogClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

// ---------- Copier l'e-mail ----------
const copyBtn = document.getElementById('copyEmail');
const copyStatus = document.getElementById('copyStatus');
let copyTimer;
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    copyStatus.textContent = 'Adresse copiée.';
  } catch {
    copyStatus.textContent = "Copie impossible — sélectionnez l'adresse manuellement.";
  }
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copyStatus.textContent = ''; }, 2500);
});

// ---------- Année du footer ----------
document.getElementById('year').textContent = new Date().getFullYear();
