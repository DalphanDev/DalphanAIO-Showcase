import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import dalphan from '../../assets/images/dalphan.svg';
import './harvester.css';

declare global {
  interface Window {
    onCaptchaSuccess: () => void;
    onSuccess: (token: string) => void;
    recaptchaCallback: () => void;
    v3Callback: () => void;
    hcaptchaOnLoad: () => void;
    grecaptcha: any;
    hcaptcha: any;
  }
}

interface HarvesterData {
  id: string;
  name: string;
  type: string;
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

function minimizeWindow() {
  window.electron.ipcRenderer.send('window', ['minimize']);
}

function closeApp() {
  window.electron.ipcRenderer.send('window', ['close']);
}

function HarvesterWindow() {
  const [harvesterId, setHarvesterId] = useState('');
  const [harvesterName, setHarvesterName] = useState('');
  const [harvesterType, setHarvesterType] = useState('');
  const [captchaAuthToken, setCaptchaAuthToken] = useState('');
  const [captchaSiteKey, setCaptchaSiteKey] = useState('');
  const [myCaptchaType, setMyCaptchaType] = useState('');
  const [captchaSignal, setCaptchaSignal] = useState<Signal>();

  useEffect(() => {
    const onCaptchaLoad = () => {
      console.log('onCaptchaLoad called!');

      console.log(harvesterId);

      if (myCaptchaType === 'g-recaptcha') {
        window.electron.ipcRenderer.send(
          'click-grecaptcha-checkbox',
          harvesterId,
        );
      }

      window.electron.ipcRenderer.send('click-hcaptcha-checkbox', harvesterId);
    };

    if (captchaSiteKey === '') {
      console.log('No captcha site key found!');
      return undefined;
    }

    console.log('Loading captcha...');
    console.log(captchaSiteKey);

    const script = document.createElement('script');

    if (myCaptchaType === 'g-recaptcha') {
      script.src = `https://www.recaptcha.net/recaptcha/api.js?onload=recaptchaCallback&render=${captchaSiteKey}`;
    } else if (myCaptchaType === 'h-captcha') {
      script.src =
        'https://js.hcaptcha.com/1/api.js?onload=hcaptchaOnLoad&render=explicit';
    } else if (myCaptchaType === 'v3') {
      script.src = `https://www.recaptcha.net/recaptcha/api.js?onload=v3Callback&render=${captchaSiteKey}`;
    }
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    window.onCaptchaSuccess = function () {
      console.log('Captcha success!');
      console.log(window.grecaptcha.getResponse());

      const myData = JSON.stringify({
        authToken: captchaAuthToken,
        captchaToken: window.grecaptcha.getResponse(),
        captchaType: 'g-recaptcha',
      });

      const signal: Signal = {
        taskID: captchaSignal!.taskID,
        action: 'response-shopify-checkpoint',
        status: 'Captcha solved!',
        statusType: 'info',
        isRunning: true,
        site: captchaSignal!.site,
        siteName: captchaSignal!.siteName,
        mode: captchaSignal!.mode,
        input: captchaSignal!.input,
        size: captchaSignal!.size,
        monitorDelay: captchaSignal!.monitorDelay,
        retryDelay: captchaSignal!.retryDelay,
        productQuantity: captchaSignal!.productQuantity,
        minSizesLoaded: captchaSignal!.minSizesLoaded,
        minPrice: captchaSignal!.minPrice,
        maxPrice: captchaSignal!.maxPrice,
        profile: {
          id: captchaSignal!.profile.id,
          sameAsShipping: captchaSignal!.profile.sameAsShipping,
          shipping: {
            firstName: captchaSignal!.profile.shipping.firstName,
            lastName: captchaSignal!.profile.shipping.lastName,
            email: captchaSignal!.profile.shipping.email,
            phone: captchaSignal!.profile.shipping.phone,
            address1: captchaSignal!.profile.shipping.address1,
            address2: captchaSignal!.profile.shipping.address2,
            country: captchaSignal!.profile.shipping.country,
            state: captchaSignal!.profile.shipping.state,
            city: captchaSignal!.profile.shipping.city,
            zip: captchaSignal!.profile.shipping.zip,
          },
          billing: {
            firstName: captchaSignal!.profile.billing.firstName,
            lastName: captchaSignal!.profile.billing.lastName,
            address1: captchaSignal!.profile.billing.address1,
            address2: captchaSignal!.profile.billing.address2,
            country: captchaSignal!.profile.billing.country,
            state: captchaSignal!.profile.billing.state,
            city: captchaSignal!.profile.billing.city,
            zip: captchaSignal!.profile.billing.zip,
          },
          payment: {
            cardType: captchaSignal!.profile.payment.cardType,
            cardHolder: captchaSignal!.profile.payment.cardHolder,
            cardNumber: captchaSignal!.profile.payment.cardNumber,
            cardExpiry: captchaSignal!.profile.payment.cardExpiry,
            cardCvv: captchaSignal!.profile.payment.cardCvv,
          },
        },
        account: {
          username: captchaSignal!.account.username,
          password: captchaSignal!.account.password,
        },
        proxy: {
          monitor: captchaSignal!.proxy.monitor,
          task: captchaSignal!.proxy.task,
          taskName: captchaSignal!.proxy.taskName,
        },
        webhook: {
          success: captchaSignal!.webhook.success,
          failure: captchaSignal!.webhook.failure,
          misc: captchaSignal!.webhook.misc,
        },
        data: myData,
      };

      window.electron.ipcRenderer.send('captcha-success', signal);
    };

    window.recaptchaCallback = function () {
      console.log('Rendering captcha...');
      window.grecaptcha.render('recaptcha-container', {
        sitekey: captchaSiteKey,
        size: window.innerWidth > 320 ? 'normal' : 'compact',
        callback: 'onCaptchaSuccess',
      });

      // Define what should happen when CAPTCHA is loaded

      // Initialize the MutationObserver
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          console.log(mutation);
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
              console.log(node);
              if (
                node.nodeType === 1 &&
                (node as Element).tagName === 'IFRAME'
              ) {
                console.log('Captcha loaded!');
                // Captcha has loaded, call the onCaptchaLoad function
                onCaptchaLoad();

                // Disconnect the observer if you only care about the first load
                observer.disconnect();
              }
            });
          }
        });
      });

      // Observe a specific element for modifications
      observer.observe(document.getElementById('recaptcha-container')!, {
        childList: true,
        subtree: true,
      });
    };

    window.v3Callback = function () {
      console.log('Rendering captcha...');
      window.grecaptcha
        .execute(captchaSiteKey, { action: 'customer_login' })
        .then((token: string) => {
          console.log('Captcha success!');

          const myData = JSON.stringify({
            captchaToken: token,
          });

          const signal: Signal = {
            taskID: captchaSignal!.taskID,
            action: 'response-shopify-v3',
            status: 'Captcha solved!',
            statusType: 'info',
            isRunning: true,
            site: captchaSignal!.site,
            siteName: captchaSignal!.siteName,
            mode: captchaSignal!.mode,
            input: captchaSignal!.input,
            size: captchaSignal!.size,
            monitorDelay: captchaSignal!.monitorDelay,
            retryDelay: captchaSignal!.retryDelay,
            productQuantity: captchaSignal!.productQuantity,
            minSizesLoaded: captchaSignal!.minSizesLoaded,
            minPrice: captchaSignal!.minPrice,
            maxPrice: captchaSignal!.maxPrice,
            profile: {
              id: captchaSignal!.profile.id,
              sameAsShipping: captchaSignal!.profile.sameAsShipping,
              shipping: {
                firstName: captchaSignal!.profile.shipping.firstName,
                lastName: captchaSignal!.profile.shipping.lastName,
                email: captchaSignal!.profile.shipping.email,
                phone: captchaSignal!.profile.shipping.phone,
                address1: captchaSignal!.profile.shipping.address1,
                address2: captchaSignal!.profile.shipping.address2,
                country: captchaSignal!.profile.shipping.country,
                state: captchaSignal!.profile.shipping.state,
                city: captchaSignal!.profile.shipping.city,
                zip: captchaSignal!.profile.shipping.zip,
              },
              billing: {
                firstName: captchaSignal!.profile.billing.firstName,
                lastName: captchaSignal!.profile.billing.lastName,
                address1: captchaSignal!.profile.billing.address1,
                address2: captchaSignal!.profile.billing.address2,
                country: captchaSignal!.profile.billing.country,
                state: captchaSignal!.profile.billing.state,
                city: captchaSignal!.profile.billing.city,
                zip: captchaSignal!.profile.billing.zip,
              },
              payment: {
                cardType: captchaSignal!.profile.payment.cardType,
                cardHolder: captchaSignal!.profile.payment.cardHolder,
                cardNumber: captchaSignal!.profile.payment.cardNumber,
                cardExpiry: captchaSignal!.profile.payment.cardExpiry,
                cardCvv: captchaSignal!.profile.payment.cardCvv,
              },
            },
            account: {
              username: captchaSignal!.account.username,
              password: captchaSignal!.account.password,
            },
            proxy: {
              monitor: captchaSignal!.proxy.monitor,
              task: captchaSignal!.proxy.task,
              taskName: captchaSignal!.proxy.taskName,
            },
            webhook: {
              success: captchaSignal!.webhook.success,
              failure: captchaSignal!.webhook.failure,
              misc: captchaSignal!.webhook.misc,
            },
            data: myData,
          };

          window.electron.ipcRenderer.send('captcha-success', signal);
          return '';
        })
        .catch((err: any) => {
          console.log(err);
          return '';
        });
    };

    window.hcaptchaOnLoad = function () {
      // Initialize the MutationObserver
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          console.log(mutation);
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
              console.log(node);
              if (
                node.nodeType === 1 &&
                (node as Element).tagName === 'IFRAME'
              ) {
                console.log('Captcha loaded!');
                // Captcha has loaded, call the onCaptchaLoad function
                onCaptchaLoad();

                // Disconnect the observer if you only care about the first load
                observer.disconnect();
              }
            });
          }
        });
      });

      // Observe a specific element for modifications
      observer.observe(document.getElementById('hcaptcha-container')!, {
        childList: true,
        subtree: true,
      });

      window.hcaptcha.render('hcaptcha-container', {
        sitekey: captchaSiteKey,
      });
    };

    window.onSuccess = function (token: string) {
      const myData = JSON.stringify({
        authToken: captchaAuthToken,
        captchaToken: token,
        captchaType: 'h-captcha',
      });

      const signal: Signal = {
        taskID: captchaSignal!.taskID,
        action: 'response-shopify-checkpoint',
        status: 'Captcha solved!',
        statusType: 'info',
        isRunning: true,
        site: captchaSignal!.site,
        siteName: captchaSignal!.siteName,
        mode: captchaSignal!.mode,
        input: captchaSignal!.input,
        size: captchaSignal!.size,
        monitorDelay: captchaSignal!.monitorDelay,
        retryDelay: captchaSignal!.retryDelay,
        productQuantity: captchaSignal!.productQuantity,
        minSizesLoaded: captchaSignal!.minSizesLoaded,
        minPrice: captchaSignal!.minPrice,
        maxPrice: captchaSignal!.maxPrice,
        profile: {
          id: captchaSignal!.profile.id,
          sameAsShipping: captchaSignal!.profile.sameAsShipping,
          shipping: {
            firstName: captchaSignal!.profile.shipping.firstName,
            lastName: captchaSignal!.profile.shipping.lastName,
            email: captchaSignal!.profile.shipping.email,
            phone: captchaSignal!.profile.shipping.phone,
            address1: captchaSignal!.profile.shipping.address1,
            address2: captchaSignal!.profile.shipping.address2,
            country: captchaSignal!.profile.shipping.country,
            state: captchaSignal!.profile.shipping.state,
            city: captchaSignal!.profile.shipping.city,
            zip: captchaSignal!.profile.shipping.zip,
          },
          billing: {
            firstName: captchaSignal!.profile.billing.firstName,
            lastName: captchaSignal!.profile.billing.lastName,
            address1: captchaSignal!.profile.billing.address1,
            address2: captchaSignal!.profile.billing.address2,
            country: captchaSignal!.profile.billing.country,
            state: captchaSignal!.profile.billing.state,
            city: captchaSignal!.profile.billing.city,
            zip: captchaSignal!.profile.billing.zip,
          },
          payment: {
            cardType: captchaSignal!.profile.payment.cardType,
            cardHolder: captchaSignal!.profile.payment.cardHolder,
            cardNumber: captchaSignal!.profile.payment.cardNumber,
            cardExpiry: captchaSignal!.profile.payment.cardExpiry,
            cardCvv: captchaSignal!.profile.payment.cardCvv,
          },
        },
        account: {
          username: captchaSignal!.account.username,
          password: captchaSignal!.account.password,
        },
        proxy: {
          monitor: captchaSignal!.proxy.monitor,
          task: captchaSignal!.proxy.task,
          taskName: captchaSignal!.proxy.taskName,
        },
        webhook: {
          success: captchaSignal!.webhook.success,
          failure: captchaSignal!.webhook.failure,
          misc: captchaSignal!.webhook.misc,
        },
        data: myData,
      };

      window.electron.ipcRenderer.send('captcha-success', signal);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [
    captchaAuthToken,
    captchaSignal,
    captchaSiteKey,
    harvesterId,
    myCaptchaType,
  ]);

  const renderCenterContent = () => {
    if (captchaSiteKey !== '') {
      if (myCaptchaType === 'g-recaptcha') {
        return (
          <div id="iconContainer">
            <div id="recaptcha-container" className="recaptcha-container" />
          </div>
        );
      }

      return (
        <div id="iconContainer">
          <div
            id="hcaptcha-container"
            className="h-captcha"
            data-sitekey={captchaSiteKey}
            data-callback="onSuccess"
          />
        </div>
      );
    }
    return (
      <div id="iconContainer">
        <div className="spinner1">
          <div className="spinner2">
            <div />
          </div>
        </div>
        <img id="icon" src={dalphan} alt="" />
      </div>
    );
  };

  window.electron.ipcRenderer.on('launch-harvester', (data) => {
    console.log('Launching harvester...');
    const harvesterData = data as HarvesterData;
    const { id, name, type } = harvesterData;
    setHarvesterId(id);
    setHarvesterName(name);
    setHarvesterType(type);
  });

  window.electron.ipcRenderer.on('captcha', (data: any) => {
    const myCaptchaSignal: Signal = data[0];

    const harvesterID = data[1];

    const parsedSignalData = JSON.parse(myCaptchaSignal.data);

    console.log('Received captcha!');
    console.log(captchaSignal);

    setCaptchaSignal(myCaptchaSignal);

    if (myCaptchaSignal.action === 'request-shopify-checkpoint') {
      const { authToken, siteKey, captchaType } =
        parsedSignalData as ShopifyCheckpointData;
      setCaptchaAuthToken(authToken);
      setCaptchaSiteKey(siteKey);
      setMyCaptchaType(captchaType);
      setHarvesterId(harvesterID);
    } else if (myCaptchaSignal.action === 'request-shopify-v3') {
      const { siteKey, captchaType } = parsedSignalData as ShopifyV3Data;
      setCaptchaSiteKey(siteKey);
      setMyCaptchaType(captchaType);
      setHarvesterId(harvesterID);
    }
  });

  console.log('Rendering harvester window...');

  return (
    <div id="container" key={harvesterId}>
      {/* <div id="cursor" /> */}
      <div id="windowActions">
        <button id="windowButton" type="button" onClick={minimizeWindow}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 12h-15"
            />
          </svg>
        </button>
        <button id="exitButton" type="button" onClick={closeApp}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <p id="name">{harvesterName}</p>
      <p id="type">{harvesterType}</p>
      {renderCenterContent()}
    </div>
  );
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<HarvesterWindow />);
