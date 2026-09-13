import React, { useEffect, useRef } from 'react';

const Background3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating 3D-style particles
    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 400 + 50,          // depth
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.5,
      hue: Math.random() * 60 + 210,        // blue-purple range
    }));

    // Connection lines between nearby particles
    const connect = (p1, p2) => {
      const dx = p1.sx - p2.sx;
      const dy = p1.sy - p2.sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const alpha = (1 - dist / 120) * 0.35;
        ctx.strokeStyle = `hsla(220, 80%, 70%, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }
    };

    const draw = () => {
      // Deep space gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0a0a1a');
      grad.addColorStop(0.5, '#0d1b3e');
      grad.addColorStop(1, '#0a0a1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 400;

      // Project 3D -> 2D and update
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        if (p.z < 1) p.z = 400;
        if (p.z > 400) p.z = 1;

        // Perspective projection
        const scale = fov / (fov + p.z);
        p.sx = cx + (p.x - cx) * scale;
        p.sy = cy + (p.y - cy) * scale;
        p.scale = scale;
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          connect(particles[i], particles[j]);
        }
      }

      // Draw particles
      particles.forEach((p) => {
        const radius = Math.max(1, 3 * p.scale);
        const alpha = 0.4 + 0.6 * p.scale;

        // Glowing core
        const grd = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, radius * 3);
        grd.addColorStop(0, `hsla(${p.hue}, 90%, 80%, ${alpha})`);
        grd.addColorStop(0.5, `hsla(${p.hue}, 80%, 60%, ${alpha * 0.5})`);
        grd.addColorStop(1, `hsla(${p.hue}, 70%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Solid center dot
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 85%, ${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
};

export default Background3D;
