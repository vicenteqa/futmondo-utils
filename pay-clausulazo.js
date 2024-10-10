import { postData } from './src/services/apiServices.js';
import 'dotenv/config';
import { getPlayerData } from './get-player-data.js';

let playerName = '';

async function rosterClauseBody() {
  const playerData = await getPlayerData();
  playerName = playerData.name;
  return {
    header: {
      token: process.env.TOKEN,
      userid: process.env.USER_ID,
    },
    query: {
      championshipId: process.env.CHAMPIONSHIP_ID,
      userteamId: process.env.USER_TEAM_ID,
      player_slug: playerData.slug,
      player_id: process.env.PLAYER_ID,
      price: playerData.price,
    },
    answer: {},
  };
}

async function payClausula() {
  const body = await rosterClauseBody();

  try {
    const response = await postData('/market/rosterclause', body);
    return handleRosterClauseResponse(response);
  } catch (error) {
    console.error('Error calling player summary endpoint:', error);
  }
}

async function handleRosterClauseResponse(response) {
  if (response.answer.error) {
    const errorCode = response.answer.code;
    if (errorCode === 'api.error.max_clauses')
      console.log('Máximas cláusulas pagadas');
    else console.log(response.answer.code);
  } else console.log(`Has pagado la claúsula de ${playerName}`);
}

await payClausula();
