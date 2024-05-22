/* eslint-disable no-else-return */
import Axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import {
  isAYCDApiKeyConnected,
  solveRecaptchaV2AYCD,
  solveRecaptchaV3AYCD,
} from './aycd';
import { availableHarvesters, captchaQueue, Signal } from './harvester';
import { getKeyFilePath, checkLoginFile } from './login';
// import MySupabaseClient from './supabase';

interface HotfixResponse {
  status: 'restart' | 'up-to-date' | 'error';
  version: number;
}

interface ShopifyCheckpointData {
  authToken: string;
  siteKey: string;
  url: string;
  captchaType: string;
  taskID: string;
}

interface ShopifyV3Data {
  siteKey: string;
  url: string;
  captchaType: string;
  taskID: string;
}

let hotfixFilePath = '';

const determineSystemType = () => {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === 'darwin' && arch === 'arm64') {
    return 'mac_m1';
  } else if (platform === 'darwin') {
    return 'mac';
  } else if (platform === 'win32') {
    return 'windows';
  } else {
    return 'unknown';
  }
};

const determineExtension = () => {
  const platform = os.platform();
  return platform === 'win32' ? '.exe' : '';
};

function checkHotfixFile() {
  if (!fs.existsSync(hotfixFilePath)) {
    // Create the directory
    fs.mkdirSync(hotfixFilePath);
  }

  if (!fs.existsSync(path.join(hotfixFilePath, 'hotfix.json'))) {
    // Create the hotfixes directory

    const defaultJSON = {
      version: 0,
      checksum: '',
      reference: '',
    };

    fs.writeFileSync(
      path.join(hotfixFilePath, 'hotfix.json'),
      JSON.stringify(defaultJSON),
    );
  }

  const fileContents = fs.readFileSync(
    path.join(hotfixFilePath, 'hotfix.json'),
    'utf8',
  );

  return JSON.parse(fileContents);
}

export function GetHotfixVersionNumber() {
  const hotfixFile = checkHotfixFile();
  return hotfixFile.version;
}

function clearHotfixFiles() {
  const directoryPath = hotfixFilePath; // Replace with your directory path
  const fileContents = checkHotfixFile();
  const fileExtension = determineExtension();

  fs.readdir(directoryPath, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      if (
        file !== 'hotfix.json' &&
        file !== `${fileContents.reference}${fileExtension}`
      ) {
        fs.unlink(path.join(directoryPath, file), (err2) => {
          if (err2) throw err2;
        });
      }
    });
  });
}

export function LaunchModules() {
  // Launch the modules

  const fileContents = checkHotfixFile();
  const fileExtension = determineExtension();

  // Clear out past hotfix files.
  clearHotfixFiles();

  const filePath = path.join(
    hotfixFilePath,
    `${fileContents.reference}${fileExtension}`,
  );

  // Check to see that the brain.exe file exists.
  if (fs.existsSync(filePath)) {
    // Launch the brain.exe file
    fs.chmodSync(filePath, '755'); // '755' allows read, write, and execute for owner, and read and execute for group and others
    const brain = spawn(filePath);

    return brain;
  }
  return null;
}

export async function RestartAndInstall(
  brainProcess: ChildProcessWithoutNullStreams,
) {
  // Kill the brain process
  brainProcess.kill();

  return true;
}

