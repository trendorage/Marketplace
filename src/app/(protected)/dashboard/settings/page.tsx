'use client';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import { http } from '@/shared/lib/http';

type SettingsData = {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  defaultCommission: number;
  sellerCommission: number;
  minPayout: number;
  emailNewOrder: boolean;
  emailNewUser: boolean;
  emailNewSeller: boolean;
  emailLowStock: boolean;
  emailSystem: boolean;
};

type SettingsSection = {
  id: string;
  label: string;
};

const SECTIONS: SettingsSection[] = [
  { id: 'general', label: 'ზოგადი' },
  { id: 'payment', label: 'გადახდა' },
  { id: 'commission', label: 'კომისია' },
  { id: 'notifications', label: 'შეტყობინებები' },
];

const DEFAULT_SETTINGS: SettingsData = {
  siteName: 'Trendora',
  siteUrl: 'https://trendora.ge',
  supportEmail: 'support@trendora.ge',
  defaultCommission: 10,
  sellerCommission: 8,
  minPayout: 50,
  emailNewOrder: true,
  emailNewUser: true,
  emailNewSeller: true,
  emailLowStock: false,
  emailSystem: true,
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);

  useEffect(() => {
    http.get<SettingsData>('/settings')
      .then((res) => setSettings(res))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await http.patch<SettingsData>('/settings', settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof SettingsData) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInput = (key: keyof SettingsData, value: string | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">პარამეტრები</h2>
        <p className="text-sm text-muted-foreground">Trendora Marketplace-ის კონფიგურაცია</p>
      </div>

      <div className="flex gap-6">
        <div className="hidden w-48 shrink-0 sm:block">
          <nav className="space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={
                  activeSection === section.id
                    ? 'w-full rounded-lg bg-primary px-3 py-2 text-left text-sm font-medium text-primary-foreground'
                    : 'w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground'
                }
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex gap-1 sm:hidden">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={
                  activeSection === section.id
                    ? 'rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground'
                    : 'rounded-lg bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground'
                }
              >
                {section.label}
              </button>
            ))}
          </div>

          {activeSection === 'general' && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">ზოგადი პარამეტრები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-sm">საიტის სახელი</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleInput('siteName', e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl" className="text-sm">საიტის URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => handleInput('siteUrl', e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail" className="text-sm">საკონტაქტო Email</Label>
                  <Input
                    id="supportEmail"
                    value={settings.supportEmail}
                    onChange={(e) => handleInput('supportEmail', e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'commission' && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">კომისიის პარამეტრები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="defaultCommission" className="text-sm">
                    სტანდარტული კომისია (%)
                  </Label>
                  <Input
                    id="defaultCommission"
                    type="number"
                    value={settings.defaultCommission}
                    onChange={(e) => handleInput('defaultCommission', +e.target.value)}
                    className="max-w-32"
                  />
                  <p className="text-xs text-muted-foreground">ნაგულისხმევი კომისია ყველა გამყიდველისთვის</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="sellerCommission" className="text-sm">
                    Premium გამყიდველის კომისია (%)
                  </Label>
                  <Input
                    id="sellerCommission"
                    type="number"
                    value={settings.sellerCommission}
                    onChange={(e) => handleInput('sellerCommission', +e.target.value)}
                    className="max-w-32"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="minPayout" className="text-sm">
                    მინიმალური გადახდა (₾)
                  </Label>
                  <Input
                    id="minPayout"
                    type="number"
                    value={settings.minPayout}
                    onChange={(e) => handleInput('minPayout', +e.target.value)}
                    className="max-w-32"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">Email შეტყობინებები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { key: 'emailNewOrder' as const, label: 'ახალი შეკვეთა', desc: 'შეტყობინება ყოველი ახალი შეკვეთისას' },
                  { key: 'emailNewUser' as const, label: 'ახალი მომხმარებელი', desc: 'შეტყობინება რეგისტრაციისას' },
                  { key: 'emailNewSeller' as const, label: 'ახალი გამყიდველი', desc: 'შეტყობინება გამყიდველის მოთხოვნისას' },
                  { key: 'emailLowStock' as const, label: 'მარაგის გაფრთხილება', desc: 'შეტყობინება მარაგის ამოწურვისას' },
                  { key: 'emailSystem' as const, label: 'სისტემური', desc: 'სისტემური შეტყობინებები' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={settings[key] as boolean}
                      onCheckedChange={() => handleToggle(key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === 'payment' && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">გადახდის პარამეტრები</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted p-4">
                  <p className="text-sm font-medium text-foreground">BoG Payment Gateway</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">მთავარი გადახდის სისტემა</p>
                  <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    დაკავშირებული
                  </span>
                </div>
                <div className="rounded-lg border border-border bg-muted p-4">
                  <p className="text-sm font-medium text-foreground">TBC Pay</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">დამატებითი გადახდის სისტემა</p>
                  <span className="mt-2 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    კონფიგურაციისთვის
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saved ? 'შენახულია ✓' : saving ? 'ინახება...' : 'შენახვა'}
          </Button>
        </div>
      </div>
    </div>
  );
}
