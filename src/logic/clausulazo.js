import 'dotenv/config';
import { getPlayerData } from '../endpoints/get-player-data.js';
import { payClausula } from '../endpoints/pay-clausula.js';
import 'dotenv/config';

//Obtiene los datos del jugador y paga la cláusula
export async function getPlayerDataAndPayClausula(playerId) {
  const response = await getPlayerData(playerId);
  if (response.answer.error !== true) {
    const playerSlug = response.answer.data.slug;
    const price = response.answer.championship.clause.price;
    const playerName = response.answer.data.name;
    const payClauseResponse = await payClausula(playerSlug, price, playerId);
    return await handlePayClauseResponse(payClauseResponse, playerName);
  } else return 'No se ha encontrado el jugador';
}

//Maneja la respuesta del pago de la cláusula
async function handlePayClauseResponse(response, playerName) {
  if (response.answer.error) {
    const errorCode = response.answer.code;
    if (errorCode === 'api.error.max_clauses')
      return 'Máximas cláusulas pagadas';
    else return response.answer.code;
  } else return `Has pagado la claúsula de *${playerName}*`;
}
