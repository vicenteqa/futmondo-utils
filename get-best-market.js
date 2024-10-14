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

async function getPlayersWithHigherChange() {
  const market = await getMarket();

  return market
    .filter((player) => player.change > 80000)
    .map((player) => ({
      jugador: player.name,
      propietario: player.userTeam || 'Computer',
      cambio: formatCurrency(player.change),
      ofertas: player.numberOfBids || 0,
      precio: formatCurrency(player.price),
      id: player.id,
    }));
}

async function getBestPlayersFromMarket() {
  const bestMarket = await getPlayersWithHigherChange();
  console.log(bestMarket);
}

getBestPlayersFromMarket();

