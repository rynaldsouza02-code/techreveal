/**
 * Tech Manthan 6.0 - Biometric Palm Scanner & Reveal Controller
 * Handles Camera Feed, Hand/Palm Vision Detection, Telemetry & Reveal Transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Core DOM Elements
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('biometric-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const telemetryStatus = document.getElementById('telemetry-status');
    const telemetryHash = document.getElementById('telemetry-hash');
    const palmGuide = document.querySelector('.palm-target-overlay');
    const officialLogo = document.getElementById('official-logo');
    const stageGrid = document.querySelector('.stage-grid');
    const revealUnveiled = document.querySelector('.reveal-unveiled-stage');
    const flashOverlay = document.querySelector('.ceremony-flash-overlay');

    // Controls
    const manualScanBtn = document.getElementById('manualScanBtn');
    const instantRevealBtn = document.getElementById('instantRevealBtn');
    const flipCameraBtn = document.getElementById('flipCameraBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const replayCeremonyBtn = document.getElementById('replayCeremonyBtn');
    const previewPortalBtn = document.getElementById('previewPortalBtn');
    const closePortalModalBtn = document.getElementById('closePortalModalBtn');
    const portalModal = document.getElementById('portalModal');

    // Engines
    const audio = new window.SciFiAudioEngine();
    const particles = new window.ParticleEngine('particle-canvas');

    // State Variables
    let currentStream = null;
    let facingMode = 'user';
    let isCameraActive = false;
    let scanProgress = 0; // 0 to 100
    let isScanning = false;
    let isHoldingManual = false;
    let isRevealed = false;
    let lastScanChirpTime = 0;
    let handsDetector = null;
    let handDetected = false;
    let handLandmarks = null;
    let manualScanInterval = null;
    let lastScanTimestamp = null;
    const TOTAL_SCAN_DURATION_MS = 2000; // Palm reading duration: Exactly 2 seconds

    // Initialize Audio on First User Interaction
    const unlockAudio = () => {
        audio.startAmbientDrone();
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    // =========================================================================
    // CAMERA INITIALIZATION & MANAGEMENT
    // =========================================================================
    async function startCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        try {
            const constraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            currentStream = stream;
            video.srcObject = stream;
            await video.play();
            isCameraActive = true;
            resizeCanvas();
            initMediaPipeHands();
            console.log("[+] Camera initialized successfully.");

            // Smoothly scroll down to Biometric Palm Sensor on first page load
            setTimeout(() => {
                const scannerCard = document.querySelector('.scanner-card');
                if (scannerCard) {
                    scannerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        } catch (err) {
            console.warn("[-] Camera access not granted or unavailable. Using simulated optical scanner.", err);
            isCameraActive = false;
            if (telemetryStatus) telemetryStatus.innerText = "SENSOR: TOUCH / CLICK SCANNER READY (2s SCAN)";
        }
    }

    function resizeCanvas() {
        if (!canvas || !video) return;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
    }

    if (flipCameraBtn) {
        flipCameraBtn.addEventListener('click', () => {
            facingMode = facingMode === 'user' ? 'environment' : 'user';
            startCamera();
        });
    }

    // =========================================================================
    // COMPUTER VISION & MEDIAPIPE HAND TRACKING
    // =========================================================================
    // High-speed offscreen canvas for optical hand detection
    const fallbackCanvas = document.createElement('canvas');
    const fallbackCtx = fallbackCanvas.getContext('2d', { willReadFrequently: true });
    let isProcessingFrame = false;
    let isPalmScanLocked = false; // Scan process lock-on state

    function initMediaPipeHands() {
        // Start continuous optical dermal detector loop as zero-latency parallel engine
        requestAnimationFrame(processOpticalFallback);

        if (typeof window.Hands === 'undefined') {
            return;
        }

        try {
            handsDetector = new window.Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            // Fast, sensitive hand tracking model
            handsDetector.setOptions({
                maxNumHands: 1,
                modelComplexity: 0,
                minDetectionConfidence: 0.25,
                minTrackingConfidence: 0.25
            });

            handsDetector.onResults(onHandResults);

            const sendFrames = async () => {
                if (!isRevealed && isCameraActive && video.readyState >= 2 && !isProcessingFrame) {
                    isProcessingFrame = true;
                    try {
                        await handsDetector.send({ image: video });
                    } catch (err) {}
                    isProcessingFrame = false;
                }
                requestAnimationFrame(sendFrames);
            };
            sendFrames();
        } catch (e) {
            console.warn("MediaPipe Hands CDN load warning. Using optical engine.", e);
        }
    }

    function onHandResults(results) {
        if (!ctx || isRevealed) return;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            handDetected = true;
            handLandmarks = results.multiHandLandmarks[0];
            drawCyberHand(handLandmarks);
            
            // Once palm is shown, trigger lock-on scan process
            triggerPalmScanLockOn();
        } else {
            handDetected = false;
            handLandmarks = null;
        }
    }

    // Draw futuristic neon cyber skeleton on palm
    function drawCyberHand(landmarks) {
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;

        // Hand Connections (21 points)
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [5, 9], [9, 10], [10, 11], [11, 12], // Middle
            [9, 13], [13, 14], [14, 15], [15, 16], // Ring
            [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [0, 17] // Palm Base
        ];

        // Draw Lines
        ctx.save();
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 12;

        connections.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            ctx.beginPath();
            ctx.moveTo(p1.x * w, p1.y * h);
            ctx.lineTo(p2.x * w, p2.y * h);
            ctx.stroke();
        });

        // Draw Nodes
        landmarks.forEach((p, index) => {
            ctx.beginPath();
            const r = (index === 0 || index === 9) ? 7 : 4;
            ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
            ctx.fillStyle = index % 4 === 0 ? '#39ff14' : '#bc13fe';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.fill();
        });

        // Palm Center Energy Vortex
        const palmCenter = landmarks[9];
        ctx.beginPath();
        ctx.arc(palmCenter.x * w, palmCenter.y * h, 14 + Math.sin(Date.now() * 0.01) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.restore();
    }

    // Optical HUD reticle rendering loop (no automatic false triggers)
    function processOpticalFallback() {
        if (!isRevealed && isCameraActive && video.readyState >= 2) {
            if (!handDetected && ctx) {
                try {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawSimulatedCyberHand();
                } catch (e) {}
            }
        }
        requestAnimationFrame(processOpticalFallback);
    }

    function drawSimulatedCyberHand() {
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.save();
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 12;

        const pulse = Math.sin(Date.now() * 0.01) * 6;
        ctx.beginPath();
        ctx.arc(cx, cy, 65 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 40 - pulse / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#39ff14';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // =========================================================================
    // PALM SCAN LOCK-ON & CONTINUOUS 2-SECOND PROGRESSION ENGINE
    // =========================================================================
    function triggerPalmScanLockOn() {
        if (isRevealed || isPalmScanLocked) return;
        isPalmScanLocked = true;
        lastScanTimestamp = performance.now();
        audio.init();

        if (palmGuide) palmGuide.classList.add('scanning');
        if (officialLogo) officialLogo.classList.add('scanning-pulse');
        particles.setVortex(true, 1.8);

        console.log("[+] PALM SHOWN // LOCKING ON 2-SECOND SCAN PROCESS!");
        runContinuousScanLoop();
    }

    function runContinuousScanLoop() {
        if (isRevealed || !isPalmScanLocked) return;

        const now = performance.now();
        const delta = Math.min(now - (lastScanTimestamp || now), 100);
        lastScanTimestamp = now;

        // Progress smoothly to 100% in 2000ms
        const increment = (delta / TOTAL_SCAN_DURATION_MS) * 100;
        scanProgress = Math.min(100, scanProgress + increment);
        updateProgressUI();

        // Audio feedback chirps
        const timeNow = Date.now();
        if (timeNow - lastScanChirpTime > 120) {
            audio.playScanChirp(scanProgress / 100);
            lastScanChirpTime = timeNow;
        }

        if (scanProgress < 100) {
            requestAnimationFrame(runContinuousScanLoop);
        } else {
            triggerGrandReveal();
        }
    }

    function updateProgressUI() {
        const rounded = Math.round(scanProgress);
        const elapsedSec = ((scanProgress / 100) * 2.0).toFixed(1);
        if (progressFill) progressFill.style.width = `${rounded}%`;
        if (progressPercent) progressPercent.innerText = `${rounded}%`;

        // Telemetry readout
        if (telemetryStatus) {
            if (!isPalmScanLocked && rounded === 0) {
                telemetryStatus.innerText = "WAITING FOR PALM... // SHOW PALM TO SCAN";
            } else if (rounded < 35) {
                telemetryStatus.innerText = `PALM DETECTED // SCANNING TOPOLOGY... [${elapsedSec}s / 2.0s]`;
            } else if (rounded < 70) {
                telemetryStatus.innerText = `DECRYPTING BCA 6.0 KEY... [${elapsedSec}s / 2.0s]`;
            } else if (rounded < 100) {
                telemetryStatus.innerText = `AUTHENTICATING SIGNATURE... [${elapsedSec}s / 2.0s]`;
            } else {
                telemetryStatus.innerText = "PALM VERIFIED // UNLOCKING WEBSITE!";
            }
        }

        if (telemetryHash) {
            telemetryHash.innerText = `HASH: 0x${Math.floor(Math.sin(Date.now()) * 10000000).toString(16).toUpperCase().padStart(8, '0')}`;
        }
    }

    // Manual Touch Button Trigger
    function startManualHold() {
        if (isRevealed) return;
        triggerPalmScanLockOn();
    }

    function stopManualHold() {
        // Maintained for touch listeners
    }

    if (manualScanBtn) {
        manualScanBtn.addEventListener('mousedown', startManualHold);
        manualScanBtn.addEventListener('mouseup', stopManualHold);
        manualScanBtn.addEventListener('mouseleave', stopManualHold);
        manualScanBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startManualHold(); });
        manualScanBtn.addEventListener('touchend', stopManualHold);
    }

    if (instantRevealBtn) {
        instantRevealBtn.addEventListener('click', () => {
            audio.init();
            scanProgress = 100;
            updateProgressUI();
            triggerGrandReveal();
        });
    }

    // Keyboard Shortcuts for Stage Presentations
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            if (!isRevealed) {
                e.preventDefault();
                scanProgress = 100;
                updateProgressUI();
                triggerGrandReveal();
            }
        } else if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen();
        } else if (e.key === 'm' || e.key === 'M') {
            toggleAudioMute();
        }
    });

    // =========================================================================
    // GRAND REVEAL & LOGO ZOOM IN / ZOOM OUT SEQUENCE
    // =========================================================================
    async function triggerGrandReveal() {
        if (isRevealed) return;
        isRevealed = true;

        console.log("[+] 2-SECOND PALM SCAN COMPLETED! REVEALING WEBSITE!");

        // 1. Audio Fanfare & Lock Sound
        audio.playLockOnSound();
        setTimeout(() => audio.playGrandRevealFanfare(), 150);

        // 2. Logo Zoom In / Out Explosion Animation
        if (officialLogo) {
            officialLogo.classList.remove('scanning-pulse');
            officialLogo.classList.add('reveal-zoom-explosion');
        }

        // 3. Shockwave & Particle Explosion
        const rect = officialLogo ? officialLogo.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
        const logoCenterX = rect.left + rect.width / 2;
        const logoCenterY = rect.top + rect.height / 2;

        particles.createRevealExplosion(logoCenterX, logoCenterY);

        // 4. White Flash Transition
        if (flashOverlay) {
            flashOverlay.classList.add('active');
            setTimeout(() => flashOverlay.classList.remove('active'), 250);
        }

        // 5. Notify Backend API
        try {
            await fetch('/api/verify-palm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confidence: 0.999, landmarks_count: 21, scan_duration_ms: 2000 })
            });
        } catch (e) {
            console.log("Backend offline or local preview mode.");
        }

        // 6. Fast transition (600ms) to reveal home page, speak motto, and smooth auto-scroll to Events Directory
        setTimeout(() => {
            if (stageGrid) stageGrid.style.display = 'none';
            const topBar = document.querySelector('.top-hud-bar');
            if (topBar) topBar.style.display = 'none';
            const collegeBadge = document.querySelector('.college-header-badge');
            if (collegeBadge) collegeBadge.style.display = 'none';

            if (revealUnveiled) {
                revealUnveiled.style.display = 'flex';
            }

            const websiteContainer = document.querySelector('.revealed-website-container');
            const revealedIframe = document.getElementById('revealedIframe');

            if (websiteContainer) {
                websiteContainer.scrollTo({ top: 0, behavior: 'auto' });
            }

            // Speak motto announcement out loud and execute smooth auto-scroll
            const performAutoScroll = () => {
                setTimeout(() => {
                    if (websiteContainer) {
                        websiteContainer.scrollTo({ top: 650, behavior: 'smooth' });
                    }
                    if (revealedIframe) {
                        try {
                            if (revealedIframe.contentWindow) {
                                revealedIframe.contentWindow.scrollTo({ top: 650, behavior: 'smooth' });
                            }
                        } catch (e) {}
                    }
                }, 500);
            };

            if (audio) {
                audio.speakText("TECH MANTHAN 6.0 — DIVIDED BY ZERO, UNITED BY ONE.", performAutoScroll);
            } else {
                performAutoScroll();
            }
        }, 600);
    }

    // =========================================================================
    // REPLAY & RESET CEREMONY
    // =========================================================================
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'replayCeremonyBtn') {
            isRevealed = false;
            isPalmScanLocked = false;
            scanProgress = 0;
            updateProgressUI();

            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            const subtitleBar = document.getElementById('ceremonySubtitleBar');
            if (subtitleBar) subtitleBar.style.display = 'none';
            const virtualCursor = document.getElementById('virtualCursor');
            if (virtualCursor) virtualCursor.classList.remove('active');
            const revealedIframe = document.getElementById('revealedIframe');
            if (revealedIframe) {
                revealedIframe.style.transform = 'translateY(0)';
                try { if (revealedIframe.contentWindow) revealedIframe.contentWindow.scrollTo({ top: 0 }); } catch (err) {}
            }

            if (revealUnveiled) revealUnveiled.style.display = 'none';
            const topBar = document.querySelector('.top-hud-bar');
            if (topBar) topBar.style.display = 'flex';
            const collegeBadge = document.querySelector('.college-header-badge');
            if (collegeBadge) collegeBadge.style.display = 'inline-flex';
            if (stageGrid) stageGrid.style.display = 'flex';

            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }

            if (officialLogo) {
                officialLogo.classList.remove('reveal-zoom-explosion', 'scanning-pulse');
            }

            try {
                fetch('/api/reset-ceremony', { method: 'POST' });
            } catch (err) {}
        }
    });

    // =========================================================================
    // LIVE PREVIEW MODAL & CONTROLS
    // =========================================================================
    if (previewPortalBtn && portalModal) {
        previewPortalBtn.addEventListener('click', () => {
            portalModal.classList.add('active');
        });
    }

    if (closePortalModalBtn && portalModal) {
        closePortalModalBtn.addEventListener('click', () => {
            portalModal.classList.remove('active');
        });
    }

    // Fullscreen Toggle
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    }
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Sound Toggle
    function toggleAudioMute() {
        const isMuted = audio.toggleMute();
        if (soundToggleBtn) {
            soundToggleBtn.innerHTML = isMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
        }
    }
    if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleAudioMute);

    // =========================================================================
    // WEBSOCKET SYNC (STAGE PROJECTOR <-> VIP TABLET)
    // =========================================================================
    function initWebSocketSync() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/ceremony`;
        try {
            const ws = new WebSocket(wsUrl);
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.event === 'PORTAL_REVEALED' && !isRevealed) {
                    scanProgress = 100;
                    updateProgressUI();
                    triggerGrandReveal();
                } else if (msg.event === 'CEREMONY_RESET' && isRevealed) {
                    if (replayCeremonyBtn) replayCeremonyBtn.click();
                }
            };
        } catch (e) {}
    }

    // Start Everything
    startCamera();
    initWebSocketSync();
});
