import fs from 'fs';
import path from 'path';

interface Account {
  id: string;
  name: string;
  username: string;
  password: string;
}

interface AccountGroupData {
  id: string;
  name: string;
  accounts: Account[];
}

let accountFilePath = '';

function initializeAccountFilePath() {
  const os = process.platform;
  switch (os) {
    case 'win32': {
      // Windows: Use %APPDATA% environment variable

      if (!process.env.APPDATA) {
        throw Error('APPDATA environment variable not found');
      }

      accountFilePath = path.join(
        process.env.APPDATA,
        'dalphan-aio',
        'accounts.json',
      );

      break;
    }
    case 'darwin': {
      // MacOS: Use $HOME/Library/Application Support
      accountFilePath = `${process.env.HOME}/Library/Application Support/dalphan-aio/accounts.json`;

      break;
    }
    case 'linux': {
      // Linux: Use $HOME/.config
      accountFilePath = `${process.env.HOME}/.config/dalphan-aio/accounts.json`;

      break;
    }
    default:
      // Unsupported OS
      throw Error('Unsupported OS');
  }
}

export function checkAccountFile(filePath: string): string {
  // Check if the file does not exist
  if (!fs.existsSync(filePath)) {
    console.log('FILE DOES NOT EXIST!');

    // Create the file
    fs.writeFileSync(filePath, '{}');
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  // Key found. Return key value.
  return JSON.parse(fileContents);
}

export function createAccountGroup(accountGroupObject: AccountGroupData) {
  const fileContents = fs.readFileSync(accountFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  parsedData[accountGroupObject.id] = accountGroupObject;

  fs.writeFileSync(accountFilePath, JSON.stringify(parsedData));
}

export function removeAccountGroup(id: string) {
  const fileContents = fs.readFileSync(accountFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  delete parsedData[id];

  fs.writeFileSync(accountFilePath, JSON.stringify(parsedData));
}

export async function fetchAccountData() {
  console.log('fetching account data!');

  const accountData = checkAccountFile(accountFilePath);

  return accountData;
}

initializeAccountFilePath();
