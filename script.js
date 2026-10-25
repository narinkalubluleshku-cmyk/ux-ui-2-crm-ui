// Hero раскрывается отдельным GSAP-сценарием. Исключаем его из общего
// IntersectionObserver, иначе тот добавляет CSS-задержки по элементам.
const revealItems = Array.from(document.querySelectorAll(".reveal")).filter(
  (item) => !item.closest(".hero-layout")
);

const emailCopyLinks = document.querySelectorAll("[data-copy-email]");
let emailToastTimer;

document.querySelectorAll("[data-expand-description]").forEach((button) => {
  button.addEventListener("click", () => {
    const extra = button.closest(".case-screen-copy")?.querySelector(".case-screen-extra");
    if (!extra) return;
    extra.hidden = false;
    button.remove();
  });
});

// Compact mobile hypothesis reader for the Screen Gallery case.
const hypothesesSection = document.querySelector("#favorites-hypotheses-title")?.closest("section");
const hypothesesTable = hypothesesSection?.querySelector(".case-metrics-table");
if (hypothesesSection && hypothesesTable) {
  const rows = Array.from(hypothesesTable.querySelectorAll("tbody > tr"));
  const group = hypothesesTable.closest(".case-metrics-group");
  if (group && rows.length) {
    const pager = document.createElement("div");
    pager.className = "hypothesis-pager";
    pager.innerHTML = `
      <nav class="hypothesis-pager-nav" aria-label="Переключение гипотез">
        <button type="button" data-hypothesis-prev aria-label="Предыдущая гипотеза" aria-controls="hypothesis-reader"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5" /></svg></button>
        <span class="hypothesis-pager-count" aria-live="polite" aria-atomic="true"></span>
        <button type="button" data-hypothesis-next aria-label="Следующая гипотеза" aria-controls="hypothesis-reader"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg></button>
      </nav>
      <div class="hypothesis-pager-panel" id="hypothesis-reader" role="group" aria-labelledby="hypothesis-reader-title" tabindex="0">
        <h3 id="hypothesis-reader-title"></h3>
        <div class="hypothesis-pager-description"></div>
        <div class="hypothesis-pager-metrics"><p class="hypothesis-pager-label">Метрики</p><div></div></div>
      </div>`;
    let current = 0;
    const prev = pager.querySelector("[data-hypothesis-prev]");
    const next = pager.querySelector("[data-hypothesis-next]");
    const panel = pager.querySelector(".hypothesis-pager-panel");
    const render = () => {
      const [title, description, metrics] = rows[current].children;
      pager.querySelector(".hypothesis-pager-count").textContent = `${current + 1} из ${rows.length}`;
      pager.querySelector("h3").textContent = title.textContent.trim();
      pager.querySelector(".hypothesis-pager-description").innerHTML = description.innerHTML;
      pager.querySelector(".hypothesis-pager-metrics > div").innerHTML = metrics.innerHTML;
      prev.disabled = current === 0;
      next.disabled = current === rows.length - 1;
    };
    prev.addEventListener("click", () => { if (current > 0) { current -= 1; render(); } });
    next.addEventListener("click", () => { if (current < rows.length - 1) { current += 1; render(); } });
    let swipeStart = null;
    panel.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      swipeStart = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
    }, { passive: true });
    panel.addEventListener("touchmove", (event) => {
      if (event.touches.length !== 1) swipeStart = null;
    }, { passive: true });
    panel.addEventListener("touchend", (event) => {
      const start = swipeStart;
      swipeStart = null;
      const touch = event.changedTouches[0];
      if (!start || !touch || event.touches.length) return;
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy) * 1.4) return;
      if (dx < 0) next.click();
      else prev.click();
    }, { passive: true });
    panel.addEventListener("touchcancel", () => { swipeStart = null; }, { passive: true });
    render();
    group.appendChild(pager);
    hypothesesSection.classList.add("case-metrics--pager");
  }
}

