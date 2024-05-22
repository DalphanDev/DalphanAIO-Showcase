/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import axios from 'axios';
// import MySupabaseClient from './supabase';
import { getKeyFilePath, checkLoginFile } from './login';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export async function fetchUserData() {
  const keyFilePath = getKeyFilePath();
  const key = checkLoginFile(keyFilePath);
  // CALL SUPABASE FUNCTION

  console.log(`Fetching user data tied to key: ${key}`);

  // const { data, error } = await MySupabaseClient.rpc('get_user_by_key', {
  //   p_key: key,
  // });
  // if (error) {
  //   console.log(`Error fetching user data:${error}`);
  //   console.log(error);
  //   return new Error('Error fetching user data!');
  // }

  // if (data == null) {
  //   console.log('User Data is null!');
  //   return new Error('User Data is null!');
  // }

  // const discordID = data.id;
  const avatarID = '123';
  const discordName = 'User';

  return {
    img: avatarID,
    name: discordName,
    key,
  };
}

export async function fetchCheckoutData() {
  const keyFilePath = getKeyFilePath();
  const key = checkLoginFile(keyFilePath);
  // CALL SUPABASE FUNCTION

  console.log(`Fetching checkout data tied to key: ${key}`);

  // const { data, error } = await MySupabaseClient.rpc('get_checkouts_by_key', {
  //   p_key: key,
  // });
  // if (error) {
  //   console.log(`Error fetching user data:${error}`);
  //   console.log(error);
  //   return new Error('Error fetching user data!');
  // }

  // if (data == null) {
  //   console.log('Checkout Data is null!');
  //   return new Error('User Data is null!');
  // }

  // console.log(data);

  let totalSpent = '0';
  let bestSite = 'N/A';
  let bestProxy = 'N/A';
  let recentCheckouts: any[] = [];

  // if (data.total_spent != null) {
  //   totalSpent = data.total_spent;
  // }

  // if (data.highest_checkout_site != null) {
  //   bestSite = data.highest_checkout_site;
  // }

  // if (data.highest_checkout_proxy != null) {
  //   bestProxy = data.highest_checkout_proxy;
  // }

  // if (data.recent_checkouts != null) {
  //   recentCheckouts = data.recent_checkouts;
  // }

  return {
    totalSpent,
    totalCheckouts: 0,
    bestSite,
    bestProxy,
    recentCheckouts,
  };
}

export function testWebhook(type: string, url: string) {
  switch (type) {
    case 'success': {
      const webhookPayload = {
        content: null,
        embeds: [
          {
            title: 'Success Webhook',
            color: 65459,
            fields: [
              {
                name: 'Product',
                value: 'Test Product',
                inline: true,
              },
              {
                name: 'Size',
                value: 'Random',
                inline: true,
              },
              {
                name: 'Proxy',
                value: '||Resi||',
                inline: true,
              },
              {
                name: 'Monitor Delay',
                value: '||5555||',
                inline: true,
              },
              {
                name: 'Retry Delay',
                value: '||2222||',
                inline: true,
              },
              {
                name: 'Order URL',
                value: '||Placeholder||',
              },
            ],
            thumbnail: {
              url: 'https://i.imgur.com/GKnSC7g.png',
            },
          },
        ],
        username: 'DalphanAIO',
        avatar_url: 'https://i.imgur.com/GKnSC7g.png',
        attachments: [],
      };
      axios.post(url, webhookPayload);
      break;
    }
    case 'failure': {
      const webhookPayload = {
        content: null,
        embeds: [
          {
            title: 'Failure Webhook',
            color: 16723818,
            fields: [
              {
                name: 'Product',
                value: 'Test Product',
                inline: true,
              },
              {
                name: 'Size',
                value: 'Random',
                inline: true,
              },
              {
                name: 'Proxy',
                value: '||Resi||',
                inline: true,
              },
              {
                name: 'Monitor Delay',
                value: '||5555||',
                inline: true,
              },
              {
                name: 'Retry Delay',
                value: '||2222||',
                inline: true,
              },
              {
                name: 'Error',
                value: 'Card declined.',
              },
            ],
            thumbnail: {
              url: 'https://i.imgur.com/GKnSC7g.png',
            },
          },
        ],
        username: 'DalphanAIO',
        avatar_url: 'https://i.imgur.com/GKnSC7g.png',
        attachments: [],
      };
      axios.post(url, webhookPayload);
      break;
    }
    case 'misc': {
      const webhookPayload = {
        content: null,
        embeds: [
          {
            title: 'Misc Webhook',
            description: '**Shopify Automations Started!**',
            color: 444125,
            fields: [
              {
                name: 'Group',
                value: 'MyAutoGroup',
                inline: true,
              },
              {
                name: 'Matched KWs',
                value: '+jordan,+retro,-gs',
                inline: true,
              },
            ],
            thumbnail: {
              url: 'https://i.imgur.com/GKnSC7g.png',
            },
          },
        ],
        username: 'DalphanAIO',
        avatar_url: 'https://i.imgur.com/GKnSC7g.png',
        attachments: [],
      };

      axios.post(url, webhookPayload);
      break;
    }
    default: {
      break;
    }
  }
}
