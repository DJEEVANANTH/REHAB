export function animateCounter(
  element: HTMLElement,
  targetValue: number,
  duration = 1800
) {
  if (element.dataset.animated === 'true') return;
  element.dataset.animated = 'true';

  const prefix = element.dataset.prefix ?? '';
  const suffix = element.dataset.suffix ?? '';
  const format = element.dataset.format ?? 'plain'; // plain | locale
  const decimalsAttr = element.dataset.decimals;

  const decimals =
    decimalsAttr != null
      ? Math.max(0, Number.parseInt(decimalsAttr, 10) || 0)
      : Number.isInteger(targetValue)
        ? 0
        : Math.min(4, (targetValue.toString().split('.')[1]?.length ?? 0));

  const formatter =
    format === 'locale'
      ? new Intl.NumberFormat(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : null;

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const start = performance.now();

  const tick = (now: number) => {
    const elapsed = now - start;
    const t = Math.min(1, Math.max(0, elapsed / duration));
    const eased = easeOutCubic(t);

    const value = targetValue * eased;
    const rounded =
      decimals === 0
        ? Math.round(value)
        : Number(value.toFixed(decimals));

    const text = formatter ? formatter.format(rounded) : String(rounded);
    element.textContent = `${prefix}${text}${suffix}`;

    if (t < 1) requestAnimationFrame(tick);
  };

  // Initialize from 0 for visual consistency
  const initialText = formatter ? formatter.format(0) : '0';
  element.textContent = `${prefix}${initialText}${suffix}`;

  requestAnimationFrame(tick);
}

export function animateCountersIn(root: ParentNode, duration = 1800) {
  const elements = Array.from(
    root.querySelectorAll<HTMLElement>('[data-target]:not([data-animated="true"])')
  );

  for (const el of elements) {
    const raw = el.dataset.target ?? '';
    const target = Number.parseFloat(raw);
    if (!Number.isFinite(target)) continue;
    animateCounter(el, target, duration);
  }
}