// Mobile benchmarking: one criterion and three concise service answers.
(() => {
  const table = document.querySelector('.favorites-reference-comparison--desktop');
  const wrap = table?.closest('.favorites-reference-comparison-wrap');
  if (!wrap) return;
  const criteria = [...table.querySelectorAll('.favorites-reference-criterion')];
  const answers = [
    ['Приложения, экраны и флоу; группировка по приложениям', 'Скриншоты', 'Приложения, экраны, UI-элементы и флоу'],
    ['Save при наведении на скрин', 'Нет данных', 'Чекбокс → выбор коллекции → Save'],
    ['Save под экраном', 'Save to… внизу боковой панели', 'Нет данных'],
    ['Сохранение открытого сценария', 'Нет такой функции', 'Нет данных'],
    ['Из ленты или со страницы приложения', 'Нет такой функции', 'Выбор приложения и коллекций → Save'],
    ['All saved, существующая или новая коллекция', 'Панель Bookmarks; можно выбрать несколько бордов', 'Нижняя панель; выбор или создание коллекции'],
    ['Тост с Add comment, без перехода в коллекцию', 'Обновляется счётчик борда', 'Сообщение Saved to collection и кнопка View'],
    ['Create collection → название, описание, приватность → Create', 'Create Board → название → создание', 'Add to new collection → название → Save'],
    ['Карточки, поиск, фильтры, Screens и Flows', 'Сохранённый скрин внутри борда', 'Карточки; вкладки Apps, Screens, UI Elements и Flows'],
    ['Совместные коллекции в Team-плане', 'Нет данных', 'Нет данных'],
    ['Saved в верхней навигации', 'Bookmarks в левой панели', 'Collections в бургер-меню']
  ];
  if (criteria.length !== answers.length) return;
  const nbsp = (text) => text.replace(/(^|\s)(в|во|на|по|из|со|с|под|без|при|для|и|или|до|после|к|от) /gi, '$1$2\u00a0');
  const pager = document.createElement('div');
  pager.className = 'hypothesis-pager benchmark-pager';
  pager.innerHTML = `<nav class="hypothesis-pager-nav" aria-label="Переключение критериев">
    <button type="button" aria-label="Предыдущий критерий" aria-controls="benchmark-reader"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5" /></svg></button>
    <span class="hypothesis-pager-count" aria-live="polite" aria-atomic="true"></span>
    <button type="button" aria-label="Следующий критерий" aria-controls="benchmark-reader"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg></button>
    </nav><div class="hypothesis-pager-panel" id="benchmark-reader" role="group" aria-labelledby="benchmark-reader-title" tabindex="0"><h3 id="benchmark-reader-title"></h3><div class="benchmark-pager-answers"></div></div>`;
  const [prev, next] = pager.querySelectorAll('button');
  const panel = pager.querySelector('.hypothesis-pager-panel');
  let current = 0;
  const render = () => {
    pager.querySelector('.hypothesis-pager-count').textContent = `${current + 1} из ${criteria.length}`;
    pager.querySelector('h3').textContent = criteria[current].textContent.trim();
    const list = pager.querySelector('.benchmark-pager-answers');
    list.replaceChildren();
    ['Mobbin', 'Refero', 'Appshots'].forEach((name, i) => {
      const item = document.createElement('div');
      const label = document.createElement('p');
      label.className = 'hypothesis-pager-label'; label.textContent = name;
      const text = document.createElement('p'); text.textContent = nbsp(answers[current][i]);
      item.append(label, text); list.append(item);
    });
    prev.disabled = current === 0; next.disabled = current === criteria.length - 1;
  };
  prev.addEventListener('click', () => { if (current > 0) { current--; render(); } });
  next.addEventListener('click', () => { if (current < criteria.length - 1) { current++; render(); } });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); prev.click(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); next.click(); }
  });
  let start = null;
  panel.addEventListener('touchstart', (event) => { const t = event.touches[0]; start = event.touches.length === 1 ? {x:t.clientX,y:t.clientY} : null; }, {passive:true});
  panel.addEventListener('touchmove', (event) => { if (event.touches.length !== 1) start = null; }, {passive:true});
  panel.addEventListener('touchend', (event) => {
    const t = event.changedTouches[0], origin = start; start = null;
    if (!origin || !t || event.touches.length) return;
    const dx = t.clientX-origin.x, dy = t.clientY-origin.y;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy)*1.4) (dx < 0 ? next : prev).click();
  }, {passive:true});
  panel.addEventListener('touchcancel', () => { start = null; }, {passive:true});
  render(); wrap.after(pager); wrap.classList.add('has-benchmark-pager');
})();

