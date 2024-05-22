import fs from 'fs';
import path from 'path';
import { app, BrowserWindow, session } from 'electron';
import express from 'express';
import { resolveHtmlPath } from './util';

interface HarvesterData {
  id: string;
  name: string;
  type: string;
  status: string;
  statusColor: string;
  proxy: string;
}

export interface HarvesterBrowser {
  available: boolean;
  id: string;
  name: string;
  type: string;
  browser: BrowserWindow;
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

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zip: string;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zip: string;
}

interface PaymentInfo {
  cardType: string;
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

interface Profile {
  id: string;
  sameAsShipping: boolean;
  shipping: ShippingInfo;
  billing: BillingInfo;
  payment: PaymentInfo;
}

interface Account {
  username: string;
  password: string;
}

interface Webhook {
  success: string;
  failure: string;
  misc: string;
}

export interface Signal {
  taskID: string;
  action: string;
  status: string;
  statusType: 'info' | 'success' | 'failure' | 'warning';
  isRunning: boolean;
  site: string;
  siteName: string;
  mode: string;
  input: string;
  size: string;
  monitorDelay: string;
  retryDelay: string;
  productQuantity: string;
  minSizesLoaded: string;
  minPrice: string;
  maxPrice: string;
  profile: Profile;
  proxy: {
    monitor: string;
    task: string;
    taskName: string;
  };
  account: Account;
  webhook: Webhook;
  data: string;
}

let harvesterFilePath = '';

export const availableHarvesters: HarvesterBrowser[] = [];
export const captchaQueue: Signal[] = [];

function initializeHarvesterFilePath() {
  const os = process.platform;
  switch (os) {
    case 'win32': {
      // Windows: Use %APPDATA% environment variable

      if (!process.env.APPDATA) {
        throw Error('APPDATA environment variable not found');
      }

      harvesterFilePath = path.join(
        process.env.APPDATA,
        'dalphan-aio',
        'harvesters.json',
      );

      break;
    }
    case 'darwin': {
      // MacOS: Use $HOME/Library/Application Support
      harvesterFilePath = `${process.env.HOME}/Library/Application Support/dalphan-aio/harvesters.json`;

      break;
    }
    case 'linux': {
      // Linux: Use $HOME/.config
      harvesterFilePath = `${process.env.HOME}/.config/dalphan-aio/harvesters.json`;

      break;
    }
    default:
      // Unsupported OS
      throw Error('Unsupported OS');
  }
}

export function checkHarvesterFile(filePath: string): string {
  // Check if the file does not exist
  if (!fs.existsSync(filePath)) {
    console.log('FILE DOES NOT EXIST!');

    // Create the file
    fs.writeFileSync(filePath, '{}');
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  return JSON.parse(fileContents);
}

export function createHarvester(harvesterObject: HarvesterData) {
  const fileContents = fs.readFileSync(harvesterFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  parsedData[harvesterObject.id] = harvesterObject;

  fs.writeFileSync(harvesterFilePath, JSON.stringify(parsedData));
}

export function removeHarvester(id: string) {
  const fileContents = fs.readFileSync(harvesterFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  delete parsedData[id];

  fs.writeFileSync(harvesterFilePath, JSON.stringify(parsedData));
}

export async function fetchHarvesterData() {
  console.log('fetching harvester data!');

  const harvesterData = checkHarvesterFile(harvesterFilePath);

  return harvesterData;
}

export async function loginHarvester(id: string, mainWindow: BrowserWindow) {
  const mySession = session.fromPartition(`persist:${id}`, { cache: true });

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: false,
      session: mySession,
    },
  });

  // Setting a user-agent seems to block the login page from loading on gmail.

  // Read the proxy from the harvester file
  const proxyFileContents = fs.readFileSync(harvesterFilePath, 'utf8');
  const proxyParsedData = JSON.parse(proxyFileContents);
  const myBrowserProxy = proxyParsedData[id].proxy;

  // Parse the proxy into its 4 parts.
  const proxyParts = myBrowserProxy.split(':');

  const [host = '', port = '', username = '', password = ''] = proxyParts;

  const ses = win.webContents.session;

  if (port !== '') {
    console.log('Proxy found!');
    // If you need authentication for the proxy, you can handle that as well
    win.webContents.on('login', (event, request, authInfo, callback) => {
      event.preventDefault(); // Prevent the default behavior
      callback(username, password); // Provide the username and password
    });

    await ses.setProxy({
      proxyRules: `http://${host}:${port}`,
    });
  }

  // Authenticate the proxy

  // Load the login page
  try {
    await win.loadURL('https://www.youtube.com/');
  } catch (error) {
    console.error(error);
  }

  win.show();

  const filter = {
    // urls: ['https://www.youtube.com/signin*'],
    // urls: ['https://www.youtube.com/*'],
    urls: ['*://*/*'], // Intercepts all URLs
    // urls: ['https://www.youtube.com/signin*'], // Intercepts all URLs
  };

  win.webContents.session.webRequest.onBeforeRequest(
    filter,
    (details, callback) => {
      try {
        if (
          details.url.includes(
            'https://www.youtube.com/signin?action_handle_signin=true',
          )
        ) {
          console.log('Login Session Saved!');

          mainWindow.webContents.send('login-harvester-success', id);

          const fileContents = fs.readFileSync(harvesterFilePath, 'utf8');

          const parsedData = JSON.parse(fileContents);

          parsedData[id].status = 'Session saved';
          parsedData[id].statusColor = 'green';

          fs.writeFileSync(harvesterFilePath, JSON.stringify(parsedData));
        }

        callback({ cancel: false });
      } catch (error) {
        console.error(error);
        callback({ cancel: false });
      }
    },
  );
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

function solveCaptchaForced(
  captchaSignal: Signal,
  harvester: HarvesterBrowser,
) {
  harvester.browser.webContents.once('did-finish-load', () => {
    // Only send the captcha signal once the window has finished loading
    harvester.browser.webContents.send('captcha', [
      captchaSignal,
      harvester.id,
    ]);
  });

  console.log('Solve captcha forced!');

  const parsedData: ShopifyCheckpointData | ShopifyV3Data = JSON.parse(
    captchaSignal.data,
  );

  const taskURL = new URL(parsedData.url);

  const myURL = new URL(`http://dalphancaptcha.${taskURL.hostname}/`);

  myURL.searchParams.append('id', harvester.id);

  harvester.browser.loadURL(myURL.toString());
}

export async function handleQueue() {
  // This function should manage the captcha queue.
  // It should check to see if there are any captchas in the queue.
  // If there are captchas in the queue, it should check to see if there are any available harvesters.
  // If there are available harvesters, then it should send the captchas to the available harvesters.

  // Check to see if there are any captchas in the queue.
  if (captchaQueue.length !== 0) {
    // Check to see if there are any available harvesters.
    console.log(captchaQueue);

    // First use array.map to create an available harvester array.
    const myAvailableHarvesters = availableHarvesters.map((harvester) => {
      if (harvester.available) {
        return harvester;
      }
      return undefined;
    });

    // Now filter out the undefined values.
    const filteredAvailableHarvesters = myAvailableHarvesters.filter(
      (harvester) => {
        return harvester !== undefined;
      },
    );

    for (let i = 0; i < filteredAvailableHarvesters.length; i += 1) {
      for (let x = 0; x < captchaQueue.length; x += 1) {
        // Now we need to check if the captcha item fits the same type as the harvester.
        // If that is the case, then we can send the captcha to the harvester.
        // If not, then we need to move on to the next captcha in the queue.

        if (filteredAvailableHarvesters[i] === undefined) {
          break;
        }

        const parsedData: ShopifyCheckpointData | ShopifyV3Data = JSON.parse(
          captchaQueue[x].data,
        );

        if (filteredAvailableHarvesters[i]!.type === 'Shopify Checkpoint') {
          if (
            parsedData.captchaType === 'g-recaptcha' ||
            parsedData.captchaType === 'h-captcha'
          ) {
            // Send the captcha to the harvester
            solveCaptchaForced(
              captchaQueue[x],
              filteredAvailableHarvesters[i]!,
            );

            captchaQueue.splice(x, 1);

            break;
          }
        } else if (filteredAvailableHarvesters[i]!.type === 'Shopify Account') {
          if (parsedData.captchaType === 'v3') {
            // Send the captcha to the harvester

            console.log('Sending captcha to harvester!');

            solveCaptchaForced(
              captchaQueue[x],
              filteredAvailableHarvesters[i]!,
            );

            captchaQueue.splice(x, 1);

            break;
          }
        }
      }
    }
  }
}

export async function launchHarvester(harvesterData: HarvesterData) {
  return new Promise((resolve, reject) => {
    let harvesterWindow: BrowserWindow | null = null;
    let isInitialized = false;

    const { id, name, type } = harvesterData;

    const mySession = session.fromPartition(`persist:${id}`, { cache: true });

    harvesterWindow = new BrowserWindow({
      show: false,
      width: 340,
      height: 490,
      resizable: false,
      backgroundColor: '#06061a',
      icon: getAssetPath('icon.png'),
      frame: false,
      webPreferences: {
        devTools: false, // Handles devtools for harvester windows.
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
        session: mySession,
        allowRunningInsecureContent: true,
        webSecurity: false,
      },
    });

    // Set up the proxy only for this harvester window
    const proxyFileContents = fs.readFileSync(harvesterFilePath, 'utf8');
    const proxyParsedData = JSON.parse(proxyFileContents);
    const myBrowserProxy = proxyParsedData[id].proxy;
    const [host = '', port = '', username = '', password = ''] =
      myBrowserProxy.split(':');

    const ses = harvesterWindow.webContents.session;

    const myURL = new URL(resolveHtmlPath('harvester.html'));

    myURL.searchParams.append('id', id);

    if (port !== '') {
      harvesterWindow.webContents.on(
        'login',
        (event, request, authInfo, callback) => {
          event.preventDefault(); // Prevent the default behavior
          callback(username, password); // Provide the username and password
        },
      );

      ses
        .setProxy({
          proxyRules: `http://${host}:${port}`,
        })
        // eslint-disable-next-line consistent-return
        .then(() => {
          // We've connected the proxy to the window.

          // eslint-disable-next-line promise/always-return
          if (harvesterWindow === null) {
            console.log('HarvesterWindow is null!');
            return false;
          }

          harvesterWindow.loadURL(myURL.toString());

          harvesterWindow.once('ready-to-show', async () => {
            console.log(`IsInitialized: ${isInitialized}`);
            if (!isInitialized) {
              if (harvesterWindow === null) {
                reject(new Error('"harvesterWindow" is not defined'));
                return false;
              }

              // After fetching the data, we need to find the window that matches the UUID we set earlier.

              harvesterWindow.webContents.send('launch-harvester', {
                id,
                name,
                type,
              });

              harvesterWindow.show();

              // harvesterWindow.webContents.openDevTools();

              // Now that the window is ready, we can add the harvester to the list of available harvesters.
              availableHarvesters.push({
                available: true,
                id,
                name,
                type,
                browser: harvesterWindow,
              });

              isInitialized = true;
              // handleQueue();
              return true;
            }
            return false;
          });

          // harvesterWindow.webContents.openDevTools();

          harvesterWindow.on('closed', () => {
            harvesterWindow = null;
            isInitialized = false;
            // Remove the harvester from the list of available harvesters.
            const index = availableHarvesters.findIndex((harvester) => {
              return harvester.id === id;
            });

            availableHarvesters.splice(index, 1);
          });
        })
        .then(() => {
          resolve(myURL.toString());
          return true;
        })
        .catch((err) => {
          console.log('Error connecting proxy to window:', err);
        });
    } else {
      harvesterWindow.loadURL(myURL.toString());

      harvesterWindow.once('ready-to-show', async () => {
        console.log(`IsInitialized: ${isInitialized}`);
        if (!isInitialized) {
          if (harvesterWindow === null) {
            throw new Error('"harvesterWindow" is not defined');
          }

          // After fetching the data, we need to find the window that matches the UUID we set earlier.

          harvesterWindow.webContents.send('launch-harvester', {
            id,
            name,
            type,
          });

          harvesterWindow.show();

          // harvesterWindow.webContents.openDevTools();

          // Now that the window is ready, we can add the harvester to the list of available harvesters.
          availableHarvesters.push({
            available: true,
            id,
            name,
            type,
            browser: harvesterWindow,
          });

          isInitialized = true;

          // handleQueue();

          resolve(myURL.toString());
        }
      });

      // harvesterWindow.webContents.openDevTools();

      harvesterWindow.on('closed', () => {
        harvesterWindow = null;
        isInitialized = false;
        // Remove the harvester from the list of available harvesters.
        const index = availableHarvesters.findIndex((harvester) => {
          return harvester.id === id;
        });

        availableHarvesters.splice(index, 1);
      });
    }
  });
}

export async function resetHarvester(id: string) {
  // This function should reset the harvester by setting the url back to the default harvester page.
  // Then we should update the availableHarvesters array to reflect the change.
  // We should also manage the captcha queue here.

  // First, we need to find the index of the harvester in the availableHarvesters array.

  const index = availableHarvesters.findIndex((harvester) => {
    return harvester.id === id;
  });

  // Now we need to reset the harvester window.

  console.log(id);

  console.log(index);
  console.log(availableHarvesters);

  const harvester = availableHarvesters[index];

  console.log(harvester);

  harvester.browser.loadURL(resolveHtmlPath('harvester.html'));

  harvester.browser.once('ready-to-show', async () => {
    const { name, type } = harvester;

    console.log('Reset harvester: ', id, name, type);

    harvester.browser.webContents.send('launch-harvester', { id, name, type });

    // Now that the window is ready, we can add the harvester to the list of available harvesters.
    availableHarvesters[index].available = true;

    // Now we need to check the captcha queue to see if there are any captchas that need to be solved.
    handleQueue();
  });
}

initializeHarvesterFilePath();

const myApp = express();

myApp.get('/', (req, res) => {
  // Your logic for handling captchas or other tasks
  console.log(resolveHtmlPath('harvester.html'));

  // Check to see if we are in development mode

  if (process.env.NODE_ENV === 'development') {
    res.sendFile(
      path.resolve(
        __dirname,
        '../../release/app/dist/renderer',
        'harvester.html',
      ),
    );
  } else {
    res.sendFile(path.resolve(__dirname, '../renderer/', 'harvester.html'));
  }
});

// For the JS file
myApp.get('/harvester.js', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.sendFile(
      path.resolve(
        __dirname,
        '../../release/app/dist/renderer',
        'harvester.js',
      ),
    );
  } else {
    res.sendFile(path.resolve(__dirname, '../renderer/', 'harvester.js'));
  }
});

