import { settingsRepository } from '@/features/settings/repository/settings.repository';
import { DEFAULT_THEME_CONFIG, type ThemeColors, type ThemeConfig, type ThemeTypography } from '@/features/theme/types/theme.types';
import type { ServiceResult } from '@/shared/types/common';

const DEFAULT_COLORS = DEFAULT_THEME_CONFIG.colors;
const DEFAULT_TYPOGRAPHY = DEFAULT_THEME_CONFIG.typography;

function parseThemeConfig(doc: { themeColors?: string | null; themeTypography?: string | null } | null): ThemeConfig {
  let colors = DEFAULT_COLORS;
  let typography = DEFAULT_TYPOGRAPHY;

  if (doc?.themeColors) {
    try {
      const parsed = JSON.parse(doc.themeColors) as Partial<ThemeColors>;
      colors = { ...DEFAULT_COLORS, ...parsed };
    } catch {
      // use defaults
    }
  }

  if (doc?.themeTypography) {
    try {
      const parsed = JSON.parse(doc.themeTypography) as Partial<ThemeTypography>;
      typography = { ...DEFAULT_TYPOGRAPHY, ...parsed };
    } catch {
      // use defaults
    }
  }

  return { colors, typography };
}

export async function getThemeService(): Promise<ServiceResult<ThemeConfig>> {
  const doc = await settingsRepository.get();
  const config = parseThemeConfig(doc as { themeColors?: string | null; themeTypography?: string | null });
  return { data: config, status: 200 };
}

export async function updateThemeService(
  config: Partial<ThemeConfig>
): Promise<ServiceResult<ThemeConfig>> {
  const existing = await settingsRepository.get();
  const current = parseThemeConfig(existing as { themeColors?: string | null; themeTypography?: string | null });

  const merged: ThemeConfig = {
    colors: { ...current.colors, ...(config.colors ?? {}) },
    typography: { ...current.typography, ...(config.typography ?? {}) },
  };

  await settingsRepository.update({
    themeColors: JSON.stringify(merged.colors),
    themeTypography: JSON.stringify(merged.typography),
  } as Parameters<typeof settingsRepository.update>[0]);

  return { data: merged, status: 200 };
}
