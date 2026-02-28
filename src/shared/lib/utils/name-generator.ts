/**
 * Утилита автогенерации имён ресурсов
 * Формат: prefix + порядковый номер (NNN)
 *
 * @example
 * generateName("mnsc", ["mnsc01", "mnsc02"]) → "mnsc03"
 * generateName("mbds", []) → "mbds01"
 */

/**
 * Генерирует следующее имя по шаблону prefix + NNN
 */
export function generateName(prefix: string, existingNames: string[]): string {
  let maxNumber = 0;
  const re = new RegExp(`^${prefix}(\\d+)$`, "i");

  for (const name of existingNames) {
    const match = name.match(re);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  }

  const next = maxNumber + 1;
  return `${prefix}${String(next).padStart(2, "0")}`;
}
