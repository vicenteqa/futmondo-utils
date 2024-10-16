import { getMarket } from '../endpoints/get-market.js';
import { formatCurrency } from '../common/utils.js';

export async function getPlayersWithHigherChange() {
  const market = await getMarket();
  const sortedMarket = market.sort((a, b) => b.change - a.change);

  const bestOfMarket = sortedMarket.map((player) => ({
    jugador: player.name,
    propietario: player.userTeam || 'Computer',
    cambio: formatCurrency(player.change),
    ofertas: player.numberOfBids || 0,
    precio: formatCurrency(player.price),
    medias: {
      total: player.average.average,
      media_casa: player.average.homeAverage,
      media_fuera: player.average.awayAverage,
      media_cinco: player.average.averageLastFive,
      forma: JSON.stringify(player.average.fitness),
    },
    id: player.id,
  }));

  return bestOfMarket;
}

async function getBestPlayersFromMarket() {
  const bestMarket = await getPlayersWithHigherChange();
  console.log(bestMarket);
}