// For the JS map file
myApp.get('/harvester.js.map', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.sendFile(
      path.resolve(
        __dirname,
        '../../release/app/dist/renderer',
        'harvester.js.map',
      ),
    );
  } else {
    res.sendFile(path.resolve(__dirname, '../renderer/', 'harvester.js.map'));
  }
});

// For the CSS file
myApp.get('/harvester.css', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.sendFile(
      path.resolve(
        __dirname,
        '../../release/app/dist/renderer',
        'harvester.css',
      ),
    );
  } else {
    res.sendFile(path.resolve(__dirname, '../renderer/', 'harvester.css'));
  }
});

// For the CSS Style file
myApp.get('/harvester.style.css', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.sendFile(
      path.resolve(
        __dirname,
        '../../release/app/dist/renderer',
        'harvester.style.css',
      ),
    );
  } else {
    res.sendFile(
      path.resolve(__dirname, '../renderer/', 'harvester.style.css'),
    );
  }
});

// For the CSS Style map file
myApp.get('/harvester.style.css.map', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.sendFile(
      path.resolve(
        __dirname,
        '../../release/app/dist/renderer',
        'harvester.style.css.map',
      ),
    );
  } else {
    res.sendFile(
      path.resolve(__dirname, '../renderer/', 'harvester.style.css.map'),
    );
  }
});

