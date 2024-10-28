import 'dotenv/config';
import { getPlayerData } from '../endpoints/get-player-data.js';
import { payClausula } from '../endpoints/pay-clausula.js';
import { sleep } from '../common/utils.js';
import 'dotenv/config';

//Obtiene los datos del jugador y paga la cláusula
export async function getPlayerDataAndPayClausula(
  playerId,
  retriesMaxClauses = 10
) {
  const response = await retry(() => getPlayerData(playerId));
  if (response === undefined)
    return 'No se han podido obtener los datos del mercado';
  else {
    const playerSlug = response.answer.data.slug;
    const price = response.answer.championship.clause.price;
    const playerName = response.answer.data.name;

    const payClauseResponse = await retry(() =>
      payClausula(playerSlug, price, playerId)
    );

    if (payClauseResponse === undefined)
      return 'Error al llamar al endpoint para pagar la cláusula';
    else if (
      payClauseResponse.answer.code === 'api.error.max_clauses' &&
      retriesMaxClauses > 0
    ) {
      retriesMaxClauses--;
      console.log(
        `Máximas cláusulas pagadas por ${playerName}. Esperando 2 segundos para reintentar...`
      );
      await sleep(3000);
      return getPlayerDataAndPayClausula(playerId, retriesMaxClauses);
    } else
      return await handlePayClauseResponse(
        payClauseResponse,
        playerName,
        price
      );
  }
}

async function retry(fn, retries = 5, delay = 2000) {
  while (retries > 0) {
    try {
      return await fn();
    } catch (error) {
      console.error(
        `Error: ${error.message}. Retrying ${retries - 1} more times`
      );
      retries--;
      if (retries > 0) await sleep(delay);
    }
  }
  return undefined;
}

//Maneja la respuesta del pago de la cláusula
async function handlePayClauseResponse(response, playerName, price) {
  if (response.answer.error) {
    const errorCode = response.answer.code;
    if (errorCode === 'api.error.max_clauses') {
      console.log(`Máximas cláusulas pagadas por ${playerName}`);
      return 'Máximas cláusulas pagadas';
    } else return undefined;
  } else
    return `Has pagado la claúsula de *${playerName}* de *${formatCurrency(price)}*`;
}