// Desktop table previews preserve the complete table on mobile and without JavaScript.
document.querySelectorAll(".case-metrics-table, .favorites-reference-comparison--desktop").forEach((table, index) => {
  const rows = table.querySelectorAll("tbody > tr");
  const wrap = table.closest(".case-metrics-table-wrap, .favorites-reference-comparison-wrap");
  if (!wrap || rows.length < 2) return;

  if (!table.id) table.id = `case-table-${index + 1}`;
  table.classList.add("case-table-preview");
  if (table.matches(".favorites-reference-comparison--desktop")) table.classList.add("case-table-preview--comparison");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "case-table-expand";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", table.id);
  button.innerHTML = '<span>Развернуть</span><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m5 7.5 5 5 5-5" /></svg>';
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") !== "true";
    table.classList.toggle("is-expanded", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    button.querySelector("span").textContent = expanded ? "Свернуть" : "Развернуть";
  });
  wrap.after(button);
});

document.querySelectorAll(".case-metrics-group").forEach((group) => {
  const table = group.querySelector(".case-metrics-table");
  if (!table) return;

  if (group.closest(".case-metrics--inline")) return;
  const headings = Array.from(table.querySelectorAll("thead th"));
  const descriptionHeading = headings[1]?.textContent.trim() || "Что показывает";
  const targetHeading = headings[2]?.textContent.trim() || "Критерий успеха";

  const cards = document.createElement("div");
  cards.className = "case-metrics-cards";
  cards.setAttribute("aria-label", group.getAttribute("aria-label") || group.querySelector("h3")?.textContent.trim() || "Метрики");

  table.querySelectorAll("tbody tr").forEach((row) => {
    const [metric, description, target] = row.children;
    if (!metric || !description || !target) return;

    const card = document.createElement("article");
    card.className = "case-metrics-card";
    const cardRows = `
      <div class="case-metrics-card-row">
        ${descriptionHeading ? `<span>${descriptionHeading}</span>` : ""}
        <p>${description.innerHTML}</p>
      </div>
      <div class="case-metrics-card-row">
        <span>${targetHeading}</span>
        <p>${target.innerHTML}</p>
      </div>
    `;

    card.innerHTML = `
      <div class="case-metrics-card-title">${metric.innerHTML}</div>
      ${cardRows}
    `;
    cards.appendChild(card);
  });

  group.appendChild(cards);

  let dragStartX = 0;
  let dragStartScroll = 0;
  let activePointerId = null;

  cards.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return;
    if (event.target.closest("button, a, input, select, textarea")) return;
    activePointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartScroll = cards.scrollLeft;
    cards.setPointerCapture(activePointerId);
    cards.classList.add("is-dragging");
  });

  cards.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointerId) return;
    cards.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });

  const stopCardsDrag = (event) => {
    if (event.pointerId !== activePointerId) return;
    if (cards.hasPointerCapture(activePointerId)) cards.releasePointerCapture(activePointerId);
    activePointerId = null;
    cards.classList.remove("is-dragging");
  };

  cards.addEventListener("pointerup", stopCardsDrag);
  cards.addEventListener("pointercancel", stopCardsDrag);
});

function getEmailAddress(link) {
  return decodeURIComponent(link.getAttribute("href") || "")
    .replace(/^mailto:/i, "")
    .split("?")[0]
    .trim();
}

function copyTextFallback(text) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  field.remove();
}

function showEmailToast() {
  let toast = document.querySelector(".email-copy-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "email-copy-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = "Почта скопирована";
    document.body.appendChild(toast);
  }

  window.clearTimeout(emailToastTimer);
  toast.classList.add("is-visible");
  emailToastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

emailCopyLinks.forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault();
    const email = getEmailAddress(link);
    if (!email) return;

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(email);
    } catch {
      copyTextFallback(email);
    }

    showEmailToast();
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
  revealObserver.observe(item);
});

