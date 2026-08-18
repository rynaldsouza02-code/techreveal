/**
 * Tech Manthan 6.0 - 3D Cosmic Galaxy Universe & Particle Engine
 */

class ParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.stars3D = [];
        this.nebulaClouds = [];
        this.comets = [];
        this.shockwaves = [];
        this.vortexActive = false;
        this.vortexIntensity = 1;
        this.width = 0;
        this.height = 0;

        // Mouse Parallax coordinates
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        this.galaxyAngle = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        this.init3DGalaxy();
        this.initNebulaClouds();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    handleMouseMove(e) {
        this.targetMouseX = (e.clientX - this.width / 2) * 0.08;
        this.targetMouseY = (e.clientY - this.height / 2) * 0.08;
    }

    init3DGalaxy() {
        const starCount = 380;
        const colors = ['#00f3ff', '#bc13fe', '#39ff14', '#0099ff', '#ffffff', '#ff00d0', '#7df9ff'];

        // 3D Spiral Galaxy Arms + Deep Universe Stars
        for (let i = 0; i < starCount; i++) {
            const isGalaxyArm = i < starCount * 0.7;

            if (isGalaxyArm) {
                // Logarithmic spiral arms
                const armIndex = i % 4; // 4 main spiral arms
                const armAngleOffset = (armIndex * Math.PI) / 2;
                const distRatio = Math.pow(Math.random(), 1.5);
                const distance = distRatio * (Math.min(this.width, this.height) * 0.55) + 30;
                const angle = distance * 0.008 + armAngleOffset + (Math.random() - 0.5) * 0.45;
                const z = (Math.random() - 0.5) * 400; // 3D depth Z-axis

                this.stars3D.push({
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance * 0.45, // Flattened 3D disk projection
                    z: z,
                    baseDistance: distance,
                    baseAngle: angle,
                    radius: Math.random() * 2.2 + 0.6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: Math.random() * 0.8 + 0.2,
                    speed: (0.002 + (1 - distance / (this.width * 0.5)) * 0.004),
                    isArm: true
                });
            } else {
                // Background deep universe starfield
                this.stars3D.push({
                    x: (Math.random() - 0.5) * this.width * 1.8,
                    y: (Math.random() - 0.5) * this.height * 1.8,
                    z: (Math.random() - 0.5) * 600,
                    radius: Math.random() * 1.5 + 0.3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: Math.random() * 0.6 + 0.1,
                    speed: Math.random() * 0.001 + 0.0005,
                    isArm: false
                });
            }
        }
    }

    initNebulaClouds() {
        const cloudColors = [
            'rgba(0, 243, 255, 0.07)',
            'rgba(188, 19, 254, 0.08)',
            'rgba(0, 153, 255, 0.06)',
            'rgba(57, 255, 20, 0.04)'
        ];
        for (let i = 0; i < 6; i++) {
            this.nebulaClouds.push({
                x: (Math.random() - 0.5) * this.width * 0.8,
                y: (Math.random() - 0.5) * this.height * 0.8,
                radius: Math.random() * 280 + 200,
                color: cloudColors[i % cloudColors.length],
                angle: Math.random() * Math.PI * 2,
                speed: (Math.random() - 0.5) * 0.001
            });
        }
    }

    createComet() {
        if (Math.random() < 0.035 && this.comets.length < 3) {
            const startX = Math.random() * this.width;
            const startY = Math.random() * (this.height * 0.4);
            const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
            const speed = Math.random() * 14 + 10;
            this.comets.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                length: Math.random() * 120 + 80,
                alpha: 1,
                decay: 0.02,
                color: '#00f3ff'
            });
        }
    }

    createShockwave(x, y, color = '#00f3ff', maxRadius = 800) {
        this.shockwaves.push({
            x: x || this.width / 2,
            y: y || this.height / 2,
            radius: 5,
            maxRadius: maxRadius,
            color: color,
            alpha: 1,
            speed: 18,
            lineWidth: 6
        });
    }

    createRevealExplosion(x, y) {
        const cx = x || this.width / 2;
        const cy = y || this.height / 2;

        this.createShockwave(cx, cy, '#00f3ff', 1000);
        setTimeout(() => this.createShockwave(cx, cy, '#bc13fe', 1200), 150);
        setTimeout(() => this.createShockwave(cx, cy, '#ffffff', 900), 300);
        setTimeout(() => this.createShockwave(cx, cy, '#39ff14', 1100), 450);

        const burstCount = 200;
        const colors = ['#00f3ff', '#bc13fe', '#39ff14', '#ffffff', '#7df9ff'];
        for (let i = 0; i < burstCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 15 + 4;
            this.particles.push({
                x: cx,
                y: cy,
                radius: Math.random() * 3.5 + 1.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.008,
                isBurst: true
            });
        }
    }

    setVortex(active, intensity = 1) {
        this.vortexActive = active;
        this.vortexIntensity = intensity;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth mouse parallax interpolation
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        this.ctx.clearRect(0, 0, this.width, this.height);

        const cx = this.width / 2 + this.mouseX;
        const cy = this.height / 2 + this.mouseY;

        // 1. Render Deep Universe Nebula Gas Clouds
        this.nebulaClouds.forEach((cloud) => {
            cloud.angle += cloud.speed;
            const cloudX = cx + cloud.x + Math.cos(cloud.angle) * 40;
            const cloudY = cy + cloud.y + Math.sin(cloud.angle) * 40;

            const grad = this.ctx.createRadialGradient(cloudX, cloudY, 10, cloudX, cloudY, cloud.radius);
            grad.addColorStop(0, cloud.color);
            grad.addColorStop(0.6, cloud.color.replace(/0\.\d+/, '0.03'));
            grad.addColorStop(1, 'transparent');

            this.ctx.save();
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(cloudX, cloudY, cloud.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // 2. Supermassive Galactic Core Glow
        const coreGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 320);
        coreGrad.addColorStop(0, 'rgba(0, 243, 255, 0.18)');
        coreGrad.addColorStop(0.3, 'rgba(188, 19, 254, 0.12)');
        coreGrad.addColorStop(0.7, 'rgba(0, 153, 255, 0.04)');
        coreGrad.addColorStop(1, 'transparent');

        this.ctx.save();
        this.ctx.fillStyle = coreGrad;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 320, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // 3. Render 3D Rotating Galaxy Stars & Starfield
        this.stars3D.forEach((star) => {
            if (star.isArm) {
                const speedMult = this.vortexActive ? 4.5 * this.vortexIntensity : 1;
                star.baseAngle += star.speed * speedMult;

                // 3D Perspective Projection
                const focalLength = 600;
                const perspective = focalLength / (focalLength + star.z);

                const projectedX = cx + Math.cos(star.baseAngle) * star.baseDistance * perspective;
                const projectedY = cy + Math.sin(star.baseAngle) * star.baseDistance * 0.45 * perspective;
                const projectedRadius = Math.max(0.2, star.radius * perspective);

                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(projectedX, projectedY, projectedRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = star.color;
                this.ctx.globalAlpha = Math.min(1, star.alpha * perspective);
                this.ctx.shadowColor = star.color;
                this.ctx.shadowBlur = 8;
                this.ctx.fill();
                this.ctx.restore();
            } else {
                star.x += Math.cos(star.speed) * 0.3;
                star.y += Math.sin(star.speed) * 0.3;

                const starX = cx + star.x;
                const starY = cy + star.y;

                if (starX > 0 && starX < this.width && starY > 0 && starY < this.height) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.arc(starX, starY, star.radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = star.color;
                    this.ctx.globalAlpha = star.alpha + Math.sin(Date.now() * 0.002 + star.z) * 0.2;
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
        });

        // 4. Cosmic Comets / Shooting Stars
        this.createComet();
        for (let i = this.comets.length - 1; i >= 0; i--) {
            const comet = this.comets[i];
            comet.x += comet.vx;
            comet.y += comet.vy;
            comet.alpha -= comet.decay;

            if (comet.alpha <= 0 || comet.x > this.width || comet.y > this.height) {
                this.comets.splice(i, 1);
                continue;
            }

            const tailX = comet.x - comet.vx * 6;
            const tailY = comet.y - comet.vy * 6;

            const cometGrad = this.ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
            cometGrad.addColorStop(0, '#ffffff');
            cometGrad.addColorStop(0.3, comet.color);
            cometGrad.addColorStop(1, 'transparent');

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(comet.x, comet.y);
            this.ctx.lineTo(tailX, tailY);
            this.ctx.strokeStyle = cometGrad;
            this.ctx.lineWidth = 2.5;
            this.ctx.shadowColor = '#00f3ff';
            this.ctx.shadowBlur = 12;
            this.ctx.stroke();
            this.ctx.restore();
        }

        // 5. Render Burst Particles & Explosions
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 15;
            this.ctx.fill();
            this.ctx.restore();
        }

        // 6. Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += sw.speed;
            sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));
            sw.lineWidth = Math.max(0.5, sw.lineWidth * 0.98);

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = sw.color;
            this.ctx.lineWidth = sw.lineWidth;
            this.ctx.globalAlpha = sw.alpha;
            this.ctx.shadowColor = sw.color;
            this.ctx.shadowBlur = 20;
            this.ctx.stroke();
            this.ctx.restore();

            if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
            }
        }
    }
}

window.ParticleEngine = ParticleEngine;
