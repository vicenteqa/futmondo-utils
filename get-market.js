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

export async function getMarket() {
  const endpoint = '/market/players';
  try {
    const response = await postData(endpoint, getMarketBody);
    if (response.answer.length > 15) return response.answer;
    else console.log(response.answer.code);
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