// For the dolphin svg file
myApp.get('/1d69978b0c0fbac24b68780e76bcae86.svg', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.sendFile(
      path.resolve(
        __dirname,
        '../../release/app/dist/renderer',
        '1d69978b0c0fbac24b68780e76bcae86.svg',
      ),
    );
  } else {
    res.sendFile(
      path.resolve(
        __dirname,
        '../renderer/',
        '1d69978b0c0fbac24b68780e76bcae86.svg',
      ),
    );
  }
});

// For some otf file
myApp.get('/81b881e3eed3399c25ae.otf', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.sendFile(
      path.resolve(
        __dirname,
        '../../release/app/dist/renderer',
        '81b881e3eed3399c25ae.otf',
      ),
    );
  } else {
    res.sendFile(
      path.resolve(__dirname, '../renderer/', '81b881e3eed3399c25ae.otf'),
    );
  }
});

// For some other otf file
myApp.get('/f905a97329854a641472.otf', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.sendFile(
      path.resolve(
        __dirname,
        '../../release/app/dist/renderer',
        'f905a97329854a641472.otf',
      ),
    );
  } else {
    res.sendFile(
      path.resolve(__dirname, '../renderer/', 'f905a97329854a641472.otf'),
    );
  }
});

myApp.listen(1738, () => {
  console.log('Proxy server running on http://localhost:1738/');
});
