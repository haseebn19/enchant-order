const WIKI_SUPPORTED_LANGUAGES = [
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'lzh',
  'nl',
  'pt',
  'ru',
  'th',
  'uk',
  'zh',
];

export function getWikiUrl(enchantName: string, langId = 'en'): string {
  const prefix = langId.slice(0, 2);
  const wikiLang = WIKI_SUPPORTED_LANGUAGES.includes(prefix) ? prefix : 'en';
  const safeNamespace = encodeURIComponent(enchantName.replace(/ /g, '_'));
  return `https://${wikiLang}.minecraft.wiki/w/${safeNamespace}`;
}
