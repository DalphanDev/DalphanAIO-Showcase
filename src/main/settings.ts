import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { GetHotfixVersionNumber } from './hotfix';

let settingsFilePath = '';

interface Webhook {
  success: string;
  failure: string;
  misc: string;
}

interface Settings {
  aycd: {
    apiKey: {
      key: string;
      connected: boolean;
    };
    aiKey: {
      key: string;
      connected: boolean;
    };
  };
  version: {
    main: string;
    hotfix: string;
  };
  webhook: Webhook;
}

function initializeSettingsFilePath() {
  const os = process.platform;
  switch (os) {
    case 'win32': {
      // Windows: Use %APPDATA% environment variable

      if (!process.env.APPDATA) {
        throw Error('APPDATA environment variable not found');
      }

      settingsFilePath = path.join(
        process.env.APPDATA,
        'dalphan-aio',
        'settings.json',
      );

      break;
    }
    case 'darwin': {
      // MacOS: Use $HOME/Library/Application Support
      settingsFilePath = `${process.env.HOME}/Library/Application Support/dalphan-aio/settings.json`;

      break;
    }
    case 'linux': {
      // Linux: Use $HOME/.config
      settingsFilePath = `${process.env.HOME}/.config/dalphan-aio/settings.json`;

      break;
    }
    default:
      // Unsupported OS
      throw Error('Unsupported OS');
  }
}

function checkSettingsFile(filePath: string): Settings {
  // Check if the file does not exist
  if (!fs.existsSync(filePath)) {
    console.log('FILE DOES NOT EXIST!');

    const emptySettingsObject = {
      aycd: {
        apiKey: {
          key: '',
          connected: false,
        },
        aiKey: {
          key: '',
          connected: false,
        },
      },
      webhook: {
        success: '',
        failure: '',
        misc: '',
      },
    };

    // Create the file
    fs.writeFileSync(filePath, JSON.stringify(emptySettingsObject));
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  return JSON.parse(fileContents);
}

export function GetVersionNumber() {
  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  if (isDebug) {
    const packagePath = path.resolve(
      __dirname,
      '../../release/app/package.json',
    );
    const fileContents = fs.readFileSync(packagePath, 'utf8');
    const parsedData = JSON.parse(fileContents);
    return parsedData.version;
  }

  return app.getVersion();
}

export async function fetchSettingsData() {
  console.log('fetching settings data!');
  const version = await GetVersionNumber();
  const hotfixVersion = await GetHotfixVersionNumber();
  const settingsData = checkSettingsFile(settingsFilePath);

  const settingsObject = {
    aycd: {
      apiKey: settingsData.aycd.apiKey,
      aiKey: settingsData.aycd.aiKey,
    },
    version: {
      main: version,
      hotfix: `0.0.${hotfixVersion}`,
    },
    webhook: settingsData.webhook,
  };

  return settingsObject;
}

export function updateSettingsData(settingsObject: Settings) {
  const newObject = {
    aycd: { ...settingsObject.aycd },
    webhook: { ...settingsObject.webhook },
  };

  fs.writeFileSync(settingsFilePath, JSON.stringify(newObject));
}

initializeSettingsFilePath();
