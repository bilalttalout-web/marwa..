/**
 * confetti.js - Romantic Celebration Confetti System
 * Emits colorful rose-gold, pink, and heart-shaped confetti across the screen.
 */

class RomanticConfetti {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.confettiPieces = [];
    this.isActive = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio || 1;
    this.canvas.height = this.height * window.devicePixelRatio || 1;
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  fire(options = {}) {
    const count = options.count || (window.innerWidth < 768 ? 60 : 120);
    const colors = ['#ff4d6d', '#ff758c', '#ff7eb3', '#f4b6a9', '#fcd34d', '#ffffff', '#e11d48'];

    for (let i = 0; i < count; i++) {
      const isHeart = Math.random() < 0.4;
      this.confettiPieces.push({
        x: options.x !== undefined ? options.x : Math.random() * this.width,
        y: options.y !== undefined ? options.y : Math.random() * this.height * 0.4,
        size: Math.random() * (isHeart ? 14 : 10) + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        isHeart: isHeart,
        vx: (Math.random() - 0.5) * 8 + (options.vx || 0),
        vy: -(Math.random() * 8 + 3),
        gravity: 0.18 + Math.random() * 0.08,
        drag: 0.98,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.008 + 0.005
      });
    }

    if (!this.isActive) {
      this.isActive = true;
      requestAnimationFrame(this.animate);
    }
  }

  drawHeart(ctx, x, y, size, color, opacity, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
    ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawRect(ctx, x, y, size, color, opacity, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 3, size, size * 0.7);
    ctx.restore();
  }

  animate() {
    if (!this.isActive) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.confettiPieces.length - 1; i >= 0; i--) {
      const p = this.confettiPieces[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > this.height + 50) {
        this.confettiPieces.splice(i, 1);
      } else {
        if (p.isHeart) {
          this.drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
        } else {
          this.drawRect(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
        }
      }
    }

    if (this.confettiPieces.length > 0) {
      requestAnimationFrame(this.animate);
    } else {
      this.isActive = false;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

// Global initialization
window.romanticConfetti = null;
document.addEventListener('DOMContentLoaded', () => {
  window.romanticConfetti = new RomanticConfetti('confetti-canvas');
});

