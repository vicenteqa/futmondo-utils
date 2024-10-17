import { getMarket } from '../endpoints/get-market.js';
import { formatCurrency } from '../common/utils.js';

export async function getCurrentMarket() {
  const market = await getMarket();
  let sortedMarket = market.sort((a, b) => b.price - a.price);
  sortedMarket = sortedMarket.map((player) => ({
    jugador: player.name,
    propietario: player.userTeam || 'Computer',
    cambio: formatCurrency(player.change),
    ofertas: player.numberOfBids || 0,
    precio: formatCurrency(player.price),
    id: player.id,
  }));
  return sortedMarket.slice(0, 5);
}

const market = await getCurrentMarket();
console.log(market);
