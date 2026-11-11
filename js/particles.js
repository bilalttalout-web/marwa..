/**
 * particles.js - Romantic Canvas Particle & Floating Hearts Engine
 * Creates floating hearts, glittering stars, soft bokeh orbs, and interactive touch bursts.
 */

class RomanticParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.sparkles = [];
    this.bursts = [];
    this.maxParticles = window.innerWidth < 768 ? 35 : 60;
    this.mouseX = null;
    this.mouseY = null;
    this.isHovering = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Interactive mouse / touch burst
    window.addEventListener('pointerdown', (e) => this.createBurst(e.clientX, e.clientY));
    window.addEventListener('pointermove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (Math.random() < 0.25) {
        this.addSparkle(e.clientX, e.clientY);
      }
    });

    // Populate initial particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio || 1;
    this.canvas.height = this.height * window.devicePixelRatio || 1;
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  createParticle(randomY = false) {
    const isHeart = Math.random() < 0.65; // 65% hearts, 35% stars/bokeh
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 20,
      size: Math.random() * (isHeart ? 16 : 8) + 8,
      speedY: Math.random() * 0.8 + 0.4,
      speedX: (Math.random() - 0.5) * 0.6,
      opacity: Math.random() * 0.5 + 0.2,
      rotation: (Math.random() - 0.5) * 0.4,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      isHeart: isHeart,
      color: this.getRandomColor(),
      wobbleSpeed: Math.random() * 0.03 + 0.01,
      wobbleOffset: Math.random() * Math.PI * 2
    };
  }

  getRandomColor() {
    const colors = [
      'rgba(255, 105, 180, ', // hot pink
      'rgba(255, 182, 193, ', // light pink
      'rgba(244, 182, 169, ', // rose gold
      'rgba(225, 29, 72, ',   // rose red
      'rgba(192, 132, 252, ', // soft purple
      'rgba(255, 215, 0, '    // gold sparkle
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  addSparkle(x, y) {
    this.sparkles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      size: Math.random() * 4 + 2,
      opacity: 1,
      speedY: (Math.random() - 0.5) * 1.5,
      speedX: (Math.random() - 0.5) * 1.5,
      decay: 0.03,
      color: 'rgba(255, 240, 245, '
    });
  }

  createBurst(x, y) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4);
      const speed = Math.random() * 3 + 2;
      this.bursts.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: Math.random() * 12 + 8,
        opacity: 1,
        decay: Math.random() * 0.02 + 0.015,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        color: this.getRandomColor(),
        isHeart: true
      });
    }
  }

  drawHeart(ctx, x, y, size, color, opacity, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = `${color}${opacity})`;
    ctx.shadowColor = `${color}0.8)`;
    ctx.shadowBlur = size * 0.6;
    
    // Draw Bezier Heart
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    
    // Left curve
    ctx.bezierCurveTo(
      -size / 2, -size / 2, 
      -size, size / 3, 
      0, size
    );
    // Right curve
    ctx.bezierCurveTo(
      size, size / 3, 
      size / 2, -size / 2, 
      0, topCurveHeight
    );
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawStar(ctx, x, y, size, color, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `${color}${opacity})`;
    ctx.shadowColor = `${color}0.9)`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update & draw background particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y -= p.speedY;
      p.wobbleOffset += p.wobbleSpeed;
      p.x += Math.sin(p.wobbleOffset) * 0.5 + p.speedX;
      p.rotation += p.rotationSpeed;

      // Wrap around top
      if (p.y < -30) {
        this.particles[i] = this.createParticle(false);
      }

      if (p.isHeart) {
        this.drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      } else {
        this.drawStar(this.ctx, p.x, p.y, p.size, p.color, p.opacity);
      }
    }

    // Update & draw interactive sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.speedX;
      s.y += s.speedY;
      s.opacity -= s.decay;

      if (s.opacity <= 0) {
        this.sparkles.splice(i, 1);
      } else {
        this.drawStar(this.ctx, s.x, s.y, s.size, s.color, s.opacity);
      }
    }

    // Update & draw touch bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.05; // gravity
      b.opacity -= b.decay;
      b.rotation += b.rotationSpeed;

      if (b.opacity <= 0) {
        this.bursts.splice(i, 1);
      } else {
        this.drawHeart(this.ctx, b.x, b.y, b.size, b.color, b.opacity, b.rotation);
      }
    }

    requestAnimationFrame(this.animate);
  }
}

// Global initialization
window.romanticParticles = null;
document.addEventListener('DOMContentLoaded', () => {
  window.romanticParticles = new RomanticParticles('particles-canvas');
});