function generateFileReference() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < 8; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export async function CheckHotfixUpdate(): Promise<HotfixResponse> {
  return new Promise((resolve, reject) => {
    async function checkIt() {
      const systemType = determineSystemType();

      const response = await Axios.get(
        `https://urchin-app-jim59.ondigitalocean.app/?os=${systemType}`,
      );

      if (response.data.version !== undefined) {
        const hotfixFile = checkHotfixFile();

        if (hotfixFile.version !== response.data.version) {
          const fileReference = generateFileReference();

          const newHotfixFile = {
            version: response.data.version,
            reference: fileReference,
          };

          // Determine if we are on windows, mac, or mac_m1

          const downloadURL = response.data.download_url;

          const brainDownloadResponse = await Axios({
            method: 'GET',
            url: downloadURL,
            responseType: 'stream',
          });

          const fileExtension = determineExtension();

          // Download the file to a temporary location
          const tempPath = path.join(
            hotfixFilePath,
            `${fileReference}${fileExtension}`,
          );

          if (brainDownloadResponse.data) {
            const writer = fs.createWriteStream(tempPath);
            brainDownloadResponse.data.pipe(writer);

            writer.on('finish', () => {
              console.log(`Downloaded brain to ${tempPath}`);
              fs.writeFileSync(
                path.join(hotfixFilePath, 'hotfix.json'),
                JSON.stringify(newHotfixFile),
              );
              resolve({
                status: 'restart',
                version: response.data.version,
              });
            });

            writer.on('error', (error) => {
              console.error(`Error downloading brain: ${error.message}`);
              reject(new Error(`Error downloading brain: ${error.message}`));
            });
          } else {
            reject(new Error('No data returned from download'));
          }
        } else {
          console.log(hotfixFile);
          console.log(response.data);

          resolve({
            status: 'up-to-date',
            version: response.data.version,
          });
        }
      } else {
        reject(new Error('API request failed'));
      }
    }

    checkIt();
  });
}

function initializeHotfixFilePath() {
  const userDirectory = os.homedir();
  const myOS = process.platform;

  switch (myOS) {
    case 'win32': {
      hotfixFilePath = path.join(userDirectory, 'dalphan-aio');

      break;
    }
    case 'darwin': {
      hotfixFilePath = path.join(userDirectory, 'dalphan-aio');
      break;
    }
    case 'linux': {
      hotfixFilePath = path.join(userDirectory, 'dalphan-aio');
      break;
    }
    default:
      // Unsupported OS
      throw Error('Unsupported OS');
  }
}

initializeHotfixFilePath();

function solveCaptcha(captchaSignal: Signal): Promise<any> {
  return new Promise((resolve) => {
    // Render the captcha in the harvester window.
    // We should have a function that renders the captcha in the harvester window.

    // We are going to loop through the available harvesters, and send the captcha to an available harvester that matches the captcha type.
    // If there are no available harvesters, we will send the captcha data to a queue, and wait for a harvester to become available.

    const parsedData: ShopifyCheckpointData | ShopifyV3Data = JSON.parse(
      captchaSignal.data,
    );

    const found = availableHarvesters.some((harvester) => {
      console.log(harvester);

      if (harvester.available) {
        if (
          (parsedData.captchaType === 'g-recaptcha' ||
            parsedData.captchaType === 'h-captcha') &&
          harvester.type === 'Shopify Checkpoint'
        ) {
          harvester.browser.webContents.once('did-finish-load', () => {
            // Only send the captcha signal once the window has finished loading
            harvester.browser.webContents.send('captcha', [
              captchaSignal,
              harvester.id,
            ]);
          });

          harvester.available = false;

          console.log('Solve captcha!');

          const taskURL = new URL(parsedData.url);

          const myURL = new URL(`http://dalphancaptcha.${taskURL.hostname}/`);

          myURL.searchParams.append('id', harvester.id);

          myURL.searchParams.append('taskID', captchaSignal.taskID);

          console.log(`Loading URL: ${myURL.toString()}`);

          harvester.browser.loadURL(myURL.toString());
          return true; // breaks out of the loop
        } else if (
          parsedData.captchaType === 'v3' &&
          harvester.type === 'Shopify Account'
        ) {
          harvester.browser.webContents.once('did-finish-load', () => {
            // Only send the captcha signal once the window has finished loading
            harvester.browser.webContents.send('captcha', [
              captchaSignal,
              harvester.id,
            ]);
          });

          harvester.available = false;

          console.log('Solve captcha!');

          const taskURL = new URL(parsedData.url);

          const myURL = new URL(`http://dalphancaptcha.${taskURL.hostname}/`);

          myURL.searchParams.append('id', harvester.id);

          myURL.searchParams.append('taskID', captchaSignal.taskID);

          console.log(`Loading URL: ${myURL.toString()}`);

          harvester.browser.loadURL(myURL.toString());
          return true; // breaks out of the loop
        }
      }

      return false; // continues the loop
    });

    if (!found) {
      captchaQueue.push(captchaSignal);
    }

    resolve('success');
  });
}

