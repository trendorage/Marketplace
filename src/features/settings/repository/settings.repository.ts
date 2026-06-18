import { SettingsDocument, SettingsModel } from '@/features/settings/schema/settings.schema';
import { mongo } from '@/shared/lib/mongo';

export const settingsRepository = {
  async get(): Promise<SettingsDocument> {
    await mongo.connect();
    let doc = await SettingsModel.findOne({}).lean<SettingsDocument>().exec();
    if (!doc) {
      doc = await SettingsModel.create({});
      doc = await SettingsModel.findOne({}).lean<SettingsDocument>().exec() as SettingsDocument;
    }
    return doc;
  },

  async update(data: Partial<SettingsDocument>): Promise<SettingsDocument> {
    await mongo.connect();
    const doc = await SettingsModel.findOneAndUpdate(
      {},
      { $set: data },
      { upsert: true, new: true }
    ).lean<SettingsDocument>().exec();
    return doc as SettingsDocument;
  },
};
