import { useRef, useEffect } from 'react';

export default function ParticleHero() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particleArray = [];
        const mouse = { x: null, y: null };

        // Pre-render glowing sprites for performance
        const createGlowSprite = (color) => {
            const sCanvas = document.createElement('canvas');
            const sSize = 1.3; // Increased size to maintain solidity with step=2
            const sGlow = 4; // Shadow blur
            const sPadding = sSize + sGlow + 2;
            sCanvas.width = sPadding * 2;
            sCanvas.height = sPadding * 2;
            const sCtx = sCanvas.getContext('2d');
            sCtx.shadowBlur = sGlow;
            sCtx.shadowColor = color;
            sCtx.fillStyle = color;
            sCtx.beginPath();
            // Center is at padding, padding
            sCtx.arc(sPadding, sPadding, sSize, 0, Math.PI * 2);
            sCtx.fill();
            return sCanvas;
        };

        // Colors extracted from user Image (Electric Blue & Cyan)
        const colors = {
            blue: '#2563eb',    // Deep Royal Blue
            cyan: '#06b6d4',    // Bright Cyan Highlight
            pink: '#ec4899'     // Neon Pink (Hover)
        };

        const sprites = {
            [colors.blue]: createGlowSprite(colors.blue),
            [colors.cyan]: createGlowSprite(colors.cyan),
            [colors.pink]: createGlowSprite(colors.pink)
        };

        const spriteOffset = sprites[colors.blue].width / 2;

        // Particle Class
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.size = 1;
                this.density = Math.random() * 30 + 1;
                // Randomize base color for depth (70% Blue, 30% Cyan) to match image texture
                this.baseColor = Math.random() < 0.7 ? colors.blue : colors.cyan;
                this.color = this.baseColor;
                this.angle = Math.random() * 360;
            }

            draw() {
                // Draw pre-rendered sprite for max performance + glow
                const sprite = sprites[this.color];
                if (sprite) {
                    ctx.drawImage(sprite, this.x - spriteOffset, this.y - spriteOffset);
                }
            }

            update(mouse) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distanceSq = dx * dx + dy * dy;
                let maxDistance = 100;
                let maxDistanceSq = maxDistance * maxDistance;

                if (distanceSq < maxDistanceSq) {
                    let distance = Math.sqrt(distanceSq);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    this.x -= directionX;
                    this.y -= directionY;
                    this.color = colors.pink; // Change to neon pink on hover
                } else {
                    // "Visible Motion" state
                    // Increase angle speed for more energy
                    this.angle += 0.1;

                    // Create a "breathing" or "shimmer" effect with larger amplitude
                    // Use sin/cos for circular motion around the base position
                    let motionX = Math.cos(this.angle) * 3;
                    let motionY = Math.sin(this.angle) * 3;

                    // Apply the motion offset to the target
                    let targetX = this.baseX + motionX;
                    let targetY = this.baseY + motionY;

                    // Since targetX/Y are constantly moving in a circle, we can just smoothly follow them
                    // Or snapping to them creates the orbit
                    let reqDx = this.x - targetX;
                    let reqDy = this.y - targetY;

                    // Relaxed ease-out for smoother "float" feel
                    this.x -= reqDx / 10;
                    this.y -= reqDy / 10;

                    this.color = this.baseColor; // Return to variable base color
                }
            }
        }

        // Background Particle Class
        class BackgroundParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Increase speed for "energetic" feel
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.speedY = (Math.random() - 0.5) * 1.5;
                // Match theme colors
                const rand = Math.random();
                if (rand < 0.6) this.color = colors.blue;
                else if (rand < 0.9) this.color = colors.cyan;
                else this.color = colors.pink; // Occasional pink pop

                // Random scale for depth effect
                this.scale = Math.random() * 0.5 + 0.5;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                const sprite = sprites[this.color];
                if (sprite) {
                    // Draw with slight scale variation for depth
                    const size = sprite.width * this.scale;
                    ctx.drawImage(sprite, this.x - size / 2, this.y - size / 2, size, size);
                }
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

        let logoImage = new Image();

        function init() {
            // ... implementation ...

            particleArray = [];
            backgroundParticles = [];

            // Clear before sampling
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Logo Image to get coordinates
            const aspectRatio = logoImage.width / logoImage.height || 1.2; // Default to 1.2 if not loaded yet (SVG is 600x500)

            // Calculate scale to fit nicely within the canvas, maxing at a reasonable size
            // Base calculation on height to ensure it fits vertically
            // Increased scale for "expanded" look
            const maxLogoHeight = Math.min(canvas.height * 0.75, 650);

            const imgHeight = maxLogoHeight;
            const imgWidth = imgHeight * aspectRatio;

            // Position on the RIGHT side
            // 75% across width
            const offsetX = (canvas.width * 0.75) - (imgWidth / 2);
            // Moved upper (-80) to center visually better with text below
            const offsetY = (canvas.height - imgHeight) / 2 - 80;

            ctx.drawImage(logoImage, offsetX, offsetY, imgWidth, imgHeight);

            // Add text "INSURAI" below the logo
            ctx.fillStyle = 'white';
            // Increase font size dramatically for visibility
            const fontSize = Math.min(canvas.width / 18, 70);
            ctx.font = `900 ${fontSize}px "Orbitron", sans-serif`;
            ctx.textAlign = 'center';
            // Position text relative to the center of the rendered logo
            const textCenterX = offsetX + (imgWidth / 2);

            ctx.fillText('INSURAI', textCenterX, offsetY + imgHeight + 60);

            // Make subtext larger and cleaner
            ctx.font = `700 ${fontSize * 0.45}px "Space Grotesk", sans-serif`;
            ctx.letterSpacing = '10px';
            ctx.fillText('FUTURE SECURE', textCenterX, offsetY + imgHeight + 110);


            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Text Particles Sampling
            // Lower step means higher density/resolution
            // Step 2 provides 4x performance boost over Step 1 while keeping text readable with sSize 1.2
            const step = canvas.width < 1000 ? 3 : 2;

            for (let y = 0, y2 = textCoordinates.height; y < y2; y += step) {
                for (let x = 0, x2 = textCoordinates.width; x < x2; x += step) {
                    const index = (y * 4 * textCoordinates.width) + (x * 4);
                    const alpha = textCoordinates.data[index + 3];
                    const red = textCoordinates.data[index];
                    const green = textCoordinates.data[index + 1];
                    const blue = textCoordinates.data[index + 2];

                    // Check alpha AND brightness to ignore the dark background (#0E100E) of the SVG
                    // Threshold of 40 ensures we only pick up the visible logo parts, not the near-black bg
                    if (alpha > 128 && (red > 40 || green > 40 || blue > 40)) {
                        let positionX = x;
                        let positionY = y;
                        // Keep particle size small for sharpness, but density is high
                        particleArray.push(new Particle(positionX, positionY));
                    }
                }
            }

            // Create Background Floating Particles
            // Increased count for visibility as requested
            const bgParticleCount = canvas.width < 600 ? 150 : 800;
            for (let i = 0; i < bgParticleCount; i++) {
                backgroundParticles.push(new BackgroundParticle());
            }
        }

        logoImage.onload = () => {
            init();
            animate();
        };
        logoImage.src = require('../assets/Converted.svg').default;

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background Particles first (behind text)
            for (let i = 0; i < backgroundParticles.length; i++) {
                backgroundParticles[i].update();
                backgroundParticles[i].draw();
            }

            // Draw Text Particles
            // Using sprites, so no need for composite operation tricks
            for (let i = 0; i < particleArray.length; i++) {
                particleArray[i].update(mouse);
                particleArray[i].draw();
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // init(); moved to onload
        // animate(); moved to onload

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