const siteHeader = document.querySelector(".site-header");
const headerContext = document.querySelector(".header-context");
const heroContacts = document.querySelector(".hero-contacts");
const contextSections = Array.from(
  document.querySelectorAll(".projects, .concepts, .about")
).map((section) => ({
  section,
  heading: section.querySelector(".section-heading") || section,
  title: section.dataset.headerTitle || section.querySelector(".section-heading h2")?.textContent.trim() || ""
}));

function updateHeaderContext() {
  if (!siteHeader || !headerContext) return;
  const headerBottom = siteHeader.getBoundingClientRect().bottom;
  const activeSection = contextSections.find(({ section, heading }) => {
    if (!heading) return false;
    const sectionRect = section.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    return headingRect.top <= headerBottom && sectionRect.bottom > headerBottom;
  });

  if (!activeSection) {
    headerContext.classList.remove("is-visible");
    return;
  }

  const mobileTitles = { projects: "Кейсы", concepts: "Концепты", about: "Обо\u00a0мне" };
  const mobileTitle = Object.entries(mobileTitles).find(([className]) => activeSection.section.classList.contains(className))?.[1];
  const title = window.matchMedia("(max-width: 800px)").matches ? mobileTitle || activeSection.title : activeSection.title;
  if (headerContext.textContent !== title) {
    headerContext.textContent = title;
  }
  headerContext.classList.add("is-visible");
}

function updateHeaderVisibility() {
  if (!siteHeader || !heroContacts) return;
  const contactsTop = heroContacts.getBoundingClientRect().top;
  siteHeader.classList.toggle("is-shown", window.scrollY > 1 && contactsTop <= window.innerHeight * 0.5);
}

const animatedHeadings = document.querySelectorAll(
  ".hero-title .title-line, .project h3, .concept-intro h2, .about-lead p"
);

function splitHeadingIntoWords(element) {
  let wordIndex = 0;

  function splitNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();

      node.textContent.split(/([ \t\r\n\f]+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          return;
        }

        const word = document.createElement("span");
        word.className = "generated-word";
        word.textContent = part;
        word.style.setProperty("--word-delay", `${wordIndex * 160}ms`);
        wordIndex += 1;
        fragment.appendChild(word);
      });

      node.replaceWith(fragment);
      return;
    }

    if (
      node.nodeType !== Node.ELEMENT_NODE ||
      node.matches(".hero-photo-wrap, img, .footer-mail > span")
    ) return;

    Array.from(node.childNodes).forEach(splitNode);
  }

  Array.from(element.childNodes).forEach(splitNode);
}

animatedHeadings.forEach(splitHeadingIntoWords);

let lastHeadingScrollY = window.scrollY;
let headingScrollDirection = "down";

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY !== lastHeadingScrollY) {
    headingScrollDirection = currentScrollY > lastHeadingScrollY ? "down" : "up";
    lastHeadingScrollY = currentScrollY;
  }
}, { passive: true });

const heroHeadings = Array.from(animatedHeadings).filter((heading) => heading.closest(".hero-title"));
const repeatedHeadings = Array.from(animatedHeadings).filter((heading) => !heading.closest(".hero-title"));
const firstProjectHeading = document.querySelector(".projects .project h3");
const headingReplayState = new WeakMap(repeatedHeadings.map((heading) => [heading, { armed: true }]));

const heroHeadingObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("text-animate-in");
      heroHeadingObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.3 }
);

heroHeadings.forEach((heading) => heroHeadingObserver.observe(heading));

function updateRepeatedHeadingAnimations() {
  const triggerLine = window.innerHeight * 0.78;

  repeatedHeadings.forEach((heading) => {
    if (document.documentElement.matches(".intro-pending, .hero-intro-active")) return;
    const rect = heading.getBoundingClientRect();
    const state = headingReplayState.get(heading);

    if (headingScrollDirection === "up" && rect.top > triggerLine) {
      state.armed = true;
      return;
    }

    if (
      headingScrollDirection === "down" &&
      state.armed &&
      rect.top <= triggerLine &&
      rect.bottom > 0
    ) {
      state.armed = false;
      heading.classList.remove("text-instant", "text-animate-in");
      void heading.offsetWidth;
      requestAnimationFrame(() => heading.classList.add("text-animate-in"));
    }
  });
}

