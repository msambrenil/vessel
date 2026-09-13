import { describe, it, expect } from "vitest";

describe("Cálculo de escala proporcional para compresión de imágenes", () => {
  const calculateProportionalDimensions = (
    width: number,
    height: number,
    maxWidth = 1280,
    maxHeight = 1280
  ) => {
    let targetWidth = width;
    let targetHeight = height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      targetWidth = Math.round(width * ratio);
      targetHeight = Math.round(height * ratio);
    }

    return { width: targetWidth, height: targetHeight };
  };

  it("preserva exactamente la relación de aspecto 3:4 en fotos de retrato de smartphone", () => {
    const originalWidth = 3024;
    const originalHeight = 4032; // 3:4 portrait
    const originalRatio = originalWidth / originalHeight;

    const { width, height } = calculateProportionalDimensions(originalWidth, originalHeight);

    expect(height).toBe(1280);
    expect(width).toBe(960);
    expect(width / height).toBeCloseTo(originalRatio, 4);
  });

  it("preserva exactamente la relación de aspecto 9:16 en capturas verticales", () => {
    const originalWidth = 1080;
    const originalHeight = 1920; // 9:16
    const originalRatio = originalWidth / originalHeight;

    const { width, height } = calculateProportionalDimensions(originalWidth, originalHeight);

    expect(height).toBe(1280);
    expect(width).toBe(720);
    expect(width / height).toBeCloseTo(originalRatio, 4);
  });

  it("preserva la relación de aspecto en fotos de paisaje horizontales (16:9)", () => {
    const originalWidth = 1920;
    const originalHeight = 1080;
    const originalRatio = originalWidth / originalHeight;

    const { width, height } = calculateProportionalDimensions(originalWidth, originalHeight);

    expect(width).toBe(1280);
    expect(height).toBe(720);
    expect(width / height).toBeCloseTo(originalRatio, 4);
  });

  it("no modifica imágenes que ya son menores al límite máximo", () => {
    const originalWidth = 800;
    const originalHeight = 600;

    const { width, height } = calculateProportionalDimensions(originalWidth, originalHeight);

    expect(width).toBe(800);
    expect(height).toBe(600);
  });

  it("mantiene perfectamente cuadradas (1:1) las fotos de perfil cuadradas", () => {
    const originalWidth = 2000;
    const originalHeight = 2000;

    const { width, height } = calculateProportionalDimensions(originalWidth, originalHeight);

    expect(width).toBe(1280);
    expect(height).toBe(1280);
    expect(width / height).toBe(1);
  });
});
