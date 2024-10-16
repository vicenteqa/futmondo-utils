import { postData } from '../services/apiServices.js';
import 'dotenv/config';

const endpoint = '/userteam/information';

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

export async function getChampionshipInfo() {
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    console.error('Error calling championship info endpoint:', error);
  }
}
