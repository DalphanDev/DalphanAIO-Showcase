/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import DiscordRPC from 'discord-rpc';
import log from 'electron-log';
import puppeteer, { Browser } from 'puppeteer';
import { createCursor } from 'ghost-cursor';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { machineIdSync } from 'node-machine-id';
import axios from 'axios';
import sharp from 'sharp';
import Victor from 'victor';
import { RegisterInstance, loginKey, WhopResponse } from './login';
import { createTaskGroup, removeTaskGroup, fetchTaskData } from './task';
import {
  createProfileGroup,
  removeProfileGroup,
  fetchProfileData,
} from './profile';
import { createProxyGroup, removeProxyGroup, fetchProxyData } from './proxy';
import {
  createHarvester,
  removeHarvester,
  fetchHarvesterData,
  loginHarvester,
  launchHarvester,
  resetHarvester,
  handleQueue,
} from './harvester';
import {
  createAccountGroup,
  removeAccountGroup,
  fetchAccountData,
} from './account';
import { fetchMiscData, updateMiscData } from './misc';
import { fetchSettingsData, updateSettingsData } from './settings';
import {
  CheckHotfixUpdate,
  LaunchModules,
  RestartAndInstall,
  handleSignal,
} from './hotfix';
import { ConnectWebsocket, GetWebsocketStatus } from './ws';
import MenuBuilder from './menu';
import {
  // fetchUserData,
  fetchCheckoutData,
  resolveHtmlPath,
  testWebhook,
} from './util';
import { aiKey, establishApiConnection, updateAIKey } from './aycd';

const puppeteerPort = 9222; // Replace with your desired port

// Set remote debugging port and address
app.commandLine.appendSwitch('remote-debugging-port', `${puppeteerPort}`);
app.commandLine.appendSwitch('remote-debugging-address', '127.0.0.1');
app.commandLine.appendSwitch('enable-features', 'NetworkService');
app.commandLine.appendSwitch('disable-features', 'site-per-process');
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch(
  'host-rules',
  'MAP dalphancaptcha.*.* 127.0.0.1:1738',
);

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let myBrowser: Browser | null = null;
let loginWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
let websocketInitiated = false;
let brain: ChildProcessWithoutNullStreams | null = null;
let hotfixAvailable = false;
let mainUpdateAvailable = false;
let mainUpdateDownloaded = false;
let whopData = {} as WhopResponse;

const writeBrainQueue: string[] = [];
let writeBrainAvailable = true;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('get-ws-status', () => {
  return GetWebsocketStatus();
});

ipcMain.handle('fetch-data', async () => {
  // const userData = await fetchUserData();

  console.log(whopData);
  const userData = {
    img: whopData.discord.image_url,
    name: whopData.discord.username,
    key: whopData.license_key,
    manage_url: whopData.manage_url,
  };
  const checkoutData = await fetchCheckoutData();
  const taskData = await fetchTaskData();
  const profileData = await fetchProfileData();
  const proxyData = await fetchProxyData();
  const harvesterData = await fetchHarvesterData();
  const accountData = await fetchAccountData();
  const miscData = await fetchMiscData();
  const settingsData = await fetchSettingsData();

  // We are also going to attempt to establish a connection to the AYCD API here.
  establishApiConnection(settingsData.aycd.apiKey.key);
  updateAIKey(settingsData.aycd.aiKey.key);

  const windowData = {
    User: userData,
    Checkouts: checkoutData,
    Tasks: taskData,
    Profiles: profileData,
    Proxies: proxyData,
    Harvesters: harvesterData,
    Accounts: accountData,
    Misc: miscData,
    Settings: settingsData,
  };

  return windowData;
});

const connectPuppeteer = async () => {
  try {
    myBrowser = await puppeteer.connect({
      browserURL: `http://127.0.0.1:9222`,
      defaultViewport: null,
    });
    console.log('Puppeteer connected:', myBrowser);
    const pages = await myBrowser.pages();
    console.log('Page:', pages[0]);
  } catch (error) {
    console.error('Error connecting puppeteer:', error);
  }
};

const writeToBrain = () => {
  if (brain !== null && writeBrainQueue.length > 0) {
    // If brain is available and there is something in the queue
    writeBrainAvailable = false;
    const signal = writeBrainQueue.shift(); // Get the next signal from the queue

    console.log(`stdin: ${signal}`);
    brain.stdin.write(`${signal}\n`, () => {
      // After writing one signal, check if there are more signals in the queue
      if (writeBrainQueue.length > 0) {
        // If there are more signals, continue writing
        writeToBrain();
      } else {
        // If no more signals, set writeBrainAvailable to true
        writeBrainAvailable = true;
      }
    });
  }
};

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

ipcMain.on('click-grecaptcha-checkbox', async (event, args) => {
  console.log('Clicking grecaptcha checkbox');

  const harvesterID = args;

  // First, we need to get our pages
  const pages = await myBrowser?.pages();

  if (pages === undefined) {
    return;
  }

  // Now we need to find the page that has the grecaptcha checkbox
  const guids = await Promise.all(
    pages.map(async (testPage) => {
      try {
        const myURL = new URL(testPage.url());

        const myParams = myURL.searchParams;

        const id = myParams.get('id');

        if (id !== null) {
          return id;
        }
        return undefined;
      } catch {
        return undefined;
      }
    }),
  );

  const index = guids.findIndex((testGuid) => testGuid === harvesterID);

  // Now we have the index of the page that we need to click the checkbox on

  const myPage = pages[index];

  await delay(100);

  myPage.mouse.move(45, 188);

  myPage.mouse.click(45, 188);
});

