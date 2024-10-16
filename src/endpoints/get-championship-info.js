import 'dotenv/config';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.futmondo.com/',
  timeout: 5000,
});

async function postData(endpoint, data) {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('POST API Error:', error);
    throw error;
  }
}

const endpoint = '/2/championship/teams';

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
