/**
 * Tech Manthan 6.0 - Cyber Particles & Shockwave Canvas FX
 */

class ParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.shockwaves = [];
        this.beams = [];
        this.vortexActive = false;
        this.vortexIntensity = 1;
        this.vortexSpeed = 1;
        this.width = 0;
        this.height = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createParticles(120);
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    createParticles(count) {
        const colors = ['#00f3ff', '#bc13fe', '#39ff14', '#0099ff', '#ffffff'];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 2 + 0.8,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                alpha: Math.random() * 0.7 + 0.2,
                baseAlpha: Math.random() * 0.7 + 0.2,
                pulseSpeed: Math.random() * 0.03 + 0.01,
                angle: Math.random() * Math.PI * 2,
                distance: Math.random() * (Math.min(this.width, this.height) * 0.45)
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

        // Multiple concentric shockwaves
        this.createShockwave(cx, cy, '#00f3ff', 1000);
        setTimeout(() => this.createShockwave(cx, cy, '#bc13fe', 1200), 150);
        setTimeout(() => this.createShockwave(cx, cy, '#ffffff', 900), 300);
        setTimeout(() => this.createShockwave(cx, cy, '#39ff14', 1100), 450);

        // Explosive burst particles
        const burstCount = 180;
        const colors = ['#00f3ff', '#bc13fe', '#39ff14', '#ffffff', '#7df9ff'];
        for (let i = 0; i < burstCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 12 + 3;
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

        this.ctx.clearRect(0, 0, this.width, this.height);

        const cx = this.width / 2;
        const cy = this.height / 2;

        // Draw and update shockwaves
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

        // Draw and update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            if (p.isBurst) {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy *= 0.96;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
            } else if (this.vortexActive) {
                p.angle += (0.01 + (1 - p.distance / (this.width * 0.5)) * 0.03) * this.vortexIntensity;
                p.distance -= (0.5 * this.vortexIntensity);
                if (p.distance <= 10) {
                    p.distance = Math.random() * (Math.min(this.width, this.height) * 0.45) + 50;
                }
                p.x = cx + Math.cos(p.angle) * p.distance;
                p.y = cy + Math.sin(p.angle) * p.distance;
                p.alpha = Math.min(1, p.baseAlpha * 1.5);
            } else {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;

                p.alpha = p.baseAlpha + Math.sin(Date.now() * p.pulseSpeed) * 0.2;
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = p.isBurst ? 15 : 6;
            this.ctx.fill();
            this.ctx.restore();
        }

        // Draw subtle cyber constellation lines between nearby particles
        if (!this.vortexActive) {
            const maxDist = 85;
            for (let i = 0; i < Math.min(60, this.particles.length); i++) {
                for (let j = i + 1; j < Math.min(60, this.particles.length); j++) {
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDist) {
                        this.ctx.save();
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = '#00f3ff';
                        this.ctx.globalAlpha = (1 - dist / maxDist) * 0.15;
                        this.ctx.lineWidth = 0.6;
                        this.ctx.stroke();
                        this.ctx.restore();
                    }
                }
            }
        }
    }
}

window.ParticleEngine = ParticleEngine;
