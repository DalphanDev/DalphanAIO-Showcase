import fs from 'fs';
import path from 'path';

interface Profile {
  id: string;
  name: string;
  sameAsShipping: boolean;
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: number;
    address1: string;
    address2: string;
    country: string;
    city: string;
    state: string;
    zip: number;
  };
  billing: {
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    country: string;
    city: string;
    state: string;
    zip: number;
  };
  payment: {
    cardType: string;
    cardHolder: string;
    cardNumber: number;
    expiry: string;
    cvv: number;
  };
}

interface ProfileGroupData {
  id: string;
  name: string;
  profiles: Profile[];
}

let profileFilePath = '';

function initializeProfileFilePath() {
  const os = process.platform;
  switch (os) {
    case 'win32': {
      // Windows: Use %APPDATA% environment variable

      if (!process.env.APPDATA) {
        throw Error('APPDATA environment variable not found');
      }

      profileFilePath = path.join(
        process.env.APPDATA,
        'dalphan-aio',
        'profiles.json'
      );

      break;
    }
    case 'darwin': {
      // MacOS: Use $HOME/Library/Application Support
      profileFilePath = `${process.env.HOME}/Library/Application Support/dalphan-aio/profiles.json`;

      break;
    }
    case 'linux': {
      // Linux: Use $HOME/.config
      profileFilePath = `${process.env.HOME}/.config/dalphan-aio/profiles.json`;

      break;
    }
    default:
      // Unsupported OS
      throw Error('Unsupported OS');
  }
}

export function checkProfileFile(filePath: string): string {
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

export function createProfileGroup(profileGroupObject: ProfileGroupData) {
  const fileContents = fs.readFileSync(profileFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  parsedData[profileGroupObject.id] = profileGroupObject;

  fs.writeFileSync(profileFilePath, JSON.stringify(parsedData));
}

export function removeProfileGroup(id: string) {
  const fileContents = fs.readFileSync(profileFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  delete parsedData[id];

  fs.writeFileSync(profileFilePath, JSON.stringify(parsedData));
}

export async function fetchProfileData() {
  console.log('fetching profile data!');
  // const fileContents = fs.readFileSync(profileFilePath, 'utf8');

  const profileData = checkProfileFile(profileFilePath);

  return profileData;
}

initializeProfileFilePath();
