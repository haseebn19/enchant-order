import { describe, it, expect } from 'vitest';
import { getWikiUrl } from './wiki';

describe('getWikiUrl', () => {
  it('generates english wiki url by default', () => {
    expect(getWikiUrl('Sweeping Edge', 'en')).toBe(
      'https://en.minecraft.wiki/w/Sweeping_Edge'
    );
  });

  it('generates localized wiki url for supported languages', () => {
    expect(getWikiUrl('Schutz', 'de-CH')).toBe(
      'https://de.minecraft.wiki/w/Schutz'
    );
    expect(getWikiUrl('Élan', 'fr-FR')).toBe(
      'https://fr.minecraft.wiki/w/%C3%89lan'
    );
  });

  it('falls back to english wiki for unsupported wiki languages', () => {
    expect(getWikiUrl('Bann', 'vi-VN')).toBe(
      'https://en.minecraft.wiki/w/Bann'
    );
  });
});
