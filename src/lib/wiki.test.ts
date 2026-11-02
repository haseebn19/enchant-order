import { describe, it, expect } from 'vitest';
import { getWikiUrl } from './wiki';

describe('getWikiUrl', () => {
  it('links to the English wiki by default', () => {
    expect(getWikiUrl('Sweeping Edge', 'en')).toBe('https://en.minecraft.wiki/w/Sweeping_Edge');
  });

  it('links to the wiki in the same language when there is one', () => {
    expect(getWikiUrl('Schutz', 'de-CH')).toBe('https://de.minecraft.wiki/w/Schutz');
    expect(getWikiUrl('Élan', 'fr-FR')).toBe('https://fr.minecraft.wiki/w/%C3%89lan');
  });

  it('falls back to the English wiki for other languages', () => {
    expect(getWikiUrl('Bann', 'vi-VN')).toBe('https://en.minecraft.wiki/w/Bann');
  });
});
