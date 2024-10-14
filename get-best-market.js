import { getMarket } from './get-market.js';
import { formatCurrency } from './format-currency.js';
import 'dotenv/config';

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