const conceptCaption = document.querySelector(".concept-caption");
const conceptCards = document.querySelectorAll(".concept-card");
const conceptIntro = document.querySelector(".concept-intro");
let activeConceptCard = conceptCards[0];
let conceptCaptionTimer = null;

function updateConceptAlignment() {
  const activeImage = activeConceptCard?.querySelector("img");
  if (!activeImage || !conceptIntro || activeImage.clientHeight <= 0) return;
  conceptIntro.style.setProperty("--concept-image-height", `${activeImage.clientHeight}px`);
}

function updateActiveConcept() {
  if (!conceptCards.length || !conceptCaption) return;
  const controlLine = conceptIntro?.getBoundingClientRect().top ?? window.innerHeight * 0.5;
  const cards = Array.from(conceptCards);
  const activationLine = controlLine + Math.min(180, window.innerHeight * 0.2);
  const activatedCards = cards.filter((card) => {
    return card.getBoundingClientRect().top <= activationLine;
  });
  const nextCard = activatedCards[activatedCards.length - 1] || cards[0];

  if (!nextCard || nextCard === activeConceptCard) return;
  activeConceptCard = nextCard;
  updateConceptAlignment();
  const nextCaption = nextCard.dataset.caption;
    if (conceptCaption.textContent === nextCaption) return;

    window.clearTimeout(conceptCaptionTimer);
    conceptCaption.classList.add("is-changing");
    conceptCaptionTimer = window.setTimeout(() => {
      conceptCaption.textContent = nextCaption;
      conceptCaption.classList.remove("is-changing");
    }, 180);
}

const imageShiftItems = document.querySelectorAll(".image-shift img");

function updateParallax() {
  imageShiftItems.forEach((image) => {
    const rect = image.parentElement.getBoundingClientRect();
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
    const shift = Math.max(-18, Math.min(18, centerOffset * -0.025));
    image.style.translate = `0 ${shift}px`;
  });
}

let ticking = false;

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveConcept();
        updateRepeatedHeadingAnimations();
        updateParallax();
        updateHeaderVisibility();
        updateHeaderContext();
        ticking = false;
      });
      ticking = true;
    }
  },
  { passive: true }
);

window.addEventListener("resize", () => {
  updateActiveConcept();
  updateRepeatedHeadingAnimations();
  updateParallax();
  updateConceptAlignment();
  updateHeaderVisibility();
  updateHeaderContext();
});

updateParallax();
updateActiveConcept();
updateRepeatedHeadingAnimations();
window.addEventListener("load", () => {
  updateActiveConcept();
  updateRepeatedHeadingAnimations();
  updateConceptAlignment();
  updateHeaderVisibility();
  updateHeaderContext();
});
updateConceptAlignment();
updateHeaderVisibility();
updateHeaderContext();

const cursor = document.querySelector(".cursor-dot");

const heroLayout = document.querySelector(".hero-layout");
const heroPhoto = document.querySelector(".hero-photo-wrap");
const heroIntro = document.querySelector(".hero-intro");
const heroIntroText = document.querySelector(".hero-intro-text");
const heroTitle = document.querySelector(".hero-title");
const heroInfo = document.querySelector(".hero-info");
const firstProject = document.querySelector(".projects .project");
const secondProject = document.querySelectorAll(".projects .project")[1];
const heroPhotoImage = heroPhoto?.querySelector("img");

