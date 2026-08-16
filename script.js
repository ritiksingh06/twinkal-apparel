const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('a.brand').forEach((brandLink) => {
  brandLink.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (nav && menuBtn) {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
});

const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.16,
  }
);

revealEls.forEach((el) => observer.observe(el));

const testimonialSlider = document.querySelector('.testimonial-slider');
const testimonialTrack = document.querySelector('.testimonial-track');
const testimonialPrevBtn = document.querySelector('.testimonial-prev');
const testimonialNextBtn = document.querySelector('.testimonial-next');
const videoSlider = document.querySelector('.video-slider');
const videoTrack = document.querySelector('.video-track');
const videoPrevBtn = document.querySelector('.video-prev');
const videoNextBtn = document.querySelector('.video-next');

if (testimonialSlider && testimonialTrack) {
  const testimonialCards = Array.from(testimonialTrack.querySelectorAll('.quote'));
  let currentIndex = 0;

  const getVisibleCards = () => {
    if (window.innerWidth <= 760) {
      return 1;
    }

    if (window.innerWidth <= 1000) {
      return 2;
    }

    return 4;
  };

  const applyTransform = () => {
    if (testimonialCards.length === 0) {
      return;
    }

    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, testimonialCards.length - visibleCards);
    currentIndex = Math.min(currentIndex, maxIndex);

    const cardWidth = testimonialCards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(testimonialTrack).gap || '0');
    const shift = currentIndex * (cardWidth + gap);
    testimonialTrack.style.transform = `translateX(-${shift}px)`;
  };

  const goToNext = () => {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, testimonialCards.length - visibleCards);

    if (maxIndex === 0) {
      return;
    }

    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    applyTransform();
  };

  const goToPrev = () => {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, testimonialCards.length - visibleCards);

    if (maxIndex === 0) {
      return;
    }

    currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    applyTransform();
  };

  if (testimonialNextBtn) {
    testimonialNextBtn.addEventListener('click', goToNext);
  }

  if (testimonialPrevBtn) {
    testimonialPrevBtn.addEventListener('click', goToPrev);
  }

  window.addEventListener('resize', applyTransform);

  applyTransform();
}

if (videoSlider && videoTrack) {
  const videoCards = Array.from(videoTrack.querySelectorAll('.video-card'));
  let currentVideoIndex = 0;

  const getVisibleVideos = () => {
    if (window.innerWidth <= 760) {
      return 1;
    }

    return 3;
  };

  const applyVideoTransform = () => {
    if (videoCards.length === 0) {
      return;
    }

    const visibleVideos = getVisibleVideos();
    const maxVideoIndex = Math.max(0, videoCards.length - visibleVideos);
    currentVideoIndex = Math.min(currentVideoIndex, maxVideoIndex);

    const cardWidth = videoCards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(videoTrack).gap || '0');
    const shift = currentVideoIndex * (cardWidth + gap);
    videoTrack.style.transform = `translateX(-${shift}px)`;
  };

  const goToNextVideo = () => {
    const visibleVideos = getVisibleVideos();
    const maxVideoIndex = Math.max(0, videoCards.length - visibleVideos);

    if (maxVideoIndex === 0) {
      return;
    }

    currentVideoIndex = currentVideoIndex >= maxVideoIndex ? 0 : currentVideoIndex + 1;
    applyVideoTransform();
  };

  const goToPrevVideo = () => {
    const visibleVideos = getVisibleVideos();
    const maxVideoIndex = Math.max(0, videoCards.length - visibleVideos);

    if (maxVideoIndex === 0) {
      return;
    }

    currentVideoIndex = currentVideoIndex <= 0 ? maxVideoIndex : currentVideoIndex - 1;
    applyVideoTransform();
  };

  if (videoNextBtn) {
    videoNextBtn.addEventListener('click', goToNextVideo);
  }

  if (videoPrevBtn) {
    videoPrevBtn.addEventListener('click', goToPrevVideo);
  }

  window.addEventListener('resize', applyVideoTransform);

  applyVideoTransform();
}
