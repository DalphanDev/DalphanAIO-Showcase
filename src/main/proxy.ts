import fs from 'fs';
import path from 'path';

interface ProxyGroupData {
  id: string;
  name: string;
  proxies: string[];
}

let proxyFilePath = '';

function initializeProxyFilePath() {
  const os = process.platform;
  switch (os) {
    case 'win32': {
      // Windows: Use %APPDATA% environment variable

      if (!process.env.APPDATA) {
        throw Error('APPDATA environment variable not found');
      }

      proxyFilePath = path.join(
        process.env.APPDATA,
        'dalphan-aio',
        'proxies.json',
      );

      break;
    }
    case 'darwin': {
      // MacOS: Use $HOME/Library/Application Support
      proxyFilePath = `${process.env.HOME}/Library/Application Support/dalphan-aio/proxies.json`;

      break;
    }
    case 'linux': {
      // Linux: Use $HOME/.config
      proxyFilePath = `${process.env.HOME}/.config/dalphan-aio/proxies.json`;

      break;
    }
    default:
      // Unsupported OS
      throw Error('Unsupported OS');
  }
}

export function checkProxyFile(filePath: string): string {
  // Check if the file does not exist
  if (!fs.existsSync(filePath)) {
    console.log('FILE DOES NOT EXIST!');

    // Create the file
    fs.writeFileSync(filePath, '{}');
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  return JSON.parse(fileContents);
}

export function createProxyGroup(proxyGroupObject: ProxyGroupData) {
  const fileContents = fs.readFileSync(proxyFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  parsedData[proxyGroupObject.id] = proxyGroupObject;

  fs.writeFileSync(proxyFilePath, JSON.stringify(parsedData));
}

export function removeProxyGroup(id: string) {
  const fileContents = fs.readFileSync(proxyFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  delete parsedData[id];

  fs.writeFileSync(proxyFilePath, JSON.stringify(parsedData));
}

export async function fetchProxyData() {
  console.log('fetching proxy data!');
  const proxyData = checkProxyFile(proxyFilePath);

  return proxyData;
}

initializeProxyFilePath();
