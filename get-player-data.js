import { postData } from './src/services/apiServices.js';
import 'dotenv/config';

function getPlayerSummaryRequestBody() {
  return {
    header: {
      token: process.env.TOKEN,
      userid: '652bc64b2ccd69060ecfb26e',
    },
    query: {
      championshipId: '6527184d361d0805fd6a729b',
      userteamId: '652bc9051485a17231213ec8',
      playerId: process.env.PLAYER_ID,
    },
    answer: {},
  };
}

async function getPlayerData() {
  const body = getPlayerSummaryRequestBody();
  console.log(body);
  try {
    const response = await postData('/player/summary', body);
    return handlePlayerDataResponse(response);
  } catch (error) {
    console.error('Error calling player summary endpoint:', error);
  }
}

export { getPlayerData };

async function handlePlayerDataResponse(response) {
  if (!response.answer.error) {
    return {
      slug: response.answer.data.slug,
      price: response.answer.championship.clause.price,
    };
  } else return response.answer.code;
}
