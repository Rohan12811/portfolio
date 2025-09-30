const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const header = document.querySelector(".site-header");
let lastScroll = 0;

window.addEventListener("scroll", () => {
    const current = window.pageYOffset || document.documentElement.scrollTop;

    if (!header) {
        return;
    }

    header.classList.toggle("is-scrolled", current > 30);

    if (current > lastScroll && current > 120) {
        header.classList.add("hide");
    } else {
        header.classList.remove("hide");
    }

    lastScroll = current;
});

const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const sections = document.querySelectorAll("section[id]");

const setActiveLink = (id) => {
    navLinks.forEach((link) => {
        const target = link.getAttribute("href");
        link.classList.toggle("is-active", target === "#" + id);
    });
};

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setActiveLink(entry.target.id);
            }
        });
    }, { rootMargin: "-45% 0px -45% 0px" });

    sections.forEach((section) => observer.observe(section));
} else {
    const handleScroll = () => {
        let selectedId = null;
        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.35 && rect.bottom >= window.innerHeight * 0.35) {
                selectedId = section.id;
            }
        });

        if (selectedId) {
            setActiveLink(selectedId);
        }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
}

const projectCards = document.querySelectorAll('.project-card[data-project]');
const projectDetails = document.querySelectorAll('.project-detail[data-project]');
const detailMap = new Map();
projectDetails.forEach((detail) => {
    detailMap.set(detail.dataset.project, detail);
    if (!detail.classList.contains('is-active')) {
        detail.setAttribute('hidden', 'hidden');
    }
});

const activateProject = (projectId, shouldScroll = true) => {
    if (!detailMap.has(projectId)) {
        return;
    }

    projectCards.forEach((card) => {
        const isActive = card.dataset.project === projectId;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    projectDetails.forEach((detail) => {
        const isActive = detail.dataset.project === projectId;
        detail.classList.toggle('is-active', isActive);
        detail.toggleAttribute('hidden', !isActive);

        const videos = detail.querySelectorAll('video');
        videos.forEach((video) => {
            if (isActive) {
                video.muted = true;
                video.loop = true;
                if (typeof video.load === 'function') {
                    video.load();
                }
                const playPromise = video.play?.();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.catch(() => {});
                }
            } else {
                video.pause?.();
                video.currentTime = 0;
            }
        });
    });

    if (shouldScroll) {
        const activeDetail = detailMap.get(projectId);
        const scrollTarget = activeDetail?.closest('.gallery-detail') || activeDetail;
        if (scrollTarget) {
            window.requestAnimationFrame(() => {
                scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }
};

if (projectCards.length && projectDetails.length) {
    const presetActive = document.querySelector('.project-card.is-active');
    const initialProject = (presetActive || projectCards[0]).dataset.project;
    activateProject(initialProject, false);

    projectCards.forEach((card) => {
        card.addEventListener('click', () => activateProject(card.dataset.project));
    });
}

const menuViewport = document.querySelector('.gallery-menu-viewport');
const menu = document.querySelector('.gallery-menu');
const navPrev = document.querySelector('.gallery-nav-prev');
const navNext = document.querySelector('.gallery-nav-next');

const getScrollAmount = () => {
    if (!menu) {
        return 0;
    }

    const firstCard = menu.querySelector('.project-card');
    if (!firstCard) {
        return 0;
    }

    const style = window.getComputedStyle(menu);
    const gap = parseFloat(style.columnGap || style.gap || '0');
    return firstCard.offsetWidth + gap;
};

const updateNavState = () => {
    if (!menuViewport || !navPrev || !navNext) {
        return;
    }

    const maxScrollLeft = menuViewport.scrollWidth - menuViewport.clientWidth;
    navPrev.disabled = menuViewport.scrollLeft <= 1;
    navNext.disabled = menuViewport.scrollLeft >= maxScrollLeft - 1;
};

const scrollMenu = (direction) => {
    if (!menuViewport) {
        return;
    }

    const amount = getScrollAmount() || menuViewport.clientWidth * 0.9;
    menuViewport.scrollBy({ left: direction * amount, behavior: 'smooth' });
};

if (menuViewport && navPrev && navNext) {
    updateNavState();

    navPrev.addEventListener('click', () => scrollMenu(-1));
    navNext.addEventListener('click', () => scrollMenu(1));

    const throttledUpdate = () => window.requestAnimationFrame(updateNavState);
    menuViewport.addEventListener('scroll', throttledUpdate, { passive: true });
    window.addEventListener('resize', throttledUpdate);
}
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox ? lightbox.querySelector('.lightbox-image') : null;
const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
let lightboxLastFocus = null;

const openLightbox = (imageEl) => {
    if (!lightbox || !lightboxImage || !lightboxCaption || !imageEl) {
        return;
    }

    lightboxImage.src = imageEl.currentSrc || imageEl.src;
    const description = imageEl.getAttribute('alt') || '';
    lightboxImage.alt = description;
    lightboxCaption.textContent = description;
    lightbox.removeAttribute('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    lightboxLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lightboxClose?.focus();
};

const closeLightbox = () => {
    if (!lightbox || !lightboxImage || !lightboxCaption || lightbox.hasAttribute('hidden')) {
        return;
    }

    lightboxImage.src = '';
    lightboxImage.alt = '';
    lightboxCaption.textContent = '';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.setAttribute('hidden', '');
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    if (lightboxLastFocus && typeof lightboxLastFocus.focus === 'function') {
        lightboxLastFocus.focus();
    }
    lightboxLastFocus = null;
};

if (lightbox && lightboxImage && lightboxCaption) {
    const galleryImages = document.querySelectorAll('.detail-gallery img');
    galleryImages.forEach((img) => {
        img.setAttribute('tabindex', '0');
        img.addEventListener('click', () => openLightbox(img));
        img.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(img);
            }
        });
    });

    lightboxClose?.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    });
}



