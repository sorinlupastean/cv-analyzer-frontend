import React, { useEffect, useRef } from "react";
import styles from "./ParticlesBackground.module.css";

// Interfață pentru mouse
interface MousePosition {
  x: number | null;
  y: number | null;
  radius: number;
}

const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);

  // Mouse-ul pentru interacțiune
  const mouse = useRef<MousePosition>({
    x: null,
    y: null,
    radius: 150, // Raza de influență a mouse-ului
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: SpiritSeed[] = [];

    // Configurare
    const numberOfParticles = 70; // Număr mai mic pentru eleganță și performanță

    // Clasa SpiritSeed (Atokirina)
    class SpiritSeed {
      x: number;
      y: number;
      size: number;
      baseX: number;
      speedY: number; // Viteza de plutire în sus
      swingSpeed: number; // Viteza de oscilație stânga-dreapta
      swingRange: number; // Cât de largă e oscilația
      angle: number; // Pentru calculul sinusoidei
      opacity: number;
      glowColor: string;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.baseX = this.x;
        // Mărimi variate pentru adâncime (unele mai mici par mai departe)
        this.size = Math.random() * 2 + 1;
        // Viteză variabilă, toate merg în sus (-)
        this.speedY = Math.random() * -0.5 - 0.2;
        this.swingSpeed = Math.random() * 0.02 + 0.01;
        this.swingRange = Math.random() * 2;
        this.angle = Math.random() * 360;
        this.opacity = Math.random() * 0.5 + 0.3; // Transparență inițială

        // Culori specifice Avatar (Alb spre Cyan/Mov pal)
        const colors = ["255, 255, 255", "180, 240, 255", "200, 220, 255"];
        this.glowColor = colors[Math.floor(Math.random() * colors.length)];
      }

      update(canvasWidth: number, canvasHeight: number) {
        // 1. Mișcarea naturală (Plutire + Oscilație)
        this.angle += this.swingSpeed;
        // Mișcare sinusoidală pe X (stânga-dreapta ca o meduză/sămânță)
        this.x += Math.cos(this.angle) * 0.5;
        this.y += this.speedY;

        // 2. Interacțiunea cu Mouse-ul (Evitare)
        if (mouse.current.x != null && mouse.current.y != null) {
          let dx = mouse.current.x - this.x;
          let dy = mouse.current.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.current.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force =
              (mouse.current.radius - distance) / mouse.current.radius;

            // Împingem particula ușor
            const directionX = forceDirectionX * force * 3;
            const directionY = forceDirectionY * force * 3;
            this.x -= directionX;
            this.y -= directionY;
          }
        }

        // 3. Resetare când iese din ecran (sus)
        if (this.y < -50) {
          this.y = canvasHeight + 50;
          this.x = Math.random() * canvasWidth;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        // Nucleul alb strălucitor
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        // Efectul de Glow (Bioluminescență)
        ctx.shadowBlur = 15; // Raza strălucirii
        ctx.shadowColor = `rgb(${this.glowColor})`;

        ctx.fillStyle = `rgba(${this.glowColor}, ${this.opacity})`;
        ctx.fill();

        // Resetăm shadow pentru a nu afecta alte desene (performanță)
        ctx.shadowBlur = 0;
      }
    }

    const init = () => {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new SpiritSeed(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      // Ștergem canvas-ul, dar păstrăm transparența
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesArray.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Resize Event
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // Mouse Events
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.x;
      mouse.current.y = e.y;
    };
    const handleMouseLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };

    // Pornire
    handleResize();
    animate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Background-ul CSS complex rămâne pentru atmosferă */}
      <div className={styles.oceanDepths} />
      <div className={styles.sunRays} />
      <div className={styles.causticsOverlay} />

      {/* Canvas-ul pentru "Spirit Seeds" */}
      <canvas ref={canvasRef} className={styles.neuralCanvas} />
    </div>
  );
};

export default ParticlesBackground;
