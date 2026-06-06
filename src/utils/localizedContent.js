const normalizeFieldValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const toPascalCase = (value = '') => {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .replace(/\s+/g, '');
};

const getCandidatesByLocale = (baseField, locale) => {
  const pascalField = toPascalCase(baseField);
  const lowerLocale = String(locale || 'vi').toLowerCase();

  if (lowerLocale === 'en') {
    return [
      `${baseField}En`,
      `${baseField}_en`,
      `${baseField}EN`,
      `en${pascalField}`,
    ];
  }

  return [
    `${baseField}Vi`,
    `${baseField}_vi`,
    `${baseField}VI`,
    `vi${pascalField}`,
  ];
};

export const getLocalizedContent = (source, baseField, locale = 'vi') => {
  if (!source || typeof source !== 'object') {
    return '';
  }

  const localeCandidates = getCandidatesByLocale(baseField, locale);

  for (const fieldName of localeCandidates) {
    const localizedValue = normalizeFieldValue(source[fieldName]);

    if (localizedValue) {
      return localizedValue;
    }
  }

  if (source.translations && typeof source.translations === 'object') {
    const translationByLocale = source.translations[String(locale || 'vi').toLowerCase()];
    const translationValue = normalizeFieldValue(translationByLocale?.[baseField]);

    if (translationValue) {
      return translationValue;
    }
  }

  return normalizeFieldValue(source[baseField]);
};

export default getLocalizedContent;
