// Rounding avoids cross-engine trigonometry differences during React hydration.
export function wavePath(count: number): string {
  return Array.from({ length: count }, (_, index) => {
    const envelope = Math.sin((index / count) * Math.PI);
    const height =
      3 +
      Math.abs(Math.sin(index * 1.7) * Math.cos(index * 0.37)) * 70 * envelope;
    return `M${index * 5 + 2} ${(45 - height / 2).toFixed(2)}v${height.toFixed(2)}`;
  }).join(" ");
}
