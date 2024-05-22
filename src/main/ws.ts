import WebSocket from 'ws';
import { machineIdSync } from 'node-machine-id';
import { checkLoginFile, getKeyFilePath } from './login';

class MyWebSocket extends WebSocket {
  // eslint-disable-next-line no-undef
  public pingTimeout?: NodeJS.Timeout; // Use the correct type here
}

let isWebsocketConnected = false;
let wsConn: MyWebSocket | null = null;

export function GetWebsocketStatus() {
  return isWebsocketConnected;
}

export async function ConnectWebsocket() {
  console.log('Creating client to ws://lobster-app-lgk29.ondigitalocean.app/');

  if (wsConn) {
    console.log('Pre-existing ws connection found, not creating a new one.');
    return;
  }

  const client: MyWebSocket = new WebSocket(
    'wss://lobster-app-lgk29.ondigitalocean.app',
  );

  wsConn = client;

  const heartbeat = () => {
    clearTimeout(client.pingTimeout);
    console.log('Pinging DalphanAIO');
    client.pingTimeout = setTimeout(() => {
      client.terminate();
    }, 30000 + 1000);
  };

  const keyFilePath = getKeyFilePath();
  const key = checkLoginFile(keyFilePath);

  const body = {
    type: 'register',
    machineID: machineIdSync(true),
    keyID: key,
  };

  client.on('error', (err) => {
    console.log('Error connecting to WebSocket!');
    console.log(err);
    return 'cuh';
  });

  client.on('open', () => {
    console.log('Client opened');
    isWebsocketConnected = true;
    heartbeat();
    client.send(JSON.stringify(body));
  });

  client.on('ping', () => {
    heartbeat();
  });

  client.on('close', () => {
    isWebsocketConnected = false;
    wsConn = null;
    console.log('Client closed.');
  });

  // Here is where we can handle messages from the server
  client.on('message', function message(data) {
    console.log('received: %s', data);
  });
}
