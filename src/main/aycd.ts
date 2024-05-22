/* eslint-disable */
import {
  CaptchaResponse,
  CaptchaTokenCancelResponse,
  CaptchaTokenRequest,
  CaptchaTokenResponse,
  getAutoSolveClient,
  OpenError,
  ReCaptchaV2Checkbox,
  ReCaptchaV3,
  ReCaptchaV3Enterprise,
  Session,
  SessionListener,
  Status,
} from 'autosolve-client';
import axios from 'axios';

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

interface ShopifyV3Solve {
  captchaToken: string;
}

interface ShopifyCheckpointSolve {
  authToken: string;
  captchaToken: string;
  captchaType: string;
}

interface ExtendedCaptchaResponse extends CaptchaResponse {
  token: string;
}

let autosolveService: AutoSolveService | null = null;
let clientKey = ''; // Redacted
let isAYCDApiKeyConnected = false;
export let aiKey = '';

class AutoSolveService {
  private readonly _listener: SessionListener;

  private _session: Session | undefined;

  _responseMap: Map<string, Function> = new Map();

  constructor() {
    this._listener = new SessionListenerImpl(this);
  }

  public async init(clientId: string) {
    await getAutoSolveClient().init(clientId);
  }

  public async connect(apiKey: string): Promise<OpenError> {
    this._session = await getAutoSolveClient().getSession(apiKey);
    this._session.setListener(this._listener);
    let err = await this._session.open();
    if (err) {
      return err;
    }
    return OpenError.None;
  }

  public async close(): Promise<void> {
    if (this._session) {
      await this._session.close();
    }
  }

  public async solve(
    tokenRequest: CaptchaTokenRequest,
  ): Promise<CaptchaSolveResponse> {
    if (!this._session) {
      throw new Error('Session is not available.');
    }
    let promise = new Promise<CaptchaSolveResponse>((resolve) => {
      this._responseMap.set(tokenRequest.taskId, resolve);
    });
    this._session.send(tokenRequest);
    return promise;
  }
}

class SessionListenerImpl implements SessionListener {
  private readonly _service: AutoSolveService;

  constructor(service: AutoSolveService) {
    this._service = service;
  }

  onError(err: any): void {
    console.log('onError', err);
  }

  onStatusChanged(status: Status): void {
    console.log('onStatusChanged', status);
  }

  onTokenCancelResponse(response: CaptchaTokenCancelResponse): void {
    console.log('onTokenCancelResponse', response);
    response.requests?.forEach((request) => {
      let resp = new CaptchaSolveResponse(true, undefined);
      this._service._responseMap.get(request.taskId)?.call(this._service, resp);
    });
  }

  onTokenResponse(response: CaptchaTokenResponse): void {
    console.log('onTokenResponse', response);
    let resp = new CaptchaSolveResponse(
      false,
      response as ExtendedCaptchaResponse,
    );
    this._service._responseMap.get(response.taskId)?.call(this._service, resp);
  }
}

class CaptchaSolveResponse {
  private readonly _cancelled: boolean;

  private readonly _response: ExtendedCaptchaResponse | undefined;

  constructor(
    cancelled: boolean,
    response: ExtendedCaptchaResponse | undefined,
  ) {
    this._cancelled = cancelled;
    this._response = response;
  }

  get cancelled(): boolean {
    return this._cancelled;
  }

  get response(): ExtendedCaptchaResponse | undefined {
    return this._response;
  }
}

export async function updateAIKey(myAiKey: string) {
  try {
    const validationResponse = await axios.post(
      'https://autosolve-ai-api.aycd.io/api/v1/user/verify',
      {},
      {
        headers: {
          Authorization: `Token ${myAiKey}`,
        },
      },
    );

    if (validationResponse.status === 200) {
      aiKey = myAiKey;
      console.log('Valid AI Key!');
      return true;
    } else {
      aiKey = '';
      return false;
    }
  } catch (err) {
    console.log('Invalid AI Key: ', err);
    return false;
  }
}

export async function establishApiConnection(myApiKey: string) {
  let apiKey = myApiKey;
  if (autosolveService === null) {
    return false;
  }

  if (apiKey === '') {
    return false;
  }

  let error = await autosolveService.connect(apiKey);
  if (error !== OpenError.None) {
    console.log('Error Intializing Autosolve Service!');
    isAYCDApiKeyConnected = false;
    return false;
  }

  console.log('Autosolve API Key Connected!');
  isAYCDApiKeyConnected = true;
  return true;
}

export async function solveRecaptchaV2AYCD(
  captchaSignal: ShopifyCheckpointData,
) {
  let tokenRequest = new CaptchaTokenRequest();
  tokenRequest.url = captchaSignal.url;
  tokenRequest.siteKey = captchaSignal.siteKey;
  tokenRequest.taskId = captchaSignal.taskID;
  tokenRequest.version = ReCaptchaV2Checkbox;

  if (autosolveService !== null) {
    console.log('Solving Captcha...');
    console.log(tokenRequest);
    let response = await autosolveService.solve(tokenRequest);

    if (response.cancelled) {
      console.log('Cancelled: ', tokenRequest.taskId);
    } else {
      console.log('Response', tokenRequest.taskId);
    }

    console.log('Received response', response);

    const myCaptchaResponse: ShopifyCheckpointSolve = {
      authToken: captchaSignal.authToken,
      captchaToken: response.response?.token ?? '',
      captchaType: 'g-recaptcha',
    };

    return myCaptchaResponse;
  }
  console.log('Autosolve Service is null!');
  return null;
}

export async function solveRecaptchaV3AYCD(captchaSignal: ShopifyV3Data) {
  let tokenRequest = new CaptchaTokenRequest();
  tokenRequest.url = captchaSignal.url;
  tokenRequest.siteKey = captchaSignal.siteKey;
  tokenRequest.taskId = captchaSignal.taskID;
  tokenRequest.action = 'customer_login';
  tokenRequest.version = ReCaptchaV3;

  if (autosolveService !== null) {
    console.log('Solving Captcha...');
    console.log(tokenRequest);
    let response = await autosolveService.solve(tokenRequest);

    if (response.cancelled) {
      console.log('Cancelled: ', tokenRequest.taskId);
    } else {
      console.log('Response', tokenRequest.taskId);
    }

    if (response.response !== undefined) {
      console.log(response.response.token);
    }

    const myCaptchaResponse: ShopifyV3Solve = {
      captchaToken: response.response?.token ?? '',
    };

    return myCaptchaResponse;
  }
  console.log('Autosolve Service is null!');
  return null;
}

async function main() {
  autosolveService = new AutoSolveService();
  await autosolveService.init(clientKey);
  console.log('Autosolve Service Initialized!');
}

main();

export { isAYCDApiKeyConnected };