ipcMain.on('click-hcaptcha-checkbox', async (event, args) => {
  console.log('Clicking hcaptcha checkbox');

  const harvesterID = args;

  // First, we need to get our pages
  const pages = await myBrowser?.pages();

  if (pages === undefined) {
    return;
  }

  // Now we need to find the page that has the grecaptcha checkbox
  const guids = await Promise.all(
    pages.map(async (testPage) => {
      try {
        const myURL = new URL(testPage.url());

        const myParams = myURL.searchParams;

        const id = myParams.get('id');

        if (id !== null) {
          return id;
        }
        return undefined;
      } catch {
        return undefined;
      }
    }),
  );

  const index = guids.findIndex((testGuid) => testGuid === harvesterID);

  // Now we have the index of the page that we need to click the checkbox on

  const myPage = pages[index];

  await delay(200);

  myPage.mouse.move(50, 188);

  myPage.mouse.click(50, 188);
});

ipcMain.on('captcha-success', (event, signal) => {
  if (brain !== null) {
    // Here we can change the signal for the last time before sending it to the brain.
    console.log(`stdin: ${JSON.stringify(signal)}`);

    brain.stdin.write(`${JSON.stringify(signal)}\n`);
  }

  // Now we need to reset the harvester.

  console.log('Resetting harvester!');

  console.log(event.sender.getURL());

  const harvesterURL = event.sender.getURL();

  const myURL = new URL(harvesterURL);

  const myParams = myURL.searchParams;

  const harvesterID = myParams.get('id');

  if (harvesterID === null) {
    return;
  }

  resetHarvester(harvesterID);
});

ipcMain.on('show-window', () => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  if (process.env.START_MINIMIZED) {
    mainWindow.minimize();
  } else {
    mainWindow.show();
    connectPuppeteer();
  }
});

ipcMain.on('open-url', (event, args) => {
  console.log('Opening url...');
  shell.openExternal(args[0]);
  // createTaskGroup(args);
});

ipcMain.on('write-task', (event, args) => {
  console.log('Writing to task file...');
  createTaskGroup(args);
});

ipcMain.on('remove-task', (event, args) => {
  removeTaskGroup(args);
});

ipcMain.on('write-profile', (event, args) => {
  createProfileGroup(args);
});

ipcMain.on('remove-profile', (event, args) => {
  removeProfileGroup(args);
});

ipcMain.on('write-proxy', (event, args) => {
  createProxyGroup(args);
});

ipcMain.on('remove-proxy', (event, args) => {
  removeProxyGroup(args);
});

ipcMain.on('write-account', (event, args) => {
  createAccountGroup(args);
});

ipcMain.on('remove-account', (event, args) => {
  removeAccountGroup(args);
});

ipcMain.on('write-harvester', (event, args) => {
  createHarvester(args);
});

ipcMain.on('remove-harvester', (event, args) => {
  removeHarvester(args);
});

ipcMain.on('login-harvester', (event, args) => {
  if (mainWindow === null) {
    return;
  }

  loginHarvester(args, mainWindow);
});

