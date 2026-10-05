export function imageDimension(value: unknown): number | null {
  if (value === null || value === undefined || value === '' || !/^\d+$/.test(String(value))) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 && number <= 100000 ? number : null;
}

const decodeAttribute = (value: string) =>
  value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
    const names: Record<string, string> = {
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': "'",
      '&lt;': '<',
      '&gt;': '>',
    };
    if (names[entity.toLowerCase()]) return names[entity.toLowerCase()];
    const hex = /^&#x/i.test(entity),
      point = parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
      ? String.fromCodePoint(point)
      : '\uFFFD';
  });

// Recognize only a single image and its supported attributes. Other HTML stays protected.
export function parseImageHTML(
  raw: string,
): { src: string; alt: string; title: string | null; width: number | null; height: number | null } | null {
  const match = raw.trim().match(/^<img\b([\s\S]*?)\s*\/?\s*>$/i);
  if (!match) return null;
  const attributes: Record<string, string> = {};
  const pattern = /\s+([a-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/iy;
  let offset = 0;
  while (offset < match[1].length) {
    if (!match[1].slice(offset).trim()) break;
    pattern.lastIndex = offset;
    const attribute = pattern.exec(match[1]);
    if (!attribute) return null;
    const name = attribute[1].toLowerCase();
    if (!['src', 'alt', 'title', 'width', 'height'].includes(name) || name in attributes) return null;
    attributes[name] = decodeAttribute(attribute[2] ?? attribute[3] ?? attribute[4]);
    offset = pattern.lastIndex;
  }
  if (
    !attributes.src ||
    ['width', 'height'].some(key => key in attributes && imageDimension(attributes[key]) === null)
  )
    return null;
  return {
    src: attributes.src,
    alt: attributes.alt || '',
    title: attributes.title ?? null,
    width: imageDimension(attributes.width),
    height: imageDimension(attributes.height),
  };
}
