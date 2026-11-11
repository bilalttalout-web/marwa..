/**
 * audio.js - Romantic Sound Manager with MP3 and Web Audio API Synth Fallback
 */

class RomanticAudioManager {
  constructor() {
    this.audioElement = new Audio('assets/audio/romantic-melody.mp3');
    this.audioElement.loop = true;
    this.audioElement.preload = 'auto';
    this.isPlaying = false;
    this.isMuted = false;
    this.synthActive = false;
    this.audioContext = null;
    this.synthInterval = null;

    this.controllerBtn = document.getElementById('audio-controller');
    this.initEvents();
  }

  initEvents() {
    if (this.controllerBtn) {
      this.controllerBtn.addEventListener('click', () => {
        this.toggle();
      });
    }

    // Attempt to handle media errors or local file restrictions gracefully
    this.audioElement.addEventListener('error', (e) => {
      console.warn('Audio element error, enabling Web Audio synthesizer fallback', e);
      if (this.isPlaying) {
        this.startSynthMelody();
      }
    });
  }

  play() {
    this.isPlaying = true;
    this.isMuted = false;
    this.updateUI();

    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Success
      }).catch(err => {
        console.warn('Autoplay prevented or file issue, starting fallback synth:', err);
        this.startSynthMelody();
      });
    }
  }

  pause() {
    this.isPlaying = false;
    this.updateUI();
    this.audioElement.pause();
    this.stopSynthMelody();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updateUI() {
    if (!this.controllerBtn) return;
    if (this.isPlaying) {
      this.controllerBtn.classList.add('playing');
      const label = this.controllerBtn.querySelector('.audio-label span:not(.music-note)');
      if (label) label.textContent = 'Music: On';
    } else {
      this.controllerBtn.classList.remove('playing');
      const label = this.controllerBtn.querySelector('.audio-label span:not(.music-note)');
      if (label) label.textContent = 'Music: Off';
    }
  }

  // Romantic Web Audio API fallback in case MP3 file playback is blocked by policy or environment
  startSynthMelody() {
    if (this.synthActive) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.synthActive = true;

      // Romantic music box chord progression: Eb - Gm - Ab - Bb (Chopin Nocturne style)
      // Frequencies in Hz:
      // Eb4: 311.13, G4: 392.00, Bb4: 466.16, D5: 587.33, Eb5: 622.25, F5: 698.46, G5: 783.99, C5: 523.25
      const notes = [
        { f: 311.13, d: 0.8 }, { f: 392.00, d: 0.8 }, { f: 466.16, d: 1.2 }, { f: 587.33, d: 0.8 },
        { f: 523.25, d: 1.5 }, { f: 466.16, d: 0.8 }, { f: 392.00, d: 1.0 }, { f: 349.23, d: 1.2 },
        { f: 311.13, d: 0.8 }, { f: 466.16, d: 0.8 }, { f: 622.25, d: 1.5 }, { f: 587.33, d: 0.8 },
        { f: 523.25, d: 1.0 }, { f: 466.16, d: 1.0 }, { f: 392.00, d: 1.2 }, { f: 466.16, d: 2.0 }
      ];

      let noteIndex = 0;
      const playNextNote = () => {
        if (!this.synthActive || !this.isPlaying) return;
        const current = notes[noteIndex];
        this.playMusicBoxNote(current.f, current.d);
        noteIndex = (noteIndex + 1) % notes.length;
        this.synthInterval = setTimeout(playNextNote, current.d * 750);
      };

      playNextNote();
    } catch (e) {
      console.error('Synth initialization failed', e);
    }
  }

  playMusicBoxNote(frequency, duration) {
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Warm envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  stopSynthMelody() {
    this.synthActive = false;
    if (this.synthInterval) {
      clearTimeout(this.synthInterval);
      this.synthInterval = null;
    }
  }
}

// Global initialization
window.romanticAudio = null;
document.addEventListener('DOMContentLoaded', () => {
  window.romanticAudio = new RomanticAudioManager();
});

