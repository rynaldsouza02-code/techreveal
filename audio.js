/**
 * Tech Manthan 6.0 - Web Audio Sci-Fi Synthesizer Engine
 * Zero-dependency, purely procedural Web Audio API sound designer.
 */

class SciFiAudioEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.ambientOsc = null;
        this.ambientGain = null;
        this.scanOsc = null;
        this.scanGain = null;
        this.isScanning = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            if (this.ambientGain) this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } else {
            if (this.ambientGain) this.ambientGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        }
        return this.muted;
    }

    startAmbientDrone() {
        if (this.muted) return;
        this.init();
        if (!this.ctx || this.ambientOsc) return;

        try {
            this.ambientOsc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            this.ambientGain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            this.ambientOsc.type = 'sawtooth';
            this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 note

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(220, this.ctx.currentTime);

            this.ambientGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

            this.ambientOsc.connect(filter);
            osc2.connect(filter);
            filter.connect(this.ambientGain);
            this.ambientGain.connect(this.ctx.destination);

            this.ambientOsc.start();
            osc2.start();
        } catch (e) {
            console.warn("Audio init deferred until user interaction.");
        }
    }

    playScanChirp(progress = 0) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Frequency scales up with scan progress (300Hz -> 1800Hz)
            const baseFreq = 380 + (progress * 1200);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {}
    }

    playLockOnSound() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now); // A5
            osc.frequency.setValueAtTime(1320, now + 0.06); // E6
            osc.frequency.setValueAtTime(1760, now + 0.12); // A6

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.26);
        } catch (e) {}
    }

    playGrandRevealFanfare() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // 1. Sub-bass drop / Impact rumble
            const subOsc = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(160, now);
            subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

            subGain.gain.setValueAtTime(0.4, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            subOsc.connect(subGain);
            subGain.connect(this.ctx.destination);
            subOsc.start(now);
            subOsc.stop(now + 1.9);

            // 2. High energy sci-fi cyber chord arpeggio (C - G - C - E - G - C)
            const notes = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, index) => {
                const noteTime = now + (index * 0.12);
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, noteTime);

                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(freq * 1.5, noteTime);
                filter.Q.setValueAtTime(3, noteTime);

                gain.gain.setValueAtTime(0.18, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.4);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 1.5);
            });

            // 3. Shimmering high frequency reveal burst
            const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.8, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseBuffer.length; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(3500, now);
            noiseFilter.frequency.linearRampToValueAtTime(8000, now + 0.8);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.15, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            whiteNoise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            whiteNoise.start(now);
            whiteNoise.stop(now + 0.85);

        } catch (e) {
            console.error("Audio error:", e);
        }
    }
}

window.SciFiAudioEngine = SciFiAudioEngine;
