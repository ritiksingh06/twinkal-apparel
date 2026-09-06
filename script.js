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

document.querySelectorAll('.video-card video').forEach((videoEl) => {
  videoEl.defaultMuted = true;
  videoEl.muted = true;
});

const FEEDBACK_KEY = 'twinkal-feedbacks';
const GOOGLE_SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwDKlHrqVu6ug8aHIvTSyVMn6lQX7hrl0WBvld42KnmOMcrR9Igs6qMHpNogbmzbdHV/exec';
const defaultFeedbacks = [
  {
    id: 1,
    name: 'Priya',
    city: 'Delhi',
    rating: 5,
    product: 'Kurta Set',
    message: 'The fabric felt premium and the fit was perfect. I got so many compliments at the event.',
  },
  {
    id: 2,
    name: 'Riya',
    city: 'Gurugram',
    rating: 5,
    product: 'Shopping Experience',
    message: 'Support on WhatsApp was quick and the ordering process was smooth from start to finish.',
  },
  {
    id: 3,
    name: 'Neha',
    city: 'Noida',
    rating: 4,
    product: 'Co-ord Set',
    message: 'The outfit looked stylish and comfortable. The quality felt better than expected for the price.',
  },
];

const isGoogleSheetsConfigured = () => {
  return typeof GOOGLE_SHEETS_WEBAPP_URL === 'string'
    && GOOGLE_SHEETS_WEBAPP_URL.includes('script.google.com')
    && GOOGLE_SHEETS_WEBAPP_URL.includes('/exec')
    && !GOOGLE_SHEETS_WEBAPP_URL.includes('PASTE_');
};

const normalizeFeedbackItem = (item) => ({
  id: item.id || item.timestamp || Date.now() + Math.random(),
  name: String(item.name || 'Customer').trim(),
  city: String(item.city || 'India').trim(),
  product: String(item.product || 'Shopping Experience').trim(),
  rating: Number(item.rating) || 5,
  message: String(item.message || '').trim(),
});

const getFeedbacks = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || 'null');
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
  } catch (error) {
    console.warn('Unable to parse saved feedback data.', error);
  }

  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(defaultFeedbacks));
  return defaultFeedbacks;
};

const fetchFeedbacksFromSheet = async () => {
  if (!isGoogleSheetsConfigured()) {
    return null;
  }

  try {
    const response = await fetch(`${GOOGLE_SHEETS_WEBAPP_URL}?action=get`, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
    });

    const responseText = await response.text();
    if (!response.ok || !responseText || responseText.trim().startsWith('<')) {
      throw new Error('Unable to fetch feedback from Google Sheets.');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new Error('Google Sheets did not return valid JSON.');
    }

    const normalized = Array.isArray(data) ? data : [];
    return normalized.map((item) => normalizeFeedbackItem(item)).filter((item) => item.name && item.message);
  } catch (error) {
    console.warn('Google Sheets feedback fetch failed.', error);
    return null;
  }
};

const saveFeedbackToSheet = async (feedback) => {
  if (!isGoogleSheetsConfigured()) {
    return false;
  }

  try {
    const payload = {
      action: 'save',
      ...feedback,
    };

    const response = await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    const isHtmlResponse = responseText.trim().startsWith('<') || responseText.includes('Page not found') || responseText.includes('Sign in');

    if (!response.ok || isHtmlResponse) {
      throw new Error('Unable to save feedback to Google Sheets.');
    }

    if (responseText.trim()) {
      try {
        const parsed = JSON.parse(responseText);
        if (parsed && parsed.ok === false) {
          throw new Error('Google Sheets rejected the feedback payload.');
        }
      } catch (error) {
        if (!responseText.trim().toLowerCase().includes('ok')) {
          throw error;
        }
      }
    }

    return true;
  } catch (error) {
    console.warn('Google Sheets submission failed.', error);
    return false;
  }
};

