document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------------------------------------
     1. CANVAS: FALLING GOLDEN HEARTS & RADIAL CLICK SPARKLES
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById("animationCanvas");
  const ctx = canvas.getContext("2d");
  let width, height;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener("resize", resize);
  resize();

  // Golden Falling Hearts
  const HEART_COUNT = 32;
  const hearts = [];

  class GoldenHeart {
    constructor() {
      this.init(true);
    }

    init(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -35 - Math.random() * 40;
      this.size = Math.random() * 11 + 10;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.02 + 0.012;
      this.swayAmplitude = Math.random() * 1.8 + 0.6;
      this.opacity = Math.random() * 0.5 + 0.5;
      this.rotation = (Math.random() - 0.5) * 0.5;
    }

    update() {
      this.swayAngle += this.swaySpeed;
      this.x += Math.sin(this.swayAngle) * this.swayAmplitude;
      this.y += this.speedY;

      if (this.y > height + 40) {
        this.init(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.beginPath();

      const s = this.size / 15;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-10 * s, -10 * s, -15 * s, 5 * s, 0, 15 * s);
      ctx.bezierCurveTo(15 * s, 5 * s, 10 * s, -10 * s, 0, 0);

      ctx.fillStyle = `rgba(255, 193, 7, ${this.opacity})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(255, 215, 0, 0.65)";
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < HEART_COUNT; i++) {
    hearts.push(new GoldenHeart());
  }

  // Click Sparkles (Radial Burst)
  const sparkles = [];
  const SPARKLE_PALETTE = [
    "#FFD700",
    "#FFC107",
    "#FFF3B0",
    "#FFFFFF",
    "#00f0ff",
  ];

  class Sparkle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 5 + 2;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity;
      this.gravity = 0.07;
      this.friction = 0.98;
      this.radius = Math.random() * 4 + 2.5;
      this.alpha = 1;
      this.decay = Math.random() * 0.025 + 0.018;
      this.color =
        SPARKLE_PALETTE[Math.floor(Math.random() * SPARKLE_PALETTE.length)];
      this.rotation = Math.random() * Math.PI;
      this.rotSpeed = (Math.random() - 0.5) * 0.15;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = Math.max(0, this.alpha);

      ctx.beginPath();
      const r = this.radius;
      ctx.moveTo(0, -r * 1.5);
      ctx.lineTo(r * 0.5, 0);
      ctx.lineTo(0, r * 1.5);
      ctx.lineTo(-r * 0.5, 0);
      ctx.closePath();

      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnSparkles(x, y, count = 16) {
    for (let i = 0; i < count; i++) {
      sparkles.push(new Sparkle(x, y));
    }
  }

  window.addEventListener("click", (e) => {
    spawnSparkles(e.clientX, e.clientY, 15);
  });

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < hearts.length; i++) {
      hearts[i].update();
      hearts[i].draw();
    }

    for (let i = sparkles.length - 1; i >= 0; i--) {
      sparkles[i].update();
      sparkles[i].draw();
      if (sparkles[i].alpha <= 0) {
        sparkles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }
  animate();

  /* ------------------------------------------------------------------------
     2. ALTERNATING MEDIA CAROUSEL (STRICT LOCAL ASSETS)
     Photos = 10 Seconds | Videos = Full Duration
     ------------------------------------------------------------------------ */
  const PHOTO_DURATION = 10000; // 10 seconds for photos

  const mediaSlides = [
    { type: "image", src: "assets/images/Image (1).jpg" },
    { type: "video", src: "assets/video/Video (1).mp4" },
    { type: "image", src: "assets/images/Image (2).jpg" },
    { type: "video", src: "assets/video/Video (2).mp4" },
    { type: "image", src: "assets/images/Image (3).jpg" },
    { type: "video", src: "assets/video/Video (3).mp4" },
    { type: "image", src: "assets/images/Image (4).jpg" },
    { type: "video", src: "assets/video/Video (4).mp4" },
    { type: "image", src: "assets/images/Image (5).jpg" },
    { type: "video", src: "assets/video/Video (5).mp4" },
    { type: "image", src: "assets/images/Image (6).jpg" },
    { type: "video", src: "assets/video/Video (6).mp4" },
  ];

  let currentSlideIndex = 0;
  let isCarouselPaused = false;
  let slideStartTime = Date.now();
  let slideTimerAnimFrame = null;
  let carouselStarted = false;

  const carouselCard = document.getElementById("carouselCard");
  const carouselImage = document.getElementById("carouselImage");
  const carouselVideo = document.getElementById("carouselVideo");
  const slideProgressFill = document.getElementById("slideProgressFill");
  const paginationContainer = document.getElementById("carouselPagination");

  // Build the 12 Pagination Dots
  paginationContainer.innerHTML = "";
  mediaSlides.forEach((_, idx) => {
    const dot = document.createElement("span");
    dot.className = `dot ${idx === 0 ? "active" : ""}`;
    dot.dataset.index = idx;
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      goToSlide(idx);
    });
    paginationContainer.appendChild(dot);
  });

  const dots = paginationContainer.querySelectorAll(".dot");

  function updateDots(index) {
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  function loadSlide(index) {
    currentSlideIndex = index;
    updateDots(currentSlideIndex);

    const item = mediaSlides[currentSlideIndex];
    slideStartTime = Date.now();
    if (slideProgressFill) slideProgressFill.style.width = "0%";

    if (item.type === "image") {
      try {
        carouselVideo.pause();
      } catch (e) {}
      carouselVideo.style.display = "none";
      carouselImage.style.display = "block";
      carouselImage.src = item.src;
    } else {
      carouselImage.style.display = "none";
      carouselVideo.style.display = "block";
      carouselVideo.src = item.src;
      carouselVideo.currentTime = 0;

      if (!isCarouselPaused && carouselStarted) {
        carouselVideo.play().catch((err) => {
          console.warn(
            "[Gallery] Video playback waiting for gesture:",
            err.message,
          );
        });
      }
    }
  }

  // 10s for images, full duration tracking for video
  function stepProgress() {
    if (!isCarouselPaused && carouselStarted) {
      const item = mediaSlides[currentSlideIndex];

      if (item.type === "image") {
        const elapsed = Date.now() - slideStartTime;
        const progress = Math.min(100, (elapsed / PHOTO_DURATION) * 100);
        if (slideProgressFill) slideProgressFill.style.width = `${progress}%`;

        if (elapsed >= PHOTO_DURATION) {
          nextSlide();
          return;
        }
      } else {
        if (carouselVideo.duration && !isNaN(carouselVideo.duration)) {
          const progress =
            (carouselVideo.currentTime / carouselVideo.duration) * 100;
          if (slideProgressFill) slideProgressFill.style.width = `${progress}%`;
        }
      }
    }
    slideTimerAnimFrame = requestAnimationFrame(stepProgress);
  }

  // Auto-advance directly when video finishes
  carouselVideo.addEventListener("ended", () => {
    if (carouselStarted) {
      nextSlide();
    }
  });

  function nextSlide() {
    const nextIdx = (currentSlideIndex + 1) % mediaSlides.length;
    goToSlide(nextIdx);
  }

  function prevSlide() {
    const prevIdx =
      (currentSlideIndex - 1 + mediaSlides.length) % mediaSlides.length;
    goToSlide(prevIdx);
  }

  function goToSlide(index) {
    cancelAnimationFrame(slideTimerAnimFrame);
    loadSlide(index);
    if (carouselStarted) {
      slideTimerAnimFrame = requestAnimationFrame(stepProgress);
    }
  }

  function toggleCarouselPause() {
    isCarouselPaused = !isCarouselPaused;
    carouselCard.classList.toggle("paused", isCarouselPaused);

    const item = mediaSlides[currentSlideIndex];
    if (item.type === "video") {
      if (isCarouselPaused) {
        carouselVideo.pause();
      } else {
        carouselVideo.play().catch(() => {});
      }
    }

    if (!isCarouselPaused) {
      slideStartTime = Date.now();
      slideTimerAnimFrame = requestAnimationFrame(stepProgress);
    }
  }

  // Touch / Click Zones
  const prevZone = document.getElementById("navPrevZone");
  const nextZone = document.getElementById("navNextZone");
  const centerZone = document.getElementById("navCenterZone");

  if (prevZone)
    prevZone.addEventListener("click", (e) => {
      e.stopPropagation();
      prevSlide();
    });
  if (nextZone)
    nextZone.addEventListener("click", (e) => {
      e.stopPropagation();
      nextSlide();
    });
  if (centerZone)
    centerZone.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCarouselPause();
    });

  // Keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") nextSlide();
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === " ") {
      e.preventDefault();
      toggleCarouselPause();
    }
  });

  // Preload initial photo
  loadSlide(0);

  /* ------------------------------------------------------------------------
     3. LIVE COUNTDOWN / COUNT-UP CALCULATOR
     ------------------------------------------------------------------------ */
  const startDate = new Date(2026, 4, 6, 18, 30, 0);

  function updateCountdown() {
    const now = new Date();

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    let hours = now.getHours() - startDate.getHours();
    let minutes = now.getMinutes() - startDate.getMinutes();
    let seconds = now.getSeconds() - startDate.getSeconds();

    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    if (hours < 0) {
      hours += 24;
      days--;
    }
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }

    const countdownElement = document.getElementById("countdown");
    if (countdownElement) {
      countdownElement.textContent = `${years} years, ${months} months, ${days} days, ${hours} hours, ${minutes} minutes e ${seconds} seconds`;
    }
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ------------------------------------------------------------------------
     4. AUDIO CONTROLLER & PROGRESS BAR
     ------------------------------------------------------------------------ */
  const bgMusic = document.getElementById("bgMusic");
  const audioToggleBtn = document.getElementById("audioToggleBtn");
  const pauseIcon = document.getElementById("pauseIcon");
  const playIcon = document.getElementById("playIcon");
  const progressFill = document.getElementById("progressFill");
  const timeDisplay = document.getElementById("timeDisplay");
  const progressBar = document.getElementById("progressBar");

  function formatTime(secs) {
    if (isNaN(secs) || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function updateAudioUI(isPlaying) {
    if (isPlaying) {
      pauseIcon.style.display = "block";
      playIcon.style.display = "none";
    } else {
      pauseIcon.style.display = "none";
      playIcon.style.display = "block";
    }
  }

  if (bgMusic) {
    bgMusic.addEventListener("loadedmetadata", () => {
      timeDisplay.textContent = `0:00 / ${formatTime(bgMusic.duration)}`;
    });

    bgMusic.addEventListener("timeupdate", () => {
      if (bgMusic.duration && !isNaN(bgMusic.duration)) {
        const percent = (bgMusic.currentTime / bgMusic.duration) * 100;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (timeDisplay)
          timeDisplay.textContent = `${formatTime(bgMusic.currentTime)} / ${formatTime(bgMusic.duration)}`;
      }
    });

    bgMusic.addEventListener("error", () => {
      console.warn("[Audio] Could not load song from assets/audio/Song.mp3");
    });
  }

  if (audioToggleBtn && bgMusic) {
    audioToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (bgMusic.paused) {
        bgMusic
          .play()
          .then(() => updateAudioUI(true))
          .catch((err) => console.warn(err));
      } else {
        bgMusic.pause();
        updateAudioUI(false);
      }
    });
  }

  if (progressBar && bgMusic) {
    progressBar.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = progressBar.getBoundingClientRect();
      const clickRatio = (e.clientX - rect.left) / rect.width;
      if (bgMusic.duration) {
        bgMusic.currentTime = clickRatio * bgMusic.duration;
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. WELCOME GATE DISMISSAL & AUTO-START
     ------------------------------------------------------------------------ */
  const welcomeGate = document.getElementById("welcomeGate");
  const gateBtn = document.getElementById("gateClickBtn");

  if (gateBtn && welcomeGate) {
    gateBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      // Burst gold sparkles on button press
      spawnSparkles(e.clientX, e.clientY, 28);

      // Start Background Music within user gesture
      if (bgMusic) {
        bgMusic.load();
        bgMusic
          .play()
          .then(() => {
            updateAudioUI(true);
          })
          .catch((err) => {
            console.warn("Audio unlock prevented:", err);
          });
      }

      // Start Carousel Slideshow
      carouselStarted = true;
      slideStartTime = Date.now();

      const firstItem = mediaSlides[currentSlideIndex];
      if (firstItem.type === "video" && carouselVideo) {
        carouselVideo.play().catch(() => {});
      }

      cancelAnimationFrame(slideTimerAnimFrame);
      slideTimerAnimFrame = requestAnimationFrame(stepProgress);

      // Fade out and remove gate
      welcomeGate.classList.add("fade-out");
      setTimeout(() => {
        welcomeGate.style.display = "none";
      }, 500);
    });
  }
});
