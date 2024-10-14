import { postData } from './src/services/apiServices.js';
import { getMarket } from './get-market.js';
import 'dotenv/config';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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

await submitBid('66c9b0acf119260402e26288', 12000000);

async function setBidPrice(playerData, maxAmount) {
  if (playerData.bids === 0) return playerData.price;
  else if (playerData.bids === 1) return playerData.price + playerData.change;
  else return maxAmount;
}

async function submitBid(playerId, maxAmount) {
  const playerData = await getPlayerData(playerId);

  if (playerData) {
    const bidAmount = await setBidPrice(playerData, maxAmount);
    const bidBody = await getBidBody(
      playerData.player_slug,
      playerId,
      bidAmount
    );
    console.log(
      `Vas a enviar una puja de ${formatCurrency(bidAmount)} por ${playerData.name}`
    );
    const response = await sendBidRequest(bidBody);
    if (response.answer.code === 'api.general.ok')
      console.log(`Has pujado por ${playerData.name}`);
    else console.error(response.answer.code);
  } else console.error('Player not found in Market');
}

async function sendBidRequest(bidBody) {
  try {
    const response = await postData('/market/bid', bidBody);
    return response;
  } catch (error) {
    console.error('Error calling market endpoint:', error);
  }
}
