import { settingsRepository } from '@/features/settings/repository/settings.repository';
import type { SettingsDocument } from '@/features/settings/schema/settings.schema';
import type { ServiceResult } from '@/shared/types/common';

type Settings = {
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

function docToSettings(doc: SettingsDocument): Settings {
  return {
    siteName: doc.siteName ?? 'Trendora',
    siteUrl: doc.siteUrl ?? 'https://trendora.ge',
    supportEmail: doc.supportEmail ?? 'support@trendora.ge',
    defaultCommission: doc.defaultCommission ?? 10,
    sellerCommission: doc.sellerCommission ?? 8,
    minPayout: doc.minPayout ?? 50,
    emailNewOrder: doc.emailNewOrder ?? true,
    emailNewUser: doc.emailNewUser ?? true,
    emailNewSeller: doc.emailNewSeller ?? true,
    emailLowStock: doc.emailLowStock ?? false,
    emailSystem: doc.emailSystem ?? true,
  };
}

export async function getSettingsService(): Promise<ServiceResult<Settings>> {
  const doc = await settingsRepository.get();
  return { data: docToSettings(doc), status: 200 };
}

export async function updateSettingsService(
  input: Partial<Settings>
): Promise<ServiceResult<Settings>> {
  const doc = await settingsRepository.update(input as Partial<SettingsDocument>);
  return { data: docToSettings(doc), status: 200 };
}
