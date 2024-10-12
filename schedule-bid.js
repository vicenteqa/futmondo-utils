import { postData } from './src/services/apiServices.js';
import 'dotenv/config';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getMarketBody = {
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

async function getMarket() {
  const endpoint = '/market/players';
  try {
    const response = await postData(endpoint, getMarketBody);
    if (response.answer.length > 15) return response.answer;
    else console.log(response.answer.code);
    console.log(response.answer.length);
  } catch (error) {
    console.error('Error calling market endpoint:', error);
  }
}

const market = await getMarket();

const playersWithHighChange = market
  .filter((player) => player.change > 80000)
  .map((player) => ({
    jugador: player.name,
    propietario: player.userTeam || 'Computer',
    cambio: formatCurrency(player.change),
    ofertas: player.numberOfBids || 0,
    precio: formatCurrency(player.price),
    id: player.id,
  }));

// console.log(playersWithHighChange);

async function getPlayerData(playerId) {
  const player = market.find((player) => player.id === playerId);
  return {
    name: player.name,
    bids: player.numberOfBids,
    price: player.price,
    player_slug: player.slug,
    change: player.change,
  };
}

await sendBid('617db824fca9f703e07b2a81', 21004530);
await sendBid('5c6843548953a6467168db95', 12400000);

async function sendBid(playerId, amount) {
  const playerData = await getPlayerData(playerId);

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
      playerData.price + playerData.change * 2
    );
  } else {
    bidBody = await getBidBody(playerData.player_slug, playerId, amount);
  }

  const response = await submitBid(bidBody);
  if (response.answer.code === 'api.general.ok')
    console.log(`Has pujado por ${playerData.name}`);
}

async function submitBid(bidBody) {
  try {
    const response = await postData('/market/bid', bidBody);
    return response;
  } catch (error) {
    console.error('Error calling market endpoint:', error);
  }
}

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
