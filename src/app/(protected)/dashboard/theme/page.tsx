'use client';
import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_THEME_CONFIG, type ThemeColors, type ThemeConfig, type ThemeTypography } from '@/features/theme/types/theme.types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { http } from '@/shared/lib/http';

const FONT_FAMILIES = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Nunito', 'Georgia'];

const FONT_SIZE_MIN = 14;
const FONT_SIZE_MAX = 20;

type ColorKey = keyof ThemeColors;

const COLOR_LABELS: Record<ColorKey, string> = {
  primary: 'Primary',
  primaryForeground: 'Primary Text',
  secondary: 'Secondary',
  secondaryForeground: 'Secondary Text',
  background: 'Background',
  foreground: 'Foreground Text',
  accent: 'Accent',
  accentForeground: 'Accent Text',
};

export default function ThemePage() {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME_CONFIG.colors);
  const [typography, setTypography] = useState<ThemeTypography>(DEFAULT_THEME_CONFIG.typography);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = useCallback(async () => {
    setLoading(true);
    try {
      const config = await http.get<ThemeConfig>('/theme');
      setColors(config.colors);
      setTypography(config.typography);
    } catch {
      setColors(DEFAULT_THEME_CONFIG.colors);
      setTypography(DEFAULT_THEME_CONFIG.typography);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  useEffect(() => {
    if (loading) return;
    const root = document.documentElement;
    const colorKeys: ColorKey[] = [
      'primary',
      'primaryForeground',
      'secondary',
      'secondaryForeground',
      'background',
      'foreground',
      'accent',
      'accentForeground',
    ];
    colorKeys.forEach((key) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, colors[key]);
    });
    root.style.setProperty('--font-sans', `'${typography.fontFamily}', sans-serif`);
    root.style.fontSize = `${typography.fontSize}px`;

    return () => {
      colorKeys.forEach((key) => {
        const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.removeProperty(cssVar);
      });
      root.style.removeProperty('--font-sans');
      root.style.fontSize = '';
    };
  }, [colors, typography, loading]);

  const handleColorChange = (key: ColorKey, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleFontFamilyChange = (value: string) => {
    setTypography((prev) => ({ ...prev, fontFamily: value }));
  };

  const handleFontSizeChange = (value: number) => {
    setTypography((prev) => ({ ...prev, fontSize: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const config: Partial<ThemeConfig> = { colors, typography };
      await http.patch<ThemeConfig>('/theme', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('შენახვა ვერ მოხდა. სცადეთ თავიდან.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setColors(DEFAULT_THEME_CONFIG.colors);
    setTypography(DEFAULT_THEME_CONFIG.typography);
  };

  const colorPairs: Array<[ColorKey, ColorKey]> = [
    ['primary', 'primaryForeground'],
    ['secondary', 'secondaryForeground'],
    ['background', 'foreground'],
    ['accent', 'accentForeground'],
  ];

  return (
    <>
      <style>{`
        :root {
          --preview-primary: ${colors.primary};
          --preview-primary-fg: ${colors.primaryForeground};
          --preview-secondary: ${colors.secondary};
          --preview-secondary-fg: ${colors.secondaryForeground};
          --preview-background: ${colors.background};
          --preview-foreground: ${colors.foreground};
          --preview-accent: ${colors.accent};
          --preview-accent-fg: ${colors.accentForeground};
        }
      `}</style>

      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">თიმის კასტომიზაცია</h2>
            <p className="text-sm text-muted-foreground">
              შეცვალეთ ფერები და შრიფტი მთელი საიტისთვის
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              ნაგულისხმევი
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? 'ინახება...' : saved ? 'შენახულია' : 'შენახვა'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">იტვირთება...</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Left — controls */}
            <div className="space-y-5">
              {/* Colors */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">ფერები</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {colorPairs.map(([baseKey, fgKey]) => (
                    <div key={baseKey}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {COLOR_LABELS[baseKey].replace(' Text', '')}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {([baseKey, fgKey] as ColorKey[]).map((key) => (
                          <div key={key} className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                              {COLOR_LABELS[key]}
                            </Label>
                            <div className="flex items-center gap-2">
                              <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-border">
                                <input
                                  type="color"
                                  value={colors[key].startsWith('#') ? colors[key] : '#ffffff'}
                                  onChange={(e) => handleColorChange(key, e.target.value)}
                                  className="absolute inset-0 size-full cursor-pointer border-0 p-0 opacity-0"
                                  aria-label={COLOR_LABELS[key]}
                                />
                                <div
                                  className="size-full"
                                  style={{ backgroundColor: colors[key] }}
                                  aria-hidden="true"
                                />
                              </div>
                              <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                                {colors[key]}
                              </code>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Typography */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">ტიპოგრაფია</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily" className="text-sm">
                      შრიფტი
                    </Label>
                    <select
                      id="fontFamily"
                      value={typography.fontFamily}
                      onChange={(e) => handleFontFamilyChange(e.target.value)}
                      className={[
                        'w-full rounded-md border border-input bg-background px-3 py-2',
                        'text-sm text-foreground ring-offset-background',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      ].join(' ')}
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f} value={f} style={{ fontFamily: f }}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <p
                      className="mt-1 text-xs text-muted-foreground"
                      style={{ fontFamily: `'${typography.fontFamily}', sans-serif` }}
                    >
                      Preview: The quick brown fox — {typography.fontFamily}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fontSize" className="text-sm">
                        შრიფტის ზომა
                      </Label>
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {typography.fontSize}px
                      </span>
                    </div>
                    <input
                      id="fontSize"
                      type="range"
                      min={FONT_SIZE_MIN}
                      max={FONT_SIZE_MAX}
                      step={1}
                      value={typography.fontSize}
                      onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{FONT_SIZE_MIN}px</span>
                      <span>{FONT_SIZE_MAX}px</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right — live preview */}
            <div className="space-y-5">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Header preview */}
                  <div
                    className="overflow-hidden rounded-lg"
                    style={{ backgroundColor: colors.secondary }}
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <span
                        className="text-sm font-black tracking-widest"
                        style={{ color: colors.primary }}
                      >
                        TRENDORA
                      </span>
                      <div className="flex gap-2">
                        <div
                          className="rounded-md px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: colors.primary,
                            color: colors.primaryForeground,
                            fontFamily: `'${typography.fontFamily}', sans-serif`,
                            fontSize: `${Math.max(10, typography.fontSize - 4)}px`,
                          }}
                        >
                          შესვლა
                        </div>
                        <div
                          className="rounded-md px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: 'transparent',
                            color: colors.secondaryForeground,
                            fontFamily: `'${typography.fontFamily}', sans-serif`,
                            fontSize: `${Math.max(10, typography.fontSize - 4)}px`,
                          }}
                        >
                          რეგისტრაცია
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content preview */}
                  <div
                    className="rounded-lg border p-4 space-y-3"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent,
                      fontFamily: `'${typography.fontFamily}', sans-serif`,
                      fontSize: `${typography.fontSize}px`,
                    }}
                  >
                    <h3
                      className="font-bold"
                      style={{
                        color: colors.foreground,
                        fontSize: `${typography.fontSize + 4}px`,
                      }}
                    >
                      პროდუქტის სათაური
                    </h3>
                    <p
                      className="leading-relaxed"
                      style={{
                        color: colors.foreground,
                        opacity: 0.7,
                        fontSize: `${typography.fontSize}px`,
                      }}
                    >
                      პროდუქტის მოკლე აღწერა — ეს არის ტექსტის preview რომელიც გვიჩვენებს
                      შრიფტს და ფონის ფერს.
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold"
                        style={{
                          color: colors.primary,
                          fontSize: `${typography.fontSize + 2}px`,
                        }}
                      >
                        ₾299
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: colors.accent,
                          color: colors.accentForeground,
                        }}
                      >
                        active
                      </span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <div
                        className="rounded-md px-4 py-2 text-sm font-medium"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.primaryForeground,
                        }}
                      >
                        კალათაში დამატება
                      </div>
                      <div
                        className="rounded-md border px-4 py-2 text-sm font-medium"
                        style={{
                          borderColor: colors.primary,
                          color: colors.primary,
                          backgroundColor: 'transparent',
                        }}
                      >
                        შენახვა
                      </div>
                    </div>
                  </div>

                  {/* Accent preview */}
                  <div
                    className="rounded-lg p-4"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: colors.accentForeground,
                        fontFamily: `'${typography.fontFamily}', sans-serif`,
                        fontSize: `${typography.fontSize}px`,
                      }}
                    >
                      Accent ფერის Preview — hover states, highlights
                    </p>
                  </div>

                  {/* Color swatches */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Color Palette</p>
                    <div className="flex gap-2">
                      {(
                        [
                          'primary',
                          'secondary',
                          'background',
                          'accent',
                        ] as ColorKey[]
                      ).map((key) => (
                        <div key={key} className="flex flex-col items-center gap-1">
                          <div
                            className="size-8 rounded-full border border-border shadow-sm"
                            style={{ backgroundColor: colors[key] }}
                            title={`${COLOR_LABELS[key]}: ${colors[key]}`}
                          />
                          <span className="text-xs text-muted-foreground">{colors[key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
