export function calculateAngle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);

  if (!magAB || !magCB) return 0;

  const cosine = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return Number((Math.acos(cosine) * (180 / Math.PI)).toFixed(2));
}

export function getKneeStatus(angle, min, max) {
  if (angle >= min && angle <= max) return 'correct';
  if (angle < min) return 'too-flexed';
  return 'too-extended';
}
