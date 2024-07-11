// src/settings/settings.ts
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

interface Settings {
  prefix: string;
  default_volume: number;
  database_path: string;
  max_volume: number;
  min_volume: number;
  bot_token: string;
}

const settingsFilePath = path.resolve(__dirname, 'settings.conf');

export const loadSettings = (): Settings => {
  const settings: Partial<Settings> = {};

  const fileContents = fs.readFileSync(settingsFilePath, 'utf-8');
  const lines = fileContents.split('\n');

  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      switch (key.trim()) {
        case 'prefix':
          settings.prefix = value.trim();
          break;
        case 'default_volume':
          settings.default_volume = parseFloat(value.trim());
          break;
        case 'database_path':
          settings.database_path = value.trim();
          break;
        case 'max_volume':
          settings.max_volume = parseFloat(value.trim());
          break;
        case 'min_volume':
          settings.min_volume = parseFloat(value.trim());
          break;
      }
    }
  });

  settings.bot_token = process.env.BOT_TOKEN!;

  return settings as Settings;
};

const settings = loadSettings();
export default settings;
