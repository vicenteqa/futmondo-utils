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

await sendBid('63d8eb7b1d17ae5aff1f4c52', 23000000);
await sendBid('611e6d65c6657008542a1453', 13000000);

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
        playerData.price + playerData.change * 2
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
