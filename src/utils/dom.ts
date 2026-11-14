/** Коротка обгортка над getElementById з типізацією та перевіркою на null */
export function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Елемент #${id} не знайдено в DOM`);
  return el as T;
}

/** Екранування користувацького тексту перед вставкою через innerHTML (захист від XSS) */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