function showHeroFinalState() {
  document.documentElement.classList.remove("intro-pending");
  document.documentElement.classList.remove("hero-intro-active", "hero-intro-revealing", "first-case-revealing");
  [firstProject, secondProject].filter(Boolean).forEach((project) => {
    project.classList.remove("intro-project-revealing");
    ["opacity", "visibility", "transform"].forEach((property) => project.style.removeProperty(property));
  });
  heroIntro?.remove();
  heroTitle?.querySelectorAll(".generated-word").forEach((word) => {
    word.style.opacity = "1";
    word.style.filter = "none";
    word.style.transform = "none";
  });
  heroTitle?.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
  heroInfo?.classList.add("is-visible");
  heroPhoto?.classList.add("is-visible");
  [heroTitle, heroInfo, heroPhotoImage].forEach((item) => {
    if (!item) return;
    item.style.removeProperty("opacity");
    item.style.removeProperty("visibility");
    item.style.removeProperty("transform");
  });
  heroLayout?.style.removeProperty("opacity");
  heroLayout?.style.removeProperty("visibility");
  heroLayout?.style.removeProperty("transform");
}

async function runHeroIntro() {
  if (
    window.scrollY > 1 ||
    window.__heroIntroPlayed ||
    !heroIntro ||
    !heroIntroText ||
    !heroLayout ||
    !heroTitle ||
    !heroInfo ||
    !heroPhoto ||
    !heroPhotoImage
  ) {
    showHeroFinalState();
    return;
  }

  window.__heroIntroPlayed = true;
  document.documentElement.classList.add("hero-intro-active");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showHeroFinalState();
    return;
  }

  const { gsap } = window;
  if (!gsap) {
    showHeroFinalState();
    return;
  }

  const phraseWords = "Твоя команда грустит, потому что в ней нет меня".split(" ");
  const wordElements = [];

  phraseWords.forEach((text) => {
    if (text === "что") {
      const lineBreak = document.createElement("br");
      lineBreak.className = "hero-intro-break";
      heroIntroText.appendChild(lineBreak);
    }
    const word = document.createElement("span");
    word.className = "generated-word";
    word.textContent = text;
    heroIntroText.appendChild(word);
    wordElements.push(word);
  });

  heroTitle.querySelectorAll(".generated-word").forEach((word) => {
    gsap.set(word, { opacity: 1, filter: "blur(0px)", y: 0 });
  });
  heroTitle.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
  heroInfo.classList.add("is-visible");
  heroPhoto.classList.add("is-visible");

  const resources = [];
  if (document.fonts?.ready) resources.push(document.fonts.ready);
  resources.push(heroPhotoImage.decode?.() || Promise.resolve());
  await Promise.allSettled(resources);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  if (window.scrollY > 1) {
    showHeroFinalState();
    return;
  }

  gsap.set(wordElements, { autoAlpha: 0, filter: "blur(14px)", y: 18 });
  gsap.set(heroPhotoImage, { autoAlpha: 0 });

  const timeline = gsap.timeline({
    defaults: { overwrite: "auto" },
    onComplete: () => {
      heroIntro.remove();
      [firstProject, secondProject].filter(Boolean).forEach((project) => project.classList.remove("intro-project-revealing"));
      document.documentElement.classList.remove("hero-intro-active", "hero-intro-revealing", "first-case-revealing");
      gsap.set([heroLayout, heroTitle, heroInfo, heroPhoto, heroPhotoImage, firstProject, secondProject].filter(Boolean), { clearProps: "opacity,visibility,transform" });
    }
  });

  const wordStagger = 0.154;
  const wordRevealDuration = 1.728;
  timeline.to(wordElements, {
    autoAlpha: 1,
    filter: "blur(0px)",
    y: 0,
    duration: wordRevealDuration,
    stagger: wordStagger,
    ease: "power2.out"
  }, 0);

  // Даём фразе полностью проявиться, затем быстро и последовательно уводим её.
  const disappearStart = wordRevealDuration + (wordElements.length - 1) * wordStagger - 0.5;
  const wordDisappearDuration = 0.5;
  const wordDisappearStagger = 0;
  timeline.to(wordElements, {
    autoAlpha: 0,
    filter: "blur(8px)",
    y: -8,
    duration: wordDisappearDuration,
    stagger: wordDisappearStagger,
    ease: "power1.inOut"
  }, disappearStart);

  const introEnd = disappearStart + wordDisappearDuration + (wordElements.length - 1) * wordDisappearStagger;
  timeline.call(() => {
    document.documentElement.classList.add("hero-intro-revealing");
    // Движется один контейнер: имя, фотография и нижний блок проходят
    // одинаковую траекторию и финишируют строго синхронно.
    gsap.set(heroLayout, { autoAlpha: 0, y: 2, force3D: true });
    // Фотография проявляется вместе с контейнером — так все элементы hero
    // стартуют и доходят до финальной позиции одним синхронным движением.
    gsap.set(heroPhotoImage, { autoAlpha: 1 });
    document.documentElement.classList.remove("intro-pending");
  }, null, introEnd);
  timeline.addLabel("hero-reveal");
  timeline.to(heroLayout, {
    autoAlpha: 1,
    y: 0,
    duration: 1.16,
    ease: "power3.out",
    force3D: true
  }, introEnd);

  if (firstProject) {
    timeline.call(() => {
      firstProject.classList.add("is-visible", "intro-project-revealing");
      document.documentElement.classList.add("first-case-revealing");
    }, null, introEnd + 0.5);
    timeline.fromTo(firstProject, { autoAlpha: 0, y: 80 }, {
      autoAlpha: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out"
    }, introEnd + 0.5);
    timeline.call(() => {
      if (!firstProjectHeading) return;
      const state = headingReplayState.get(firstProjectHeading);
      if (state) state.armed = false;
      firstProjectHeading.classList.remove("text-instant", "text-animate-in");
      void firstProjectHeading.offsetWidth;
      firstProjectHeading.classList.add("text-animate-in");
    }, null, introEnd + 0.5 + 1.2);

    const secondRect = secondProject?.getBoundingClientRect();
    if (window.matchMedia("(min-width: 801px)").matches && secondRect && secondRect.top < window.innerHeight && secondRect.bottom > 0) {
      const secondStart = introEnd + 0.5 + 1.2 + 0.5;
      timeline.call(() => {
        secondProject.classList.add("is-visible", "intro-project-revealing");
      }, null, secondStart);
      timeline.fromTo(secondProject, { autoAlpha: 0, y: 80 }, {
        autoAlpha: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out"
      }, secondStart);
      timeline.call(() => {
        const heading = secondProject.querySelector("h3");
        if (!heading) return;
        const state = headingReplayState.get(heading);
        if (state) state.armed = false;
        heading.classList.remove("text-instant", "text-animate-in");
        void heading.offsetWidth;
        heading.classList.add("text-animate-in");
      }, null, secondStart + 1.2);
    }
  }
}

