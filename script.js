const revealItems = document.querySelectorAll(".reveal");

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
  heading: section.querySelector(".section-heading"),
  title: section.querySelector(".section-heading h2")?.textContent.trim() || ""
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

  if (headerContext.textContent !== activeSection.title) {
    headerContext.textContent = activeSection.title;
  }
  headerContext.classList.add("is-visible");
}

function updateHeaderVisibility() {
  if (!siteHeader || !heroContacts) return;
  const contactsTop = heroContacts.getBoundingClientRect().top;
  siteHeader.classList.toggle("is-shown", contactsTop <= window.innerHeight * 0.5);
}

const animatedHeadings = document.querySelectorAll(
  ".hero-title .title-line, .project h3, .concept-intro h2, .about-lead p"
);

function splitHeadingIntoWords(element) {
  let wordIndex = 0;

  function splitNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();

      node.textContent.split(/(\s+)/).forEach((part) => {
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
