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

    // Speech Synthesis Engine for Guided Voice Ceremony Tour
    speakText(text, onEnd) {
        if (!('speechSynthesis' in window)) {
            if (onEnd) onEnd();
            return;
        }

        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            utterance.volume = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang && v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('David')));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = () => {
                if (onEnd) onEnd();
            };

            utterance.onerror = () => {
                if (onEnd) onEnd();
            };

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            if (onEnd) onEnd();
        }
    }

    startCeremonyVoiceTour(onStepCallback, onScrollToEventsCallback, onScrollToTopCallback, onCursorMoveCallback) {
        const tourSteps = [
            {
                speech: "TECH MANTHAN 6.0 — DIVIDED BY ZERO, UNITED BY ONE.",
                display: "🚀 TECH MANTHAN 6.0 — DIVIDED BY ZERO, UNITED BY ONE.",
                cursor: { x: 50, y: 25, label: "TECH MANTHAN 6.0" },
                delay: 1000
            },
            {
                speech: "Step 3: Unveil Website and Smooth Scroll down to the Events Directory.",
                display: "📜 STEP 3: UNVEIL WEBSITE & SMOOTH SCROLL TO EVENTS DIRECTORY",
                triggerScrollEvents: true,
                cursor: { x: 50, y: 40, label: "EVENTS DIRECTORY" },
                delay: 1200
            },
            {
                speech: "1. Coding: Create your own world. Solve algorithmic puzzles and write clean code to win the ultimate prize.",
                display: "1. 🎮 Coding: \"Create your own world. Solve algorithmic puzzles and write clean code to win the ultimate prize.\"",
                cursor: { x: 28, y: 38, label: "1. 🎮 CODING" },
                delay: 800
            },
            {
                speech: "2. Group Dance: Your time to shine. Showcase technical skits, digital presentations, or creative dances.",
                display: "2. 💃 Group Dance: \"Your time to shine. Showcase technical skits, digital presentations, or creative dances.\"",
                cursor: { x: 72, y: 38, label: "2. 💃 GROUP DANCE" },
                delay: 800
            },
            {
                speech: "3. Gaming: Show the spirit. Compete head-to-head in competitive multiplayer tournaments.",
                display: "3. 🕹️ Gaming: \"Show the spirit. Compete head-to-head in competitive multiplayer tournaments.\"",
                cursor: { x: 28, y: 72, label: "3. 🕹️ GAMING" },
                delay: 800
            },
            {
                speech: "4. Best I T Manager: Corporate tech survival. Test your management, crisis resolution, and executive pitching skills.",
                display: "4. 👔 Best IT Manager: \"Corporate tech survival. Test your management, crisis resolution, and executive pitching skills.\"",
                cursor: { x: 72, y: 72, label: "4. 👔 BEST IT MANAGER" },
                delay: 800
            },
            {
                speech: "Detailed guidelines will be announced later. All the best to all teams!",
                display: "Step 5: Concluding Announcement 🔊 \"Detailed guidelines will be announced later. All the best to all teams!\"",
                triggerScrollTop: true,
                cursor: { x: 50, y: 20, label: "CONCLUDING ANNOUNCEMENT" },
                delay: 1500
            }
        ];

        let currentStep = 0;

        const processNextStep = () => {
            if (currentStep >= tourSteps.length) return;
            const step = tourSteps[currentStep];

            if (onStepCallback) {
                onStepCallback(step.display);
            }

            if (step.triggerScrollEvents && onScrollToEventsCallback) {
                onScrollToEventsCallback();
            }

            if (step.triggerScrollTop && onScrollToTopCallback) {
                onScrollToTopCallback();
            }

            if (step.cursor && onCursorMoveCallback) {
                onCursorMoveCallback(step.cursor.x, step.cursor.y, step.cursor.label);
            }

            this.speakText(step.speech, () => {
                currentStep++;
                if (currentStep < tourSteps.length) {
                    setTimeout(processNextStep, step.delay || 800);
                }
            });
        };

        if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                setTimeout(processNextStep, 500);
            };
        } else {
            setTimeout(processNextStep, 500);
        }
    }
}

window.SciFiAudioEngine = SciFiAudioEngine;