const navigationType = performance.getEntriesByType?.("navigation")[0]?.type;

let heroIntroInitialized = false;

function initializeHeroIntro() {
  if (heroIntroInitialized) return;
  heroIntroInitialized = true;
  // Wait for the browser to restore scrolling before deciding to play the intro.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (navigationType === "back_forward" || window.scrollY > 1) {
      showHeroFinalState();
    } else {
      runHeroIntro().catch(showHeroFinalState);
    }
  }));
}

if (document.readyState === "complete") initializeHeroIntro();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    showHeroFinalState();
  } else {
    initializeHeroIntro();
  }
});

const catPhotos = [
  "./assets/cats/cat-01.webp",
  "./assets/cats/cat-02-full.webp",
  "./assets/cats/cat-03.webp",
  "./assets/cats/cat-04.webp",
  "./assets/cats/cat-05.webp",
  "./assets/cats/cat-06.webp",
  "./assets/cats/cat-07.webp",
  "./assets/cats/cat-08.webp",
  "./assets/cats/cat-09.webp",
  "./assets/cats/cat-10-full.webp",
  "./assets/cats/cat-11.webp",
  "./assets/cats/cat-12.webp"
];
let catIndex = 0;

const heroSection = heroLayout?.closest(".hero");
let heroHasBeenVisible = false;

if (heroSection) {
  const heroCleanupObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        heroHasBeenVisible = true;
        return;
      }

      if (heroHasBeenVisible) {
        heroLayout.querySelectorAll(".cat-pop").forEach((cat) => cat.remove());
        heroPhoto?.classList.remove("tooltip-hidden");
        catIndex = 0;
      }
    });
  }, { threshold: 0 });

  heroCleanupObserver.observe(heroSection);
}