export async function handleSignal(signal: Signal) {
  // This function will handle the signal from the brain process.

  if (signal.action === 'request-shopify-checkpoint') {
    // Now we will handle the checkpoint solve.

    // Parse the JSON from the signal.data

    const parsedData: ShopifyCheckpointData = JSON.parse(signal.data);

    parsedData.taskID = signal.taskID;

    // Check to see if AYCD API Key is connected. If so, use it to solve the captcha.
    if (isAYCDApiKeyConnected && parsedData.captchaType === 'g-recaptcha') {
      const response = await solveRecaptchaV2AYCD(parsedData);

      const mySignal: Signal = {
        taskID: signal.taskID,
        action: 'response-shopify-checkpoint',
        status: 'Solved Captcha',
        statusType: 'success',
        isRunning: true,
        site: signal.site,
        siteName: signal.siteName,
        mode: signal.mode,
        input: signal.input,
        size: signal.size,
        monitorDelay: signal.monitorDelay,
        retryDelay: signal.retryDelay,
        productQuantity: signal.productQuantity,
        minSizesLoaded: signal.minSizesLoaded,
        minPrice: signal.minPrice,
        maxPrice: signal.maxPrice,
        profile: signal.profile,
        proxy: signal.proxy,
        account: signal.account,
        webhook: signal.webhook,
        data: JSON.stringify(response),
      };

      return mySignal;
    }

    // Otherwise, use the built-in solver.
    solveCaptcha(signal);
  } else if (signal.action === 'request-shopify-v3') {
    console.log(signal.action);

    const parsedData: ShopifyV3Data = JSON.parse(signal.data);

    parsedData.taskID = signal.taskID;

    // Check to see if AYCD API Key is connected. If so, use it to solve the captcha.
    if (isAYCDApiKeyConnected) {
      const response = await solveRecaptchaV3AYCD(parsedData);

      const mySignal: Signal = {
        taskID: signal.taskID,
        action: 'response-shopify-v3',
        status: 'Solved Captcha',
        statusType: 'success',
        isRunning: true,
        site: signal.site,
        siteName: signal.siteName,
        mode: signal.mode,
        input: signal.input,
        size: signal.size,
        monitorDelay: signal.monitorDelay,
        retryDelay: signal.retryDelay,
        productQuantity: signal.productQuantity,
        minSizesLoaded: signal.minSizesLoaded,
        minPrice: signal.minPrice,
        maxPrice: signal.maxPrice,
        profile: signal.profile,
        proxy: signal.proxy,
        account: signal.account,
        webhook: signal.webhook,
        data: JSON.stringify(response),
      };

      return mySignal;
    }

    solveCaptcha(signal);
  } else if (signal.statusType === 'success') {
    const keyFilePath = getKeyFilePath();
    const key = checkLoginFile(keyFilePath);
    // CALL SUPABASE FUNCTION

    console.log(`Fetching user data tied to key: ${key}`);

    // const parsedSignalData = JSON.parse(signal.data);

    // const { data, error } = await MySupabaseClient.rpc('submit_checkout', {
    //   p_key: key,
    //   id: parsedSignalData.id,
    //   created_at: parsedSignalData.created_at,
    //   site: parsedSignalData.site,
    //   size: parsedSignalData.size,
    //   order_num: parsedSignalData.order_num,
    //   proxy: parsedSignalData.proxy,
    //   mode: parsedSignalData.mode,
    //   product: parsedSignalData.product,
    //   quantity: parsedSignalData.quantity,
    //   price: parsedSignalData.price,
    //   img: parsedSignalData.img,
    // });
    // We need to send our checkout data to the supabase checkouts table.

    // if (error) {
    //   console.log(`Error submitting checkout data:${error}`);
    //   console.log(error);
    //   return new Error('Error submitting checkout data!');
    // }

    // console.log(data);

    return null;
  }

  return null;
}
