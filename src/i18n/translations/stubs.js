// Stub files for remaining languages - Import French as fallback
import fr from './fr.js';

// Deutsch
export const de = { ...fr, meta: { language: 'Deutsch', code: 'de', flag: '🇩🇪' } };

// Italiano  
export const it = { ...fr, meta: { language: 'Italiano', code: 'it', flag: '🇮🇹' } };

// Português
export const pt = { ...fr, meta: { language: 'Português', code: 'pt', flag: '🇵🇹' } };

// Русский
export const ru = { ...fr, meta: { language: 'Русский', code: 'ru', flag: '🇷🇺' } };

// Українська
export const uk = { ...fr, meta: { language: 'Українська', code: 'uk', flag: '🇺🇦' } };

// 中文
export const zh = { ...fr, meta: { language: '中文', code: 'zh', flag: '🇨🇳' } };

// 日本語
export const jp = { ...fr, meta: { language: '日本語', code: 'jp', flag: '🇯🇵' } };

// 한국어
export const ko = { ...fr, meta: { language: '한국어', code: 'ko', flag: '🇰🇷' } };

// Lingala
export const rc = { ...fr, meta: { language: 'Lingala', code: 'rc', flag: '🇨🇩' } };

// עברית (Hebrew - RTL)
export const he = { ...fr, meta: { language: 'עברית', code: 'he', flag: '🇮🇱', dir: 'rtl' } };
