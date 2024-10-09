import { readFile } from 'fs';

// Leer el archivo market.json
readFile('market.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el archivo:', err);
    return;
  }

  // Parsear el contenido JSON
  const marketData = JSON.parse(data);

  // Iterar sobre cada jugador en la lista answer
  marketData.answer.forEach((player) => {
    // Obtener el nombre del jugador y el número de ofertas
    const playerName = player.name;
    const numberOfBids = player.numberOfBids;
    const isComputer = player.computer;
    const userTeam = player.userTeam;

    // Mostrar solo jugadores con al menos una oferta
    if (numberOfBids > 0) {
      if (userTeam) {
        console.log(
          `Jugador: ${playerName}, Ofertas: ${numberOfBids}, Propietario: ${userTeam}`
        );
      } else {
        console.log(
          `Jugador: ${playerName}, Ofertas: ${numberOfBids}, Propietario: ${isComputer}`
        );
      }
    }
  });
});
