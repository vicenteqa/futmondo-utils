import { postData } from '../services/apiServices.js';
import 'dotenv/config';

const endpoint = '/market/myplayers';

const body = {
  header: {
    token: process.env.TOKEN,
    userid: process.env.USER_ID,
  },
  query: {
    championshipId: process.env.CHAMPIONSHIP_ID,
    userteamId: process.env.USER_TEAM_ID,
    type: 'market',
  },
  answer: {},
};

export async function getMyPlayersInMarket() {
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    console.error('Error calling market endpoint:', error);
  }
}

getMyPlayersInMarket();
