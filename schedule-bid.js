import { postData } from './src/services/apiServices.js';
import { getMarket } from './get-market.js';
import 'dotenv/config';

async function getBidBody(playerSlug, playerId, price) {
  return {
    header: {
      token: process.env.TOKEN,
      userid: process.env.USER_ID,
    },
    query: {
      championshipId: process.env.CHAMPIONSHIP_ID,
      userteamId: process.env.USER_TEAM_ID,
      player_slug: playerSlug,
      player_id: playerId,
      price: price,
      isClause: false,
    },
    answer: {},
  };
}

const market = await getMarket();

async function getPlayerData(playerId) {
  const player = market.find((player) => player.id === playerId);
  if (!player) return null;
  else
    return {
      name: player.name,
      bids: player.numberOfBids,
      price: player.price,
      player_slug: player.slug,
      change: player.change,
    };
}

await sendBid('63d8eb7b1d17ae5aff1f4c52', 12000000);

async function sendBid(playerId, amount) {
  const playerData = await getPlayerData(playerId);
  if (playerData) {
    let bidBody;
    if (playerData.bids === 0) {
      bidBody = await getBidBody(
        playerData.player_slug,
        playerId,
        playerData.price
      );
    } else if (playerData.bids === 1) {
      bidBody = await getBidBody(
        playerData.player_slug,
        playerId,
        playerData.price + playerData.change
      );
    } else {
      bidBody = await getBidBody(playerData.player_slug, playerId, amount);
    }

    const response = await submitBid(bidBody);
    if (response.answer.code === 'api.general.ok')
      console.log(`Has pujado por ${playerData.name}`);
    else console.error(response.answer.code);
  } else console.error('Player not found in Market');
}

async function submitBid(bidBody) {
  try {
    const response = await postData('/market/bid', bidBody);
    return response;
  } catch (error) {
    console.error('Error calling market endpoint:', error);
  }
}
