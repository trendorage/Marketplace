import { SettingsDocument, SettingsModel } from '@/features/settings/schema/settings.schema';
import { mongo } from '@/shared/lib/mongo';

const SETTINGS_KEY = 'global';

export const settingsRepository = {
  async findGlobal(): Promise<SettingsDocument | null> {
    await mongo.connect();
    return SettingsModel.findOne({ key: SETTINGS_KEY }).lean<SettingsDocument>().exec();
  },

  async upsertTheme(themeColors: string, themeTypography: string): Promise<void> {
    await mongo.connect();
    await SettingsModel.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { themeColors, themeTypography } },
      { upsert: true, new: true }
    ).exec();
  },
};
