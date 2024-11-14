import { getMarket } from '../endpoints/get-market.js';

export async function getSortedMarket(sortingMethod = 'cambio') {
  if (!['cambio', 'pujas', 'precio', 'forma', 'media'].includes(sortingMethod))
    sortingMethod = 'cambio';
  const market = await getMarket();

  if (market === undefined) return undefined;
  else {
    return market
      .map((player) => ({
        jugador: player.name,
        lesionado: player.status.includes('injured'),
        propietario: player.userTeam || 'Computer',
        cambio: player.change,
        pujas: player.numberOfBids || 0,
        precio: player.price,
        media: player.average.average,
        forma: getAverageLastThreeMatches(player.average.fitness),
        id: player.id,
      }))
      .sort((a, b) => a[sortingMethod] - b[sortingMethod]);
  }
}

export async function getBestMarket(sortingMethod = 'cambio') {
  if (!['cambio', 'pujas', 'precio', 'forma', 'media'].includes(sortingMethod))
    sortingMethod = 'cambio';
  const market = await getMarket();

  if (market === undefined) return undefined;
  else {
    return market
      .filter((player) => {
        return player.team === 'Betis' || player.change > 80000;
      })
      .map((player) => ({
        jugador: player.name,
        lesionado: player.status.includes('injured'),
        propietario: player.userTeam || 'Computer',
        equipo: player.team,
        cambio: player.change,
        pujas: player.numberOfBids || 0,
        precio: player.price,
        media: player.average.average,
        forma: getAverageLastThreeMatches(player.average.fitness),
        id: player.id,
      }))
      .sort((a, b) => a[sortingMethod] - b[sortingMethod]);
  }
}

function getAverageLastThreeMatches(lastFiveMatches) {
  const lastThreeMatches = lastFiveMatches.slice(2);
  const average = lastThreeMatches.reduce((acc, match) => acc + match, 0) / 3;
  return Math.round(average * 2) / 2;
}