const renderFeedbacks = (feedbacksOverride) => {
  const feedbackGrid = document.querySelector('.feedback-grid');
  if (!feedbackGrid) return;

  const feedbacks = feedbacksOverride || getFeedbacks();
  if (!feedbacks.length) {
    feedbackGrid.innerHTML = '<p class="feedback-empty">No customer feedback yet. Be the first to share your experience.</p>';
    return;
  }

  feedbackGrid.innerHTML = feedbacks
    .slice()
    .reverse()
    .map((item) => {
      const stars = '★'.repeat(Number(item.rating) || 5) + '☆'.repeat(Math.max(0, 5 - (Number(item.rating) || 5)));
      return `
        <article class="feedback-card">
          <div class="feedback-card-header">
            <div>
              <h3>${String(item.name).slice(0, 1).toUpperCase() + String(item.name).slice(1)}</h3>
              <p class="feedback-meta">${item.city}</p>
            </div>
            <div class="feedback-stars" aria-label="${Number(item.rating) || 5} out of 5 stars">${stars}</div>
          </div>
          <p class="feedback-meta">${item.product}</p>
          <p>“${item.message}”</p>
        </article>
      `;
    })
    .join('');
};

const openFeedbackModal = () => {
  const modal = document.getElementById('feedbackModal');
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
};

const closeFeedbackModal = () => {
  const modal = document.getElementById('feedbackModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  const form = document.getElementById('feedbackForm');
  if (form) form.reset();
  const hiddenRate = document.querySelector('input[name="rating"]');
  if (hiddenRate) hiddenRate.value = '5';
  document.querySelectorAll('.star').forEach((star) => {
    star.classList.toggle('is-active', Number(star.dataset.value) <= 5);
  });
};

const showToast = (message) => {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
};

const feedbackOpenButtons = document.querySelectorAll('.feedback-open');
const feedbackCloseButtons = document.querySelectorAll('[data-close="feedback-modal"]');
const feedbackForm = document.getElementById('feedbackForm');

if (feedbackOpenButtons.length) {
  feedbackOpenButtons.forEach((button) => button.addEventListener('click', openFeedbackModal));
}

if (feedbackCloseButtons.length) {
  feedbackCloseButtons.forEach((button) => button.addEventListener('click', closeFeedbackModal));
}

if (feedbackForm) {
  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(feedbackForm);
    const newFeedback = {
      id: Date.now(),
      name: String(formData.get('name') || '').trim(),
      city: String(formData.get('city') || '').trim(),
      product: String(formData.get('product') || '').trim(),
      rating: Number(formData.get('rating') || 5),
      message: String(formData.get('message') || '').trim(),
    };

    if (!newFeedback.name || !newFeedback.city || !newFeedback.product || !newFeedback.message) {
      showToast('Please complete all fields before submitting.');
      return;
    }

    const savedToSheet = await saveFeedbackToSheet(newFeedback);

    if (savedToSheet) {
      const sheetFeedbacks = await fetchFeedbacksFromSheet();
      if (sheetFeedbacks && sheetFeedbacks.length) {
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(sheetFeedbacks));
        renderFeedbacks(sheetFeedbacks);
      }
      closeFeedbackModal();
      showToast('Thank you! Your feedback has been shared.');
      return;
    }

    const currentFeedbacks = getFeedbacks();
    currentFeedbacks.push(newFeedback);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(currentFeedbacks));
    renderFeedbacks(currentFeedbacks);
    closeFeedbackModal();
    showToast('Google sheet is not live yet. Feedback saved locally for now.');
  });
}

document.querySelectorAll('.star').forEach((star) => {
  star.addEventListener('click', () => {
    const ratingValue = Number(star.dataset.value || 5);
    const hiddenInput = document.querySelector('input[name="rating"]');
    if (hiddenInput) hiddenInput.value = String(ratingValue);
    document.querySelectorAll('.star').forEach((item) => {
      item.classList.toggle('is-active', Number(item.dataset.value) <= ratingValue);
    });
  });
});

const initializeStarRating = () => {
  const hiddenInput = document.querySelector('input[name="rating"]');
  if (hiddenInput) hiddenInput.value = '5';
  document.querySelectorAll('.star').forEach((star) => {
    star.classList.toggle('is-active', true);
  });
};

initializeStarRating();
renderFeedbacks();

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
