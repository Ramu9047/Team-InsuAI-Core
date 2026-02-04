import { useRef, useEffect } from 'react';

export default function ParticleHero() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particleArray = [];
        const mouse = { x: null, y: null };

        // Particle Class
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.size = Math.random() * 2 + 1; // Random size
                this.density = Math.random() * 30 + 1;
                this.color = '#3b82f6'; // Blue for base
                // Add continuous movement properties
                this.angle = Math.random() * 360;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update(mouse) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = 100;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < maxDistance) {
                    this.x -= directionX;
                    this.y -= directionY;
                    this.color = '#ec4899'; // Change to neon pink on hover
                } else {
                    // Continuous jitter/wobble effect
                    this.angle += 0.05;
                    let motionX = Math.cos(this.angle) * 2;
                    let motionY = Math.sin(this.angle) * 2;

                    let targetX = this.baseX + motionX;
                    let targetY = this.baseY + motionY;

                    if (this.x !== targetX) {
                        let dx = this.x - targetX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== targetY) {
                        let dy = this.y - targetY;
                        this.y -= dy / 10;
                    }
                    this.color = '#3b82f6'; // Back to blue
                }
            }
        }

        // Background Particle Class
        class BackgroundParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // varied sizes for depth
                this.size = Math.random() < 0.9 ? Math.random() * 1.5 : Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = (Math.random() - 0.5) * 0.8;
                // Brighter, more visible blue/indigo/purple mix
                const hue = Math.random() > 0.5 ? 240 : 280; // Blue or Purple
                const alpha = Math.random() * 0.6 + 0.2; // Higher opacity
                this.color = `hsla(${hue}, 100%, 70%, ${alpha})`;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }
        }

        // Set canvas size
        const handleResize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
            // Debounce init call on resize
            clearTimeout(window.resizeTimeout);
            window.resizeTimeout = setTimeout(init, 100);
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // Handle mouse interaction relative to canvas
        const handleMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        };

        window.addEventListener('mousemove', handleMouseMove);

        let backgroundParticles = [];

        function init() {
            particleArray = [];
            backgroundParticles = [];

            // Clear before sampling
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw text to get coordinates - Increased size
            ctx.fillStyle = 'white';
            // Increased divider from 6 to 3.5 for larger text relative to container width
            const fontSize = Math.min(canvas.width / 6.5, 140);
            ctx.font = `900 ${fontSize}px Orbitron, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Draw "InsurAI" on the right side
            ctx.fillText('InsurAI', canvas.width * 0.72, canvas.height / 2);

            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Text Particles Sampling
            const step = canvas.width < 800 ? 5 : 3; // Increase density for sharper text

            for (let y = 0, y2 = textCoordinates.height; y < y2; y += step) {
                for (let x = 0, x2 = textCoordinates.width; x < x2; x += step) {
                    if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                        let positionX = x;
                        let positionY = y;
                        particleArray.push(new Particle(positionX, positionY));
                    }
                }
            }

            // Create Background Floating Particles
            // Highly dense field ("millions" visual feel)
            const bgParticleCount = canvas.width < 600 ? 1000 : 8000;
            for (let i = 0; i < bgParticleCount; i++) {
                backgroundParticles.push(new BackgroundParticle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background Particles first (behind text)
            for (let i = 0; i < backgroundParticles.length; i++) {
                backgroundParticles[i].update();
                backgroundParticles[i].draw();
            }

            // Draw Text Particles
            for (let i = 0; i < particleArray.length; i++) {
                particleArray[i].draw();
                particleArray[i].update(mouse);
            }

            // Connect lines between nearby text particles for "network" effect? 
            // Might be heavy on performance, keep it simple dots for now as requested "dots".

            animationFrameId = requestAnimationFrame(animate);
        }

        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'block',
                width: '100%',
                height: '100%',
                // Use transparent background so it layers over the main gradient
                background: 'transparent'
            }}
        />
    );
}