ipcMain.on('launch-harvester', async (event, args) => {
  type ImageData = {
    base64Data: string;
    url: string;
    type: string;
  };

  type ImageChoice = {
    datapoint_uri: string;
    task_key: string;
  };

  if (myBrowser !== null) {
    const harvesterURL = await launchHarvester(args);

    console.log('Launching harvester!');

    // Then attach the puppeteer response listener to the harvester.

    console.log(harvesterURL);

    if (typeof harvesterURL !== 'string') {
      return;
    }

    const myURL = new URL(harvesterURL);

    const myParams = myURL.searchParams;

    console.log(myParams);

    const harvesterID = myParams.get('id');

    if (harvesterID === null) {
      return;
    }

    console.log(`harvesterID from launch-harvester event: ${harvesterID}`);

    // Now that we have the harvester ID, we can fetch the page and attach the listener.
    // First, we need to get our pages
    const pages = await myBrowser?.pages();

    console.log(pages);

    if (pages === undefined) {
      return;
    }

    // Now we need to find the page that has the grecaptcha checkbox
    const guids = await Promise.all(
      pages.map(async (testPage) => {
        try {
          console.log(testPage.url());

          const myTestURL = new URL(testPage.url());

          const myTestParams = myTestURL.searchParams;

          const id = myTestParams.get('id');

          console.log(id);

          if (id !== null) {
            return id;
          }
          return undefined;
        } catch {
          return undefined;
        }
      }),
    );

    console.log(guids);

    const index = guids.findIndex((testGuid) => testGuid === harvesterID);

    console.log(index);

    // Now we have the index of the page that we need to click the checkbox on

    const myPage = pages[index];
    console.log(myPage.url());

    // Now that we've found the page, we can attach the listener.
    await myPage.setCacheEnabled(false);

    // We need to have an array that stores our base64 image data, urls, and imageTypes as objects.
    let imageDataArray = [] as ImageData[];
    let boxOriginalHeight = 0;
    let boxOriginalWidth = 0;
    let boxNewWidth = 0;
    let description = '';
    let wasFlagTriggered = false;
    let captchaType = '';

    const myCursor = createCursor(myPage);

    handleQueue(); // Try handling queue everytime a new harvester is launched?

    // await installMouseHelper(myPage);

    myPage.on('response', async (response) => {
      // console.log(response.url());
      try {
        // For HCaptcha
        if (response.url().includes('hcaptcha.com/getcaptcha')) {
          console.log('Using Hcaptcha AI...');

          imageDataArray = [];

          // This is the first request that we need to intercept for captcha ai.

          // We need to map through the images and prepare for the future requests to add the base64 data to the array.

          const responseData = await response.json();

          if (responseData.request_type === 'image_label_binary') {
            // I believe its the image select captcha
            // Check to see if we have a valid AYCD AI Key.
            captchaType = 'image_label_binary';
            if (aiKey !== '') {
              // We have a valid AI Key.

              const exampleImages = responseData.requester_question_example.map(
                (exampleImage: string) => {
                  const myImageData = {
                    url: exampleImage,
                    type: 'example',
                    base64Data: '',
                  } as ImageData;

                  return myImageData;
                },
              );

              const choiceImages = responseData.tasklist.map(
                (choice: ImageChoice) => {
                  const myImageData = {
                    url: choice.datapoint_uri,
                    type: 'choice',
                    base64Data: '',
                  } as ImageData;

                  return myImageData;
                },
              );

              const mergedArray = [
                ...exampleImages,
                ...choiceImages,
              ] as ImageData[];

              imageDataArray = mergedArray;
              description = responseData.requester_question.en;
            }
          } else if (responseData.request_type === 'image_label_area_select') {
            // Center dot captcha OR draw box captcha.
            captchaType = 'image_label_area_select';

            if (
              responseData.requester_question.en
                .toUpperCase()
                .includes('DRAW A BOX')
            ) {
              captchaType = 'image_draw_box';
            }

            if (aiKey !== '') {
              // We have a valid AI Key.

              const myImages = responseData.tasklist.map(
                (image: ImageChoice) => {
                  const myImageData = {
                    url: image.datapoint_uri,
                    type: 'choice',
                    base64Data: '',
                  } as ImageData;

                  return myImageData;
                },
              );

              imageDataArray = myImages;
              description = responseData.requester_question.en;

              console.log(imageDataArray);
            }
          }
        } else if (response.url().includes('imgs.hcaptcha.com')) {
          if (aiKey === '') {
            return;
          }

          // This is the request that we need to intercept for captcha ai.
          const imageURL = response.url();

          const buffer = await response.buffer();

          let resizedBuffer = null;

          if (captchaType === 'image_label_binary') {
            resizedBuffer = await sharp(buffer).resize(100, 100).toBuffer();
          } else if (captchaType === 'image_draw_box') {
            const imageMetadata = await sharp(buffer).metadata();
            boxOriginalWidth = imageMetadata.width ?? 0;
            boxOriginalHeight = imageMetadata.height ?? 0;

            // Now we need to determine which aspect ratio the image more closely resembles.

            const aspectRatio = boxOriginalWidth / boxOriginalHeight;

            const differenceToBoxRatio = Math.abs(aspectRatio - 1.33);
            const differenceToWideRatio = Math.abs(aspectRatio - 1.77);

            console.log(aspectRatio);

            if (differenceToBoxRatio < differenceToWideRatio) {
              boxNewWidth = 245;
            } else {
              boxNewWidth = 270;
            }

            resizedBuffer = await sharp(buffer).resize(480, 480).toBuffer();
          } else if (captchaType === 'image_label_area_select') {
            resizedBuffer = await sharp(buffer).resize(480, 480).toBuffer();
          }

          if (resizedBuffer === null) {
            return;
          }

          const base64Data = resizedBuffer.toString('base64');

          for (let i = 0; i < imageDataArray.length; i += 1) {
            if (imageDataArray[i].url === imageURL) {
              imageDataArray[i].base64Data = base64Data;
              break;
            }
          }

          if (imageDataArray.length === 0) {
            console.log("imageDataArray is empty, can't continue");
            return;
          }

          // Also check to see that the response url exists in the imageDataArray.
          const hasResponseURL = imageDataArray.some(
            (imageData) => imageData.url === response.url(),
          );

          // We need to add a condition called hasFirst3x3PageBase64Data. This will be used for the image_label_binary captcha.
          // Since its common for shopify hcaptchas to provide 18 images, we need to check to see if we have the first 9 images base64 data.

          // let hasFirst3x3PageBase64Data = false;

          const imageDataChoices = imageDataArray.filter((image) => {
            return image.type === 'choice';
          });

          // 9 images is the minimum amount of images that are provided for the image_label_binary captcha.
          if (imageDataChoices.length > 9) {
            // Then we will need to fetch all the other images and convert them to base64.

            const otherImageChoices = imageDataChoices.slice(9);

            const additionalImages = await Promise.all(
              otherImageChoices.map(async (image) => {
                const additionalImageResponse = await axios.get(image.url, {
                  responseType: 'arraybuffer',
                });

                const additionalImageBuffer = additionalImageResponse.data;

                const myBuffer = Buffer.from(additionalImageBuffer);

                resizedBuffer = await sharp(myBuffer)
                  .resize(100, 100)
                  .toBuffer();

                const additionalImageBase64 = resizedBuffer.toString('base64');

                return {
                  base64Data: additionalImageBase64,
                  url: image.url,
                };
              }),
            );

            // additionalImages stores the base64 data for the additional images.

            // Now we need to update the imagedataarray with the additional images.

            additionalImages.forEach((additionalImage) => {
              for (let i = 0; i < imageDataArray.length; i += 1) {
                if (imageDataArray[i].url === additionalImage.url) {
                  imageDataArray[i].base64Data = additionalImage.base64Data;
                  break;
                }
              }
            });

            // const first3x3PageBase64Data = imageDataChoices.slice(0, 9);

            // hasFirst3x3PageBase64Data = first3x3PageBase64Data.every(
            //   (imageData) =>
            //     imageData.base64Data !== '' &&
            //     imageData.base64Data !== undefined,
            // );
          }

          // Check to see if we have all of the base64 data.
          const hasAllBase64Data = imageDataArray.every(
            (imageData) =>
              imageData.base64Data !== '' && imageData.base64Data !== undefined,
          );

          console.log('hasAllBase64Data: ', hasAllBase64Data);
          console.log(captchaType);
          console.log(wasFlagTriggered);

          if (
            (hasAllBase64Data &&
              !wasFlagTriggered &&
              captchaType === 'image_label_binary') ||
            (captchaType === 'image_label_area_select' &&
              !wasFlagTriggered &&
              hasResponseURL) ||
            (captchaType === 'image_draw_box' &&
              !wasFlagTriggered &&
              hasResponseURL)
          ) {
            // Now we need to send the data to AYCD's AI API.
            wasFlagTriggered = true;

            const pageUrl = myPage.url();

            const newParams = new URL(pageUrl).searchParams;

            const taskID = newParams.get('taskID');

            if (taskID === null) {
              console.log('taskID is null');
              return;
            }

            const exampleImagesArray = imageDataArray
              .filter((item) => item.type === 'example')
              .map((item) => item.base64Data);

            const choiceImagesArray = imageDataArray
              .filter((item) => item.type === 'choice')
              .map((item) => item.base64Data);

            let myBody = {};

            if (captchaType === 'image_label_binary') {
              myBody = {
                taskID,
                version: 2,
                description,
                exampleImages: exampleImagesArray,
                imageData: choiceImagesArray,
              };
            } else if (captchaType === 'image_label_area_select') {
              // Check to see if the imageDataArray is longer than 1. If it is, then we need to send a request to fetch the additional images and convert them to base64.

              if (imageDataArray.length > 1) {
                // We need to fetch the additional images and convert them to base64.
                const additionalImages = await Promise.all(
                  imageDataArray
                    .filter((image) => image.url !== response.url())
                    .map(async (image) => {
                      const additionalImageResponse = await axios.get(
                        image.url,
                        {
                          responseType: 'arraybuffer',
                        },
                      );

                      const additionalImageBuffer =
                        additionalImageResponse.data;

                      const myBuffer = Buffer.from(additionalImageBuffer);

                      resizedBuffer = await sharp(myBuffer)
                        .resize(480, 480)
                        .toBuffer();

                      const additionalImageBase64 =
                        resizedBuffer.toString('base64');

                      return {
                        base64Data: additionalImageBase64,
                        url: image.url,
                      };
                    }),
                );

                // additionalImages stores the base64 data for the additional images.

                // Now we need to update the imagedataarray with the additional images.

                additionalImages.forEach((additionalImage) => {
                  for (let i = 0; i < imageDataArray.length; i += 1) {
                    if (imageDataArray[i].url === additionalImage.url) {
                      imageDataArray[i].base64Data = additionalImage.base64Data;
                      break;
                    }
                  }
                });
              }

              const myImageArray = imageDataArray.map(
                (image) => image.base64Data,
              );

              console.log(myImageArray[0]);
              console.log('-------------------');
              console.log(myImageArray[1]);

              myBody = {
                taskID,
                version: 4,
                description,
                imageData: myImageArray,
              };
            } else if (captchaType === 'image_draw_box') {
              const myImageArray = imageDataArray
                .filter((image) => image.url === response.url())
                .map((image) => image.base64Data);

              // .replace('please draw a box around the biggest', '');

              description = description
                .toLowerCase()
                .replace('draw a box', '')
                .replace('please', '')
                .replace('around the', '')
                .replace('biggest', '')
                .replace('smallest', '')
                .replace(' ', '');

              description = description.replace(/\s+/g, ''); // Remove all whitespace

              myBody = {
                taskID,
                version: 4,
                description,
                imageData: myImageArray,
              };
            }

            const aiResponse = await axios.post(
              'https://autosolve-ai-api.aycd.io/api/v1/solve',
              myBody,
              {
                headers: {
                  Authorization: `Token ${aiKey}`,
                },
              },
            );

            console.log(aiResponse);

            if (aiResponse.data.success) {
              // We have a successful response from the AI API.
              // We will now use puppeteer to click the correct images then submit the captcha.

              // Now we need to map through the choices and find the correct ones.

              if (captchaType === 'image_label_binary') {
                // Wait for the iframe to load
                await myPage.waitForSelector(
                  'iframe[title="Main content of the hCaptcha challenge"]',
                );
                // Access the iframe using its title
                const elementHandle = await myPage.$(
                  'iframe[title="Main content of the hCaptcha challenge"]',
                );

                if (elementHandle === null) {
                  console.log("elementHandle is null, can't continue");
                  return;
                }

                const frame = await elementHandle.contentFrame();

                console.log(frame);

                if (frame === null) {
                  console.log("frame is null, can't continue");
                  return;
                }

                // This part of the logic has to loop for as many pages as there are.
                if (aiResponse.data.values[0] === 1.0) {
                  await frame.waitForSelector(
                    '[aria-label="Challenge Image 1"]',
                  );
                  const image1 = await frame.$(
                    '[aria-label="Challenge Image 1"]',
                  );

                  if (image1 === null) {
                    console.log("image1 is null, can't continue");
                    return;
                  }

                  await myCursor.click(image1, { moveSpeed: 40 });
                  await delay(150);
                }

                if (aiResponse.data.values[1] === 1.0) {
                  await frame.waitForSelector(
                    '[aria-label="Challenge Image 2"]',
                  );
                  const image2 = await frame.$(
                    '[aria-label="Challenge Image 2"]',
                  );

                  if (image2 === null) {
                    console.log("image2 is null, can't continue");
                    return;
                  }

                  await myCursor.click(image2, { moveSpeed: 40 });
                  await delay(150);
                }

                if (aiResponse.data.values[2] === 1.0) {
                  await frame.waitForSelector(
                    '[aria-label="Challenge Image 3"]',
                  );
                  const image3 = await frame.$(
                    '[aria-label="Challenge Image 3"]',
                  );

                  if (image3 === null) {
                    console.log("image3 is null, can't continue");
                    return;
                  }

                  await myCursor.click(image3, { moveSpeed: 40 });
                  await delay(150);
                }

                if (aiResponse.data.values[3] === 1.0) {
                  await frame.waitForSelector(
                    '[aria-label="Challenge Image 4"]',
                  );
                  const image4 = await frame.$(
                    '[aria-label="Challenge Image 4"]',
                  );

                  if (image4 === null) {
                    console.log("image4 is null, can't continue");
                    return;
                  }

                  await myCursor.click(image4, { moveSpeed: 40 });
                  await delay(150);
                }

                if (aiResponse.data.values[4] === 1.0) {
                  await frame.waitForSelector(
                    '[aria-label="Challenge Image 5"]',
                  );
                  const image5 = await frame.$(
                    '[aria-label="Challenge Image 5"]',
                  );

                  if (image5 === null) {
                    console.log("image5 is null, can't continue");
                    return;
                  }

                  await myCursor.click(image5, { moveSpeed: 40 });
                  await delay(150);
                }

                if (aiResponse.data.values[5] === 1.0) {
                  await frame.waitForSelector(
                    '[aria-label="Challenge Image 6"]',
                  );
                  const image6 = await frame.$(
                    '[aria-label="Challenge Image 6"]',
                  );

                  if (image6 === null) {
                    console.log("image6 is null, can't continue");
                    return;
                  }

                  await myCursor.click(image6, { moveSpeed: 40 });
                  await delay(150);
                }

                if (aiResponse.data.values[6] === 1.0) {
                  await frame.waitForSelector(
                    '[aria-label="Challenge Image 7"]',
                  );
                  const image7 = await frame.$(
                    '[aria-label="Challenge Image 7"]',
                  );

                  if (image7 === null) {
                    console.log("image7 is null, can't continue");
                    return;
                  }

                  await myCursor.click(image7, { moveSpeed: 40 });
                  await delay(150);
                }

                if (aiResponse.data.values[7] === 1.0) {
                  await frame.waitForSelector(
                    '[aria-label="Challenge Image 8"]',
                  );
                  const image8 = await frame.$(
                    '[aria-label="Challenge Image 8"]',
                  );

                  if (image8 === null) {
                    console.log("image8 is null, can't continue");
                    return;
                  }

                  await myCursor.click(image8, { moveSpeed: 40 });
                  await delay(150);
                }

                if (aiResponse.data.values[8] === 1.0) {
                  await frame.waitForSelector(
                    '[aria-label="Challenge Image 9"]',
                  );
                  const image9 = await frame.$(
                    '[aria-label="Challenge Image 9"]',
                  );

                  if (image9 === null) {
                    console.log("image9 is null, can't continue");
                    return;
                  }

                  await myCursor.click(image9, { moveSpeed: 40 });
                  await delay(150);
                }

                await frame.waitForSelector('.button-submit');
                const submitButton = await frame.$('.button-submit');

                if (submitButton === null) {
                  console.log("submitButton is null, can't continue");
                  return;
                }
                await myCursor.click(submitButton, {
                  moveSpeed: 40,
                });
              } else if (captchaType === 'image_label_area_select') {
                // const xValue = aiResponse.data.values[0];
                // const yValue = aiResponse.data.values[1];

                for (let i = 0; i < imageDataArray.length; i += 1) {
                  // For each image, we need to continue our loop.
                  const xValue = aiResponse.data.values[i * 4];
                  const yValue = aiResponse.data.values[i * 4 + 1];

                  const calculatedXCoordinate = Math.floor(xValue * 185) + 80;
                  const calculatedYCoordinate = Math.floor(yValue * 185) + 137;

                  const myVector = new Victor(
                    calculatedXCoordinate,
                    calculatedYCoordinate,
                  );

                  await myCursor.moveTo(myVector);
                  await myCursor.click();

                  await delay(1888);

                  await myPage.waitForSelector(
                    'iframe[title="Main content of the hCaptcha challenge"]',
                  );
                  // Access the iframe using its title
                  const elementHandle = await myPage.$(
                    'iframe[title="Main content of the hCaptcha challenge"]',
                  );

                  if (elementHandle === null) {
                    console.log("elementHandle is null, can't continue");
                    return;
                  }

                  const frame = await elementHandle.contentFrame();

                  console.log(frame);

                  if (frame === null) {
                    console.log("frame is null, can't continue");
                    return;
                  }

                  await frame.waitForSelector('.button-submit');
                  const submitButton = await frame.$('.button-submit');

                  if (submitButton === null) {
                    console.log("submitButton is null, can't continue");
                    return;
                  }
                  await myCursor.click(submitButton, {
                    moveSpeed: 20,
                  });
                }
              } else if (captchaType === 'image_draw_box') {
                // Top left of the image is located at 40, 170.
                // The size of the image in the harvester is 268, 154. Roughly.

                // The category of the image does not matter. It is either 245 x 185 or 270 x 165.
                // The consistent number is the width of the image. The width is ONLY ever 245 or 270.

                // Box Image Dimension: 245 width x ? height
                // Wide Image Dimension: 270 width x ? height

                // Box Image Starting Coordinates: 52, 170. Some padding added for safety.
                // Wide Image Starting Coordinates: 41, 186. Some padding added for safety.

                // The height is variable. I imagine they retain the aspect ratio of the image.

                // Original images that are 1.3x wide as they are tall result in the box image dimension.
                // Original images that are 1.7x wide as they are tall result in the wide image dimension.

                const newHeight = Math.floor(
                  (boxOriginalHeight / boxOriginalWidth) * boxNewWidth,
                );

                let x1Value = 0;
                let y1Value = 0;

                if (
                  aiResponse.data.values[0] === 0 &&
                  aiResponse.data.values[1] === 0 &&
                  aiResponse.data.values[2] === 0 &&
                  aiResponse.data.values[3] === 0
                ) {
                  return;
                }

                if (boxNewWidth === 245) {
                  // Box Image
                  x1Value =
                    Math.floor(aiResponse.data.values[0] * boxNewWidth) + 52;
                  y1Value =
                    Math.floor(aiResponse.data.values[1] * newHeight) + 170;
                } else if (boxNewWidth === 270) {
                  // Wide Image
                  x1Value =
                    Math.floor(aiResponse.data.values[0] * boxNewWidth) + 41;
                  y1Value =
                    Math.floor(aiResponse.data.values[1] * newHeight) + 186;
                }

                const x2Value =
                  Math.floor(aiResponse.data.values[2] * boxNewWidth) + x1Value;
                const y2Value =
                  Math.floor(aiResponse.data.values[3] * newHeight) + y1Value;

                console.log(boxNewWidth);
                console.log(x1Value, y1Value, x2Value, y2Value);

                // Now drag the box.
                const originVector = new Victor(x1Value, y1Value);
                await myCursor.moveTo(originVector);
                await myPage.mouse.down();

                await delay(Math.random() * 50);

                const destinationVector = new Victor(x2Value, y2Value);
                await myCursor.moveTo(destinationVector);

                await myPage.mouse.up();

                // Readjusting the box depending on the captcha seems to help improve the success rate.
                // What they are looking for, is for the box to be babied into the correct position.
                // Them exactly KNOWING, the coordinates you should be aiming for I believe is not realistic.
                // Studying my own nature, I tend to overshoot the box, then correct it. So I'm going to try to simulate that.
                // Go fast, then slow down as you get closer to the box. Start off dragging the box quickly, then slow down as you get closer to the end coordinates.
                // Then we want to perform a small re-adjustment to the box.
                // Then submit the captcha.

                await delay(Math.random() * 50 + 200); // Thinking time.

                // Steps: 1. Drag the box quickly to the end coordinates while slowing down towards the last 15% of the movement.
                // Steps: 2. Re-adjust the top left, bottom left, and bottom right coordinates of the box inwards by a variation of a couple pixels.
                // Steps: 3. Move the mouse to the submit button and click it.
                // I find it takes me about 4 seconds to complete the captcha. So I will try to mimic that.
                // The box dragging really only takes about a second. The readjustment takes about 2.5 seconds. Then the submit takes about 0.5 seconds.
                // First readjust the bottom right, then the bottom left, then the top left.
                // Since our mouse is already at the bottom right, we can readjust that first.

                // Readjust bottom right
                // We need the ending coordinates of the box. Then we will shrink them by a random number between 5 and 10.
                const bottomRightXAdjustment =
                  Math.floor(Math.random() * 10) + 3;
                const bottomRightYAdjustment =
                  Math.floor(Math.random() * 8) + 2;

                await myPage.mouse.down();

                const bottomRightAdjustmentVector = new Victor(
                  x2Value - bottomRightXAdjustment,
                  y2Value - bottomRightYAdjustment,
                );

                await myCursor.moveTo(bottomRightAdjustmentVector);

                await myPage.mouse.up();

                await delay(Math.random() * 50 + 200); // Thinking time.

                // Now move our mouse to the bottom left node.

                const bottomLeftMovementVector = new Victor(
                  x1Value,
                  y2Value - bottomRightYAdjustment,
                );

                await myCursor.moveTo(bottomLeftMovementVector);

                // Readjust bottom left
                // We need the ending coordinates of the box. Then we will shrink them by a random number between 5 and 10.
                const bottomLeftXAdjustment = Math.floor(Math.random() * 2) + 4;
                const bottomLeftYAdjustment = Math.floor(Math.random() * 2) + 4;

                await myPage.mouse.down();

                const bottomLeftAdjustmentVector = new Victor(
                  x1Value + bottomLeftXAdjustment,
                  y2Value - bottomLeftYAdjustment,
                );

                await myCursor.moveTo(bottomLeftAdjustmentVector);

                await myPage.mouse.up();

                await delay(Math.random() * 50 + 200); // Thinking time.

                // Now move our mouse to the top left node.

                const topLeftMovementVector = new Victor(
                  x1Value + bottomLeftXAdjustment,
                  y1Value,
                );

                await myCursor.moveTo(topLeftMovementVector);

                // Readjust top left
                const topLeftXAdjustment = Math.floor(Math.random() * 4) + 2;
                const topLeftYAdjustment = Math.floor(Math.random() * 3) + 1;

                await myPage.mouse.down();

                const topLeftAdjustmentVector = new Victor(
                  x1Value + bottomLeftXAdjustment + topLeftXAdjustment,
                  y1Value + topLeftYAdjustment,
                );

                await delay(Math.random() * 50 + 200); // Thinking time.

                await myCursor.moveTo(topLeftAdjustmentVector);

                await myPage.mouse.up();

                await delay(Math.random() * 50 + 200); // Thinking time.

                // Our submit button is located at 279, 436
                // Wait for the iframe to load
                await myPage.waitForSelector(
                  'iframe[title="Main content of the hCaptcha challenge"]',
                );
                // Access the iframe using its title
                const elementHandle = await myPage.$(
                  'iframe[title="Main content of the hCaptcha challenge"]',
                );

                if (elementHandle === null) {
                  console.log("elementHandle is null, can't continue");
                  return;
                }

                const frame = await elementHandle.contentFrame();

                console.log(frame);

                if (frame === null) {
                  console.log("frame is null, can't continue");
                  return;
                }

                await frame.waitForSelector('.button-submit');
                const submitButton = await frame.$('.button-submit');

                if (submitButton === null) {
                  console.log("submitButton is null, can't continue");
                  return;
                }
                await myCursor.click(submitButton, {
                  moveSpeed: 20,
                });
              }
            }
          }
        } else if (response.url().includes('checkcaptcha')) {
          imageDataArray = [];
          description = '';
          wasFlagTriggered = false;
          captchaType = '';
        }
      } catch (error) {
        console.log('Error in puppeteer listener:', error);
      }
    });
  }
});

