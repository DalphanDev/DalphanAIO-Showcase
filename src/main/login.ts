/* eslint-disable no-undef */
import fs from 'fs';
import path from 'path';
import { machineIdSync } from 'node-machine-id';
// import MySupabaseClient from './supabase';

let keyFilePath = '';

export interface WhopResponse {
  discord: {
    id: string;
    username: string;
    image_url: string;
  };
  id: string;
  license_key: string;
  manage_url: string;
  status: string;
}

const FakeUser = {
  discord: {
    id: '123',
    username: 'User',
    image_url:
      'https://miro.medium.com/v2/resize:fit:1080/0*A7MUqyCLvZDcHkfM.jpg',
  },
  id: '123',
  license_key: 'abc123',
  manage_url: 'https://dalphan.com',
  status: 'valid',
} as WhopResponse;

function initializeKeyFilePath() {
  const os = process.platform;
  switch (os) {
    case 'win32': {
      // Windows: Use %APPDATA% environment variable

      if (!process.env.APPDATA) {
        throw Error('APPDATA environment variable not found');
      }

      keyFilePath = path.join(process.env.APPDATA, 'dalphan-aio', 'key.txt');

      break;
    }
    case 'darwin': {
      // MacOS: Use $HOME/Library/Application Support
      keyFilePath = `${process.env.HOME}/Library/Application Support/dalphan-aio/key.txt`;

      break;
    }
    case 'linux': {
      // Linux: Use $HOME/.config
      keyFilePath = `${process.env.HOME}/.config/dalphan-aio/key.txt`;

      break;
    }
    default:
      // Unsupported OS
      throw Error('Unsupported OS');
  }
}

export async function RegisterInstance(
  key: string,
  machineID: string,
): Promise<WhopResponse | 'failure'> {
  console.log(
    `Registering instance with key: ${key} and machineID: ${machineID}`,
  );

  // const { data, error } = (await MySupabaseClient.functions.invoke(
  //   'registerInstance',
  //   {
  //     body: { keyID: key, machineID },
  //   },
  // )) as { data: WhopResponse; error: ResponseType | null };
  // if (error) {
  //   console.log(error);
  //   return 'failure';
  // }
  // console.log(data);

  // const parsedData = JSON.parse(data);

  // Write the key to the file
  fs.writeFileSync(keyFilePath, key);

  // const { discord, id, license_key, manage_url, status } = data as WhopResponse;

  // return JSON.parse(data) as WhopResponse;
  return FakeUser;
}

export function checkLoginFile(filePath: string): string | null {
  // Check if the file does not exist
  if (!fs.existsSync(filePath)) {
    console.log('FILE DOES NOT EXIST!');

    // Create the file
    fs.writeFileSync(filePath, '');
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  // Check to see if the file is empty
  if (fileContents === '') {
    // No key found
    return null;
  }

  // Key found. Return key value.
  return fileContents;
}

export async function loginKey(): Promise<WhopResponse | 'failure'> {
  console.log('Attempting to automatically login...');

  // Run checks on the file
  // const key = checkLoginFile(keyFilePath);
  const key = 'test';

  // if (key === null) {
  //   return 'failure';
  // }

  // console.log(key);

  // Now attempt to login with the key
  const keyResponse = await RegisterInstance(key, machineIdSync(true));

  return keyResponse;
}

export function getKeyFilePath() {
  return keyFilePath;
}

initializeKeyFilePath();
