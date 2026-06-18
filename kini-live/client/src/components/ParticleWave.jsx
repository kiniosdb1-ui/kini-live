import { useEffect, useRef } from "react";

function ParticleWave() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const horizontalGap = width < 640 ? 18 : 14;
      const verticalGap = width < 640 ? 22 : 17;
      const rows = Math.ceil(height / verticalGap) + 3;
      const columns = Math.ceil(width / horizontalGap) + 2;

      for (let row = 0; row < rows; row += 1) {
        const depth = row / rows;
        for (let column = 0; column < columns; column += 1) {
          const x = column * horizontalGap - horizontalGap;
          const xRatio = x / Math.max(width, 1);
          const ridge =
            Math.sin(xRatio * 9 + time * 0.9) * 26 +
            Math.sin(xRatio * 18 - time * 0.55) * 10;
          const perspective = Math.pow(depth, 1.5);
          const y = height * 0.2 + depth * height * 0.82 - ridge * (1 - depth * 0.35);
          const glow = Math.max(0, 1 - Math.abs(xRatio - 0.55) * 1.6);
          const alpha = Math.min(0.72, 0.08 + perspective * 0.5 + glow * 0.12);
          const radius = 0.7 + perspective * 1.7;

          context.beginPath();
          context.fillStyle = `rgba(${196 + glow * 30}, ${199 + glow * 22}, ${204 + glow * 10}, ${alpha})`;
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      if (!reduceMotion) {
        time += 0.012;
        frameId = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-wave" aria-hidden="true" />;
}

export default ParticleWave;