ipcMain.on('write-settings', async (event, args) => {
  updateSettingsData(args);

  const apiKeyConnected = await establishApiConnection(args.aycd.apiKey.key);
  const aiKeyConnected = await updateAIKey(args.aycd.aiKey.key);

  if (apiKeyConnected) {
    mainWindow?.webContents.send('api-key-connected', true);
  } else {
    mainWindow?.webContents.send('api-key-connected', false);
  }

  if (aiKeyConnected) {
    mainWindow?.webContents.send('ai-key-connected', true);
  } else {
    mainWindow?.webContents.send('ai-key-connected', false);
  }
});

ipcMain.on('write-misc', async (event, args) => {
  updateMiscData(args);
});

ipcMain.on('test-webhook', (event, args) => {
  const type = args[0];
  const url = args[1];
  console.log(type, url);
  testWebhook(type, url);
});

ipcMain.on('window', (event, arg) => {
  const senderWindow = BrowserWindow.fromWebContents(event.sender);

  switch (arg[0]) {
    case 'minimize':
      BrowserWindow.getFocusedWindow()?.minimize();
      break;
    case 'maximize':
      if (BrowserWindow.getFocusedWindow()?.isMaximized()) {
        BrowserWindow.getFocusedWindow()?.unmaximize();
        return;
      }
      BrowserWindow.getFocusedWindow()?.maximize();
      break;
    case 'close':
      if (senderWindow === mainWindow) {
        app.quit();
      } else {
        senderWindow?.close();
      }
      break;
    default:
      console.log('Unknown window arg');
  }
});

