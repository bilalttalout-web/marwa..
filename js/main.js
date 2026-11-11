/**
 * main.js - Core Application Orchestrator for Marwa's Birthday Surprise
 * Handles stages, hand-drawn heart animation, interactive photo gallery,
 * and the grand finale modal with maximum reliability.
 */

// ----------------------------------------------------------------------------
// Global Stage Controller Functions (Available immediately before DOMContentLoaded)
// ----------------------------------------------------------------------------

window.goToStage = function(targetStageId) {
  const allStages = document.querySelectorAll('.stage-section');
  const targetEl = document.getElementById(targetStageId);

  if (!targetEl) return;

  allStages.forEach(stage => {
    if (stage.id === targetStageId) {
      stage.classList.remove('fade-out');
      stage.classList.add('active');
    } else {
      stage.classList.add('fade-out');
      setTimeout(() => {
        stage.classList.remove('active', 'fade-out');
      }, 400);
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Trigger stage specific actions
  if (targetStageId === 'stage-heart') {
    setTimeout(() => {
      if (typeof window.startHeartAnimation === 'function') {
        window.startHeartAnimation();
      }
    }, 200);
  } else if (targetStageId === 'stage-gallery') {
    if (typeof window.showSlide === 'function') {
      window.showSlide(0);
    }
  }
};

window.handleUnlockSurprise = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const unlockBtn = document.getElementById('unlock-btn');
  if (unlockBtn) {
    unlockBtn.disabled = true;
    unlockBtn.innerHTML = `<span>Opening Surprise...</span> <span aria-hidden="true">💖</span>`;
  }

  // 1. Play romantic background music
  try {
    if (window.romanticAudio) {
      window.romanticAudio.play();
    }
  } catch (err) {
    console.warn('Audio play error:', err);
  }

  // 2. Fire celebration confetti
  try {
    if (window.romanticConfetti) {
      window.romanticConfetti.fire({ count: 90 });
    }
  } catch (err) {
    console.warn('Confetti error:', err);
  }

  // 3. Smoothly switch to Stage 2 (Heart Stage)
  setTimeout(() => {
    window.goToStage('stage-heart');
  }, 400);
};

window.handleGotoMemories = function(e) {
  if (e) e.preventDefault();
  window.goToStage('stage-gallery');
};

window.handleSkip = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Ensure audio starts if user clicks skip
  try {
    if (window.romanticAudio && !window.romanticAudio.isPlaying) {
      window.romanticAudio.play();
    }
  } catch (err) {}

  // Cancel any running heart drawing animation frame
  if (window.heartAnimFrameId) {
    cancelAnimationFrame(window.heartAnimFrameId);
    window.heartAnimFrameId = null;
  }

  // Check currently active stage
  const currentActive = document.querySelector('.stage-section.active');
  const stageId = currentActive ? currentActive.id : '';

  if (stageId === 'stage-password') {
    // If on welcome screen, skip directly to heart stage
    window.goToStage('stage-heart');
  } else if (stageId === 'stage-heart') {
    // If on heart stage, skip directly to memories gallery
    window.goToStage('stage-gallery');
  } else if (stageId === 'stage-gallery') {
    // If already in gallery, skip to next memory
    if (typeof window.nextSlide === 'function') {
      window.nextSlide();
    }
  } else {
    // Default fallback
    window.goToStage('stage-gallery');
  }
};

// ----------------------------------------------------------------------------
// DOMContentLoaded Initialization
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const unlockBtn = document.getElementById('unlock-btn');
  const heartPath = document.getElementById('heart-path-draw');
  const penSpark = document.getElementById('pen-spark');
  const birthdayMessageWrap = document.getElementById('birthday-message-wrap');
  const btnGotoMemories = document.getElementById('btn-goto-memories');

  const cards = Array.from(document.querySelectorAll('.memory-card'));
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const dotsContainer = document.getElementById('carousel-dots');
  const slidesWrapper = document.getElementById('slides-wrapper');
  const btnFinalSurprise = document.getElementById('btn-final-surprise');
  const btnReplay = document.getElementById('btn-replay');

  const surpriseModal = document.getElementById('surprise-modal');
  const modalClose = document.getElementById('modal-close');
  const modalConfettiBtn = document.getElementById('modal-confetti-btn');

  // State Variables
  let currentSlideIndex = 0;
  let isDrawingHeart = false;
  let heartAnimationCompleted = false;
  let autoSlideTimer = null;

  // Bind Unlock Button
  if (unlockBtn) {
    unlockBtn.onclick = window.handleUnlockSurprise;
  }

  // Bind Skip Buttons (Mobile & Desktop)
  const skipBtns = document.querySelectorAll('#skip-btn, #skip-btn-intro, .skip-btn, .btn-skip, [data-action="skip"]');
  skipBtns.forEach(btn => {
    btn.onclick = window.handleSkip;
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      window.handleSkip(e);
    }, { passive: false });
  });

  // --------------------------------------------------------------------------
  // STAGE 2: PROGRESSIVE HAND-DRAWN HEART ANIMATION
  // --------------------------------------------------------------------------
  window.startHeartAnimation = function() {
    if (isDrawingHeart || heartAnimationCompleted) return;
    isDrawingHeart = true;

    if (!heartPath) return;

    let totalLength = 1200;
    try {
      if (typeof heartPath.getTotalLength === 'function') {
        const len = heartPath.getTotalLength();
        if (len && len > 100) totalLength = len;
      }
    } catch (e) {
      totalLength = 1200;
    }

    heartPath.style.strokeDasharray = totalLength;
    heartPath.style.strokeDashoffset = totalLength;
    if (penSpark) penSpark.setAttribute('opacity', '1');

    const duration = 3200; // 3.2 seconds
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animateStep(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const progress = easeInOutCubic(rawProgress);

      const currentDistance = totalLength * progress;
      heartPath.style.strokeDashoffset = totalLength - currentDistance;

      // Position pen-spark tip
      try {
        if (penSpark && typeof heartPath.getPointAtLength === 'function') {
          const point = heartPath.getPointAtLength(currentDistance);
          if (point) {
            penSpark.setAttribute('cx', point.x);
            penSpark.setAttribute('cy', point.y);

            // Emit sparkle
            if (window.romanticParticles && Math.random() < 0.45) {
              const svgRect = heartPath.getBoundingClientRect();
              const screenX = svgRect.left + (point.x / 500) * svgRect.width;
              const screenY = svgRect.top + (point.y / 500) * svgRect.height;
              window.romanticParticles.addSparkle(screenX, screenY);
            }
          }
        }
      } catch (err) {}

      if (rawProgress < 1) {
        window.heartAnimFrameId = requestAnimationFrame(animateStep);
      } else {
        window.heartAnimFrameId = null;
        finishHeartDrawing();
      }
    }

    window.heartAnimFrameId = requestAnimationFrame(animateStep);
  };

  function finishHeartDrawing() {
    isDrawingHeart = false;
    heartAnimationCompleted = true;

    if (penSpark) penSpark.setAttribute('opacity', '0');
    if (heartPath) heartPath.classList.add('filled');

    // Confetti explosion
    if (window.romanticConfetti) {
      window.romanticConfetti.fire({ count: 120 });
    }

    // Reveal Birthday Text
    setTimeout(() => {
      if (birthdayMessageWrap) {
        birthdayMessageWrap.classList.add('show');
      }
    }, 500);
  }

  if (btnGotoMemories) {
    btnGotoMemories.onclick = window.handleGotoMemories;
  }

  // --------------------------------------------------------------------------
  // STAGE 3: MEMORY PHOTO GALLERY & CAROUSEL
  // --------------------------------------------------------------------------
  function initCarouselDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `dot-btn ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to memory ${index + 1}`);
      dot.onclick = () => {
        window.showSlide(index);
        resetAutoSlideTimer();
      };
      dotsContainer.appendChild(dot);
    });
  }

  window.showSlide = function(index) {
    if (!cards.length) return;
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;

    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev-out');
      if (i === index) {
        card.classList.add('active');
      } else if (i === currentSlideIndex) {
        card.classList.add('prev-out');
      }
    });

    currentSlideIndex = index;

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot-btn');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  };

  window.nextSlide = function() {
    window.showSlide(currentSlideIndex + 1);
    resetAutoSlideTimer();
  };

  window.prevSlide = function() {
    window.showSlide(currentSlideIndex - 1);
    resetAutoSlideTimer();
  };

  if (prevBtn) prevBtn.onclick = window.prevSlide;
  if (nextBtn) nextBtn.onclick = window.nextSlide;

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    const stageGallery = document.getElementById('stage-gallery');
    if (stageGallery && stageGallery.classList.contains('active')) {
      if (e.key === 'ArrowRight') window.nextSlide();
      if (e.key === 'ArrowLeft') window.prevSlide();
    }
  });

  // Mobile Touch Swipe
  let touchStartX = 0;
  let touchEndX = 0;

  if (slidesWrapper) {
    slidesWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slidesWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (Math.abs(touchEndX - touchStartX) > 40) {
        if (touchEndX < touchStartX) {
          window.nextSlide();
        } else {
          window.prevSlide();
        }
      }
    }, { passive: true });
  }

  function resetAutoSlideTimer() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
      const stageGallery = document.getElementById('stage-gallery');
      const modal = document.getElementById('surprise-modal');
      if (stageGallery && stageGallery.classList.contains('active') && (!modal || !modal.classList.contains('active'))) {
        window.nextSlide();
      }
    }, 8500);
  }

  initCarouselDots();

  // --------------------------------------------------------------------------
  // FINAL SURPRISE MODAL (LOVE LETTER)
  // --------------------------------------------------------------------------
  window.openSurpriseModal = function() {
    if (surpriseModal) {
      surpriseModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (window.romanticConfetti) {
        window.romanticConfetti.fire({ count: 140 });
        setTimeout(() => {
          window.romanticConfetti.fire({ count: 90 });
        }, 350);
      }
    }
  };

  window.closeSurpriseModal = function() {
    if (surpriseModal) {
      surpriseModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (btnFinalSurprise) btnFinalSurprise.onclick = window.openSurpriseModal;
  if (modalClose) modalClose.onclick = window.closeSurpriseModal;

  if (surpriseModal) {
    surpriseModal.addEventListener('click', (e) => {
      if (e.target === surpriseModal) {
        window.closeSurpriseModal();
      }
    });
  }

  if (modalConfettiBtn) {
    modalConfettiBtn.onclick = () => {
      if (window.romanticConfetti) {
        window.romanticConfetti.fire({ count: 120 });
      }
    };
  }

  // --------------------------------------------------------------------------
  // REPLAY SURPRISE EXPERIENCE
  // --------------------------------------------------------------------------
  if (btnReplay) {
    btnReplay.onclick = () => {
      window.closeSurpriseModal();
      heartAnimationCompleted = false;
      isDrawingHeart = false;
      if (heartPath) {
        heartPath.classList.remove('filled');
        heartPath.style.strokeDashoffset = '1200';
      }
      if (birthdayMessageWrap) {
        birthdayMessageWrap.classList.remove('show');
      }
      if (unlockBtn) {
        unlockBtn.disabled = false;
        unlockBtn.innerHTML = `<span>Open Your Surprise</span> <span aria-hidden="true">✨❤️</span>`;
      }
      window.goToStage('stage-password');
    };
  }
});
