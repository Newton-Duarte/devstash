"use client";

import { Code2, FileText, Folder, Search, Sparkles, TerminalSquare } from "lucide-react";
import { useEffect, useRef } from "react";

const particles = [
  { Icon: Code2, x: 34, y: 24, vx: 0.42, vy: 0.32, color: "text-[#3b82f6]" },
  { Icon: Sparkles, x: 210, y: 64, vx: -0.36, vy: 0.44, color: "text-[#8b5cf6]" },
  { Icon: Search, x: 46, y: 142, vx: 0.5, vy: -0.28, color: "text-cyan-300" },
  { Icon: TerminalSquare, x: 268, y: 42, vx: -0.44, vy: 0.35, color: "text-emerald-300" },
  { Icon: FileText, x: 108, y: 156, vx: 0.38, vy: -0.46, color: "text-slate-300" },
  { Icon: Folder, x: 236, y: 136, vx: -0.48, vy: -0.3, color: "text-amber-300" },
] as const;

interface ParticleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

export function ScatteredIconsPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mouseRef = useRef({ x: -999, y: -999, active: false });
  const stateRef = useRef<ParticleState[]>(
    particles.map((particle, index) => ({
      x: particle.x,
      y: particle.y,
      vx: particle.vx,
      vy: particle.vy,
      phase: index * 0.9,
    }))
  );

  useEffect(() => {
    const panelElement = panelRef.current;
    if (!panelElement) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let animationFrame = 0;

    function renderStatic() {
      stateRef.current.forEach((particle, index) => {
        const icon = iconRefs.current[index];
        if (!icon) {
          return;
        }

        icon.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) rotate(${index * 18}deg) scale(1)`;
      });
    }

    if (prefersReducedMotion) {
      renderStatic();
      return;
    }

    function animate() {
      const bounds = panelElement!.getBoundingClientRect();
      const iconSize = 38;
      const maxX = Math.max(bounds.width - iconSize, iconSize);
      const maxY = Math.max(bounds.height - iconSize, iconSize);

      stateRef.current.forEach((particle, index) => {
        const dx = particle.x + iconSize / 2 - mouseRef.current.x;
        const dy = particle.y + iconSize / 2 - mouseRef.current.y;
        const distance = Math.hypot(dx, dy);

        if (mouseRef.current.active && distance < 88 && distance > 0.1) {
          const force = (88 - distance) / 88;
          particle.vx += (dx / distance) * force * 0.55;
          particle.vy += (dy / distance) * force * 0.55;
        }

        particle.vx *= 0.992;
        particle.vy *= 0.992;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x <= 0 || particle.x >= maxX) {
          particle.vx *= -1;
          particle.x = Math.min(Math.max(particle.x, 0), maxX);
        }

        if (particle.y <= 0 || particle.y >= maxY) {
          particle.vy *= -1;
          particle.y = Math.min(Math.max(particle.y, 0), maxY);
        }

        const icon = iconRefs.current[index];
        if (!icon) {
          return;
        }

        const rotation = Math.sin(frame / 44 + particle.phase) * 16;
        const scale = 1 + Math.sin(frame / 36 + particle.phase) * 0.08;
        icon.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) rotate(${rotation}deg) scale(${scale})`;
      });

      frame += 1;
      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div
      ref={panelRef}
      className="relative h-full overflow-hidden rounded-lg bg-slate-950/20"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        mouseRef.current = {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          active: true,
        };
      }}
      onPointerLeave={() => {
        mouseRef.current.active = false;
      }}
    >
      <div className="pointer-events-none absolute inset-6 rounded-full bg-[#3b82f6]/5 blur-2xl" />
      {particles.map(({ Icon, color }, index) => (
        <div
          key={index}
          ref={(node) => {
            iconRefs.current[index] = node;
          }}
          className={`absolute left-0 top-0 flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] shadow-lg shadow-black/20 backdrop-blur-sm will-change-transform ${color}`}
        >
          <Icon className="size-6" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
