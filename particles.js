/**
 * Tech Manthan 6.0 - 3D Cosmic Galaxy Universe Engine & FX
 */

class ParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.stars3D = [];
        this.nebulae = [];
        this.shootingStars = [];
        this.shockwaves = [];
        this.vortexActive = false;
        this.vortexIntensity = 1;
        this.width = 0;
        this.height = 0;

        // 3D Parallax & Camera Perspective
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.rotationAngle = 0;
        this.fov = 600;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = (e.clientX - this.width / 2) * 0.0008;
            this.targetMouseY = (e.clientY - this.height / 2) * 0.0008;
        });

        this.createGalaxy3D();
        this.createNebulae();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    createGalaxy3D() {
        const starCount = 650;
        const colors = ['#00f3ff', '#bc13fe', '#39ff14', '#ffffff', '#ffd700', '#0088ff', '#e0b0ff'];
        const armCount = 4;

        this.stars3D = [];

        // 1. Spiral Galaxy Arms Stars
        for (let i = 0; i < starCount; i++) {
            const arm = i % armCount;
            const distance = Math.pow(Math.random(), 1.5) * (Math.max(this.width, this.height) * 0.65) + 30;
            const theta = Math.log(distance * 0.015) * 2.2 + (arm * (Math.PI * 2 / armCount));
            const spreadX = (Math.random() - 0.5) * (distance * 0.25);
            const spreadY = (Math.random() - 0.5) * (distance * 0.25);

            this.stars3D.push({
                x: Math.cos(theta) * distance + spreadX,
                y: (Math.random() - 0.5) * 160 + spreadY,
                z: Math.sin(theta) * distance + (Math.random() - 0.5) * 120,
                radius: Math.random() * 2.2 + 0.6,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.8 + 0.2,
                baseAlpha: Math.random() * 0.8 + 0.2,
                pulseSpeed: Math.random() * 0.03 + 0.01,
                dist: distance,
                theta: theta,
                arm: arm
            });
        }

        // 2. Distant Deep Space Background Stars
        for (let i = 0; i < 350; i++) {
            this.stars3D.push({
                x: (Math.random() - 0.5) * this.width * 2.2,
                y: (Math.random() - 0.5) * this.height * 2.2,
                z: Math.random() * 1400 - 700,
                radius: Math.random() * 1.5 + 0.4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.6 + 0.1,
                baseAlpha: Math.random() * 0.6 + 0.1,
                pulseSpeed: Math.random() * 0.02 + 0.005,
                isDeepSpace: true
            });
        }
    }

    createNebulae() {
        this.nebulae = [
            { x: -0.3, y: -0.2, radius: 450, color: 'rgba(0, 243, 255, 0.12)', blur: 80 },
            { x: 0.35, y: 0.25, radius: 520, color: 'rgba(188, 19, 254, 0.14)', blur: 100 },
            { x: 0.0, y: 0.0, radius: 380, color: 'rgba(57, 255, 20, 0.08)', blur: 70 },
            { x: -0.25, y: 0.3, radius: 480, color: 'rgba(0, 136, 255, 0.10)', blur: 90 }
        ];
    }

    createShockwave(x, y, color = '#00f3ff', maxRadius = 900) {
        this.shockwaves.push({
            x: x || this.width / 2,
            y: y || this.height / 2,
            radius: 5,
            maxRadius: maxRadius,
            color: color,
            alpha: 1,
            speed: 20,
            lineWidth: 7
        });
    }

    createRevealExplosion(x, y) {
        const cx = x || this.width / 2;
        const cy = y || this.height / 2;

        this.createShockwave(cx, cy, '#00f3ff', 1100);
        setTimeout(() => this.createShockwave(cx, cy, '#bc13fe', 1300), 140);
        setTimeout(() => this.createShockwave(cx, cy, '#ffffff', 1000), 280);
        setTimeout(() => this.createShockwave(cx, cy, '#39ff14', 1200), 420);

        // Explosive 3D cosmic starburst
        const colors = ['#00f3ff', '#bc13fe', '#39ff14', '#ffffff', '#ffd700'];
        for (let i = 0; i < 220; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 14 + 4;
            this.particles.push({
                x: cx,
                y: cy,
                radius: Math.random() * 3.8 + 1.6,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.014 + 0.008,
                isBurst: true
            });
        }
    }

    setVortex(active, intensity = 1) {
        this.vortexActive = active;
        this.vortexIntensity = intensity;
    }

    spawnShootingStar() {
        if (Math.random() < 0.02 && this.shootingStars.length < 3) {
            const startX = Math.random() * this.width;
            const startY = Math.random() * (this.height * 0.4);
            const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
            const length = Math.random() * 140 + 80;
            const speed = Math.random() * 12 + 10;

            this.shootingStars.push({
                x: startX,
                y: startY,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                length: length,
                alpha: 1,
                color: '#ffffff'
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Smooth mouse camera parallax interpolation
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
        this.rotationAngle += this.vortexActive ? 0.015 * this.vortexIntensity : 0.002;

        const cx = this.width / 2;
        const cy = this.height / 2;

        // 1. Render Cosmic Nebulae
        this.ctx.save();
        this.nebulae.forEach(n => {
            const nx = cx + n.x * this.width + this.mouseX * 120;
            const ny = cy + n.y * this.height + this.mouseY * 120;

            const grad = this.ctx.createRadialGradient(nx, ny, 10, nx, ny, n.radius);
            grad.addColorStop(0, n.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(nx, ny, n.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();

        // 2. Render Shockwaves
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
            this.ctx.shadowBlur = 22;
            this.ctx.stroke();
            this.ctx.restore();

            if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
            }
        }

        // 3. Render 3D Rotating Galaxy Stars
        const cosA = Math.cos(this.rotationAngle);
        const sinA = Math.sin(this.rotationAngle);
        const cosX = Math.cos(this.mouseY);
        const sinX = Math.sin(this.mouseY);

        this.stars3D.forEach(star => {
            let rx = star.x;
            let ry = star.y;
            let rz = star.z;

            // Spiral rotation about Y axis
            if (!star.isDeepSpace) {
                const x1 = rx * cosA - rz * sinA;
                const z1 = rx * sinA + rz * cosA;
                rx = x1;
                rz = z1;
            }

            // Mouse 3D Tilt perspective rotation
            const y1 = ry * cosX - rz * sinX;
            const z2 = ry * sinX + rz * cosX;
            ry = y1;
            rz = z2;

            // 3D Perspective Projection
            const perspective = this.fov / (this.fov + rz + 400);
            if (perspective <= 0) return;

            const projX = cx + (rx + this.mouseX * 300) * perspective;
            const projY = cy + (ry + this.mouseY * 300) * perspective;
            const projRadius = Math.max(0.4, star.radius * perspective * 1.4);

            star.alpha = star.baseAlpha + Math.sin(Date.now() * star.pulseSpeed) * 0.25;
            const finalAlpha = Math.max(0.1, Math.min(1, star.alpha * Math.min(1.5, perspective)));

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(projX, projY, projRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = finalAlpha;
            this.ctx.shadowColor = star.color;
            this.ctx.shadowBlur = projRadius > 2 ? 12 : 5;
            this.ctx.fill();
            this.ctx.restore();
        });

        // 4. Render Burst Explosions
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
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 14;
            this.ctx.fill();
            this.ctx.restore();
        }

        // 5. Render Cosmic Shooting Stars
        this.spawnShootingStar();
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const ss = this.shootingStars[i];
            ss.x += ss.dx;
            ss.y += ss.dy;
            ss.alpha -= 0.015;

            this.ctx.save();
            const grad = this.ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.dx * 3, ss.y - ss.dy * 3);
            grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
            grad.addColorStop(0.4, `rgba(0, 243, 255, ${ss.alpha * 0.7})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.moveTo(ss.x, ss.y);
            this.ctx.lineTo(ss.x - ss.dx * 4, ss.y - ss.dy * 4);
            this.ctx.stroke();
            this.ctx.restore();

            if (ss.alpha <= 0 || ss.x > this.width || ss.y > this.height) {
                this.shootingStars.splice(i, 1);
            }
        }
    }
}

window.ParticleEngine = ParticleEngine;
