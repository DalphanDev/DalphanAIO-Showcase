import fs from 'fs';
import path from 'path';

let miscFilePath = '';

interface Option {
  value: string;
  label: string;
}

export interface ShopifyAutomation {
  id: string;
  name: string;
  site: Option[];
  size: Option[];
  isRunning: boolean;
  input: string;
  monitorDelay: string;
  retryDelay: string;
  productQuantity: string;
  minSizesLoaded: string;
  minPrice: string;
  maxPrice: string;
  profileGroup: Option;
  profileItems: Option[];
  proxyMonitor: Option;
  proxyTask: Option;
  accountGroup: Option;
  accountItems: Option[];
}

export interface NikeAutomation {}

export interface Misc {
  automations: {
    shopify: ShopifyAutomation[];
    nike: NikeAutomation[];
  };
  customShopify: Option[];
}

function initializeMiscFilePath() {
  const os = process.platform;
  switch (os) {
    case 'win32': {
      // Windows: Use %APPDATA% environment variable

      if (!process.env.APPDATA) {
        throw Error('APPDATA environment variable not found');
      }

      miscFilePath = path.join(process.env.APPDATA, 'dalphan-aio', 'misc.json');

      break;
    }
    case 'darwin': {
      // MacOS: Use $HOME/Library/Application Support
      miscFilePath = `${process.env.HOME}/Library/Application Support/dalphan-aio/misc.json`;

      break;
    }
    case 'linux': {
      // Linux: Use $HOME/.config
      miscFilePath = `${process.env.HOME}/.config/dalphan-aio/misc.json`;

      break;
    }
    default:
      // Unsupported OS
      throw Error('Unsupported OS');
  }
}

function checkMiscFile(filePath: string): Misc {
  // Check if the file does not exist
  if (!fs.existsSync(filePath)) {
    console.log('FILE DOES NOT EXIST!');

    const emptyMiscObject = {
      automations: {
        shopify: [],
        nike: [],
      },
      customShopify: [],
    };

    // Create the file
    fs.writeFileSync(filePath, JSON.stringify(emptyMiscObject));
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  return JSON.parse(fileContents);
}

export async function fetchMiscData() {
  console.log('fetching misc data!');
  const miscData = checkMiscFile(miscFilePath);

  const miscObject = {
    automations: {
      shopify: miscData.automations.shopify,
      nike: miscData.automations.nike,
    },
    customShopify: miscData.customShopify,
  };

  return miscObject;
}

export function updateMiscData(miscObject: Misc) {
  const newObject = {
    automations: { ...miscObject.automations },
    customShopify: miscObject.customShopify,
  };

  fs.writeFileSync(miscFilePath, JSON.stringify(newObject));
}

initializeMiscFilePath();
