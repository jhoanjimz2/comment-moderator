const THREATS = [
  'te voy a encontrar',
  'te voy a matar',
  'vas a ver lo que te pasa'
];

const INSULTS = [
  'idiota',
  'ignorante',
  'imbécil'
];

const PROMOTIONS = [
  'gana dinero',
  'compra seguidores',
  'cupon de descuento',
  'promocion exclusiva'
];

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function isEmpty(text: string): boolean {
  return text.trim().length === 0;
}

export function containsThreat(text: string): boolean {
  const normalized = normalizeText(text);

  return THREATS.some(threat =>
    normalized.includes(normalizeText(threat))
  );
}

export function containsInsult(text: string): boolean {
  const normalized = normalizeText(text);

  return INSULTS.some(insult =>
    normalized.includes(normalizeText(insult))
  );
}

export function containsPromotion(text: string): boolean {
  const normalized = normalizeText(text);

  const hasPromotionalPhrase = PROMOTIONS.some(phrase =>
    normalized.includes(phrase)
  );

  const hasRepeatedOffers =
    (normalized.match(/\boferta\b/g) ?? []).length >= 2;

  const hasDiscountCoupon =
    /\bcupon\b.*\b\d{1,3}%/.test(normalized);

  return hasPromotionalPhrase || hasRepeatedOffers || hasDiscountCoupon;
}

export function containsPhoneNumber(text: string): boolean {
  const phonePattern =
    /(?:\+57[\s-]?)?3\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/;

  return phonePattern.test(text);
}

export function containsUrl(text: string): boolean {
  return /(?:https?:\/\/|www\.|[\w-]+\.(?:com|co|net|org|xyz)\b)/i.test(text);
}

export function isQuestion(text: string): boolean {
  const textWithoutUrls = text.replace(
    /(?:https?:\/\/|www\.)[^\s]+|[\w-]+\.(?:com|co|net|org|xyz)(?:\/[^\s]*)?/gi,
    ''
  );

  return (
    textWithoutUrls.includes('?') ||
    textWithoutUrls.includes('¿')
  );
}