autoUpdater.on('update-downloaded', (info) => {
  mainUpdateDownloaded = true;
  mainWindow?.webContents.send('update-downloaded', info.version);
});

autoUpdater.on('update-available', (info) => {
  mainUpdateAvailable = true;
  mainWindow?.webContents.send(
    'check-for-updates',
    `Downloading version v${info.version}...`,
  );
});

autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('check-for-updates', 'Up to date!');
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

ipcMain.on('restart-and-install', async () => {
  // Now this function needs to detect if a hotfix and a main update are available. If they are both available,
  // we will need to handle the hotfix first, then the main update.
  if (hotfixAvailable) {
    if (brain !== null) {
      const brainDownload = await RestartAndInstall(brain);

      if (brainDownload) {
        // To relaunch the app
        console.log('Relaunching app!');
        if (isDebug) {
          console.log("Can't relaunch in debug mode!");
        } else {
          app.relaunch();
          app.exit();
        }
      }
    }
  }
  if (mainUpdateDownloaded) {
    autoUpdater.quitAndInstall();
  }
});

ipcMain.on('send-to-brain', (event, signal) => {
  if (brain !== null) {
    // Here we can change the signal for the last time before sending it to the brain.
    // console.log(`stdin: ${JSON.stringify(signal)}`);

    writeBrainQueue.push(JSON.stringify(signal));

    if (writeBrainAvailable) {
      writeToBrain();
    }
  }
});

