import { readFile } from 'fs';

// Función para formatear números como euros sin decimales
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Leer el archivo market.json
readFile('market.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el archivo:', err);
    return;
  }

  // Parsear el contenido JSON
  const marketData = JSON.parse(data);

  // Crear una lista para almacenar los jugadores que cumplen con el criterio
  const playersWithHighChange = [];

  // Iterar sobre cada jugador en la lista answer
  marketData.answer.forEach((player) => {
    // Obtener el nombre del jugador, el cambio en su valor, el propietario y la cantidad de ofertas
    const playerName = player.name;
    const change = player.change;
    const userTeam = player.userTeam;
    const numberOfBids = player.numberOfBids;

    // Agregar solo jugadores con una subida de más de 100000 a la lista
    if (change > 100000) {
      playersWithHighChange.push({
        jugador: playerName,
        propietario: userTeam || 'Computer',
        cambio: formatCurrency(change),
        ofertas: numberOfBids || 0,
      });
    }
  });

  // Imprimir el contenido del objeto en la consola
  console.log(JSON.stringify(playersWithHighChange, null, 2));
});