const catSlots = [
  [52, 43], // 1
  [60, 66], // 2
  [37, 10], // 3
  [81, 17], // 4
  [29, 56], // 5
  [45, 80], // 6
  [86, 80], // 7
  [8, 50],  // 8
  [34, 36], // 9
  [73, 55], // 10
  [60, 25], // 11
  [89, 48]  // 12
];

function findFreeCatPosition() {
  const index = catIndex % catSlots.length;
  const slot = catSlots[index];
  return { left: slot[0], top: slot[1], index };
}

function addCuteCat() {
  if (!heroLayout) return;
  const existingCats = heroLayout.querySelectorAll(".cat-pop");
  if (existingCats.length >= 3) existingCats[0].remove();
  const position = findFreeCatPosition();
  const cat = document.createElement("img");
  cat.className = "cat-pop";
  cat.src = catPhotos[catIndex % catPhotos.length];
  cat.alt = "";
  cat.loading = "eager";
  cat.style.left = `${position.left}%`;
  cat.style.top = `${position.top}%`;
  cat.dataset.slot = position.index;
  heroLayout.appendChild(cat);
  catIndex += 1;
}

if (heroPhoto) {
  heroPhoto.addEventListener("click", addCuteCat);
  heroPhoto.addEventListener("click", () => {
    heroPhoto.classList.add("tooltip-hidden");
  });
  heroPhoto.addEventListener("mouseleave", () => {
    heroPhoto.classList.remove("tooltip-hidden");
  });
  heroPhoto.addEventListener("blur", () => {
    heroPhoto.classList.remove("tooltip-hidden");
  });
  heroPhoto.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      addCuteCat();
    }
  });
}

const lightbox = document.createElement("div");
lightbox.className = "image-lightbox";
lightbox.setAttribute("role", "dialog");
lightbox.setAttribute("aria-modal", "true");
lightbox.setAttribute("aria-label", "Увеличенный макет");
lightbox.innerHTML = `
  <button class="image-lightbox-close" type="button" aria-label="Закрыть изображение">×</button>
  <img class="image-lightbox-image" src="" alt="" />
`;
document.body.appendChild(lightbox);

const lightboxImage = lightbox.querySelector(".image-lightbox-image");
const lightboxClose = lightbox.querySelector(".image-lightbox-close");

function openLightbox(image, fullSource = "") {
  lightboxImage.src = fullSource || image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightbox.classList.add("is-open");
  document.body.classList.add("lightbox-open");
  lightbox.scrollLeft = 0;
  lightbox.scrollTop = 0;
  requestAnimationFrame(() => {
    lightbox.scrollLeft = 0;
    lightbox.scrollTop = 0;
  });
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  document.body.classList.remove("lightbox-open");
}

document.querySelectorAll(".project-visual, .concept-card, .case-media").forEach((container) => {
  const image = container.querySelector("img");
  if (!image) return;
  const fullSource = container.dataset.fullSrc || "";

  container.classList.add("zoomable-media");
  const zoomButton = document.createElement("button");
  zoomButton.className = "image-zoom-button";
  zoomButton.type = "button";
  zoomButton.setAttribute("aria-label", "Увеличить изображение");
  zoomButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5"></circle>
      <path d="M14.5 14.5 20 20M10.5 8v5M8 10.5h5"></path>
    </svg>
  `;
  zoomButton.addEventListener("click", () => openLightbox(image, fullSource));
  image.addEventListener("click", () => openLightbox(image, fullSource));
  container.appendChild(zoomButton);
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
});

if (cursor && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  });

  document.querySelectorAll("a, .project-visual, .concept-card img").forEach((item) => {
    item.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
    item.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
  });
}

const favoritesComparisonScroller = document.querySelector(".favorites-reference-comparison-wrap");

if (favoritesComparisonScroller) {
  const updateFavoritesServiceColumn = () => {
    favoritesComparisonScroller.classList.toggle("is-scrolled", favoritesComparisonScroller.scrollLeft > 16);
  };

  favoritesComparisonScroller.addEventListener("scroll", updateFavoritesServiceColumn, { passive: true });
  updateFavoritesServiceColumn();
}