const completeLogin = async () => {
  console.log('Login was completed!');

  if (!loginWindow) {
    throw new Error('loginWindow is not defined');
  }

  if (!mainWindow) {
    throw new Error('mainWindow is not defined');
  }

  loginWindow.close();

  mainWindow!.loadURL(resolveHtmlPath('index.html'));
};

const handleSignalBridge = async (signal: any) => {
  const signalResponse = await handleSignal(signal);
  if (signalResponse !== null) {
    writeBrainQueue.push(JSON.stringify(signalResponse));
    console.log(writeBrainQueue);
    writeToBrain();
  }
};

const initializeBrain = () => {
  if (brain !== null) {
    // Add stdout and stderr listeners here

    let buffer = '';

    brain.stdout.on('data', (data) => {
      buffer += data.toString();

      // Split buffer into lines
      const lines = buffer.split('\n');

      // Process each line as a complete JSON object
      for (let i = 0; i < lines.length - 1; i += 1) {
        // Exclude the last line which might be incomplete
        try {
          if (lines[i]) {
            // Check if the line is not empty
            const jsonObject = JSON.parse(lines[i]);
            console.log(jsonObject);
            // Process jsonObject...
            mainWindow?.webContents.send('brain-to-renderer', jsonObject);
            handleSignalBridge(jsonObject);
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
          console.log(lines[i]);
          return;
        }
      }

      // Check if the last line is a partial JSON object and keep it in the buffer
      buffer = lines[lines.length - 1] || '';
    });

    brain.stderr.on('data', (data: any) => {
      console.log(`stderr: ${data}`);
    });
  }
};

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (loginWindow && mainWindow) {
    // Windows have already been created, do not create again
    return;
  }

  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  loginWindow = new BrowserWindow({
    show: false,
    width: 570,
    height: 320,
    resizable: false,
    icon: getAssetPath('icon.png'),
    backgroundColor: '#02020C',
    frame: false,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow = new BrowserWindow({
    show: false,
    width: 1400,
    height: 788,
    minHeight: 788,
    minWidth: 1400,
    maxHeight: 1080,
    maxWidth: 1920,
    icon: getAssetPath('icon.png'),
    backgroundColor: '#02020C',
    frame: false,
    webPreferences: {
      // devTools: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  // mainWindow.webContents.openDevTools();

  loginWindow!.loadURL(resolveHtmlPath('login.html'));

  // Login window process
  loginWindow.on('ready-to-show', async () => {
    // Check login file
    if (!loginWindow) {
      throw new Error('loginWindow is not defined');
    }

    const loginRes = await loginKey();
    // const loginRes = 'success';

    if (loginRes === 'failure') {
      if (process.env.START_MINIMIZED) {
        loginWindow.minimize();
      }
      loginWindow.show();
    } else {
      await ConnectWebsocket();
      whopData = loginRes;
      brain = LaunchModules();

      if (brain !== null) {
        initializeBrain();
      }

      // websocketInitiated = true;
      mainWindow!.loadURL(resolveHtmlPath('index.html'));
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

function checkWebsocket() {
  // Send the status of the websocket to the renderer
  if (mainWindow) {
    mainWindow.webContents.send('websocket-status', GetWebsocketStatus());
  }

  if (GetWebsocketStatus() || !websocketInitiated) {
    return;
  }

  console.log("Couldn't connect to websocket, attempting to reconnect...");
  ConnectWebsocket();
}

async function checkForUpdates() {
  if (mainUpdateAvailable) {
    return;
  }
  mainWindow?.webContents.send('check-for-updates', 'Checking for updates...');
  autoUpdater.checkForUpdates();
  try {
    const hotfixResponse = await CheckHotfixUpdate();

    console.log(hotfixResponse);

    if (hotfixResponse.status === 'restart') {
      hotfixAvailable = true;
      mainWindow?.webContents.send(
        'update-downloaded',
        `0.0.${hotfixResponse.version}`,
      );
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Add event listeners...
 */

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow?.webContents.send(
    'check-for-updates',
    `Download progress: ${parseFloat(progressObj.percent.toFixed(0))}%`,
  );
});

ipcMain.on('check-for-updates', checkForUpdates);

// Start the websocket monitor interval
setInterval(checkWebsocket, 5000);

// Start the autoupdate check interval
setInterval(checkForUpdates, 30000);

ipcMain.handle('handle-login', async (event, key) => {
  // Now attempt to login with the key
  const keyResponse = await RegisterInstance(key, machineIdSync(true));

  if (keyResponse === 'failure') {
    completeLogin();
    await ConnectWebsocket();
    websocketInitiated = true;
    whopData = keyResponse;
  }

  return keyResponse;
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

const clientId = '1110642426135204012';
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();

rpc.on('ready', async () => {
  const settingsData = await fetchSettingsData();
  rpc.setActivity({
    details: `v${settingsData.version.main}`,
    state: 'Making Waves',
    startTimestamp,
    largeImageKey: 'mainlogosquare',
    largeImageText: 'DalphanAIO',
    instance: false,
  });
});

// Log in to RPC with client id
rpc.login({ clientId }).catch(console.error);
