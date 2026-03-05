import { useAppStore } from '../store/useAppStore';
import { LOCALES, Translations } from '../constants/i18n';

export function useI18n(): Translations {
  const locale = useAppStore((s) => s.locale);
  return LOCALES[locale];
}
