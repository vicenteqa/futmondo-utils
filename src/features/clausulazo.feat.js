import 'dotenv/config';
import { getPlayerData } from '../endpoints/get-player-data.js';
import { payClausula } from '../endpoints/pay-clausula.js';
import { getNextCronExecution } from '../common/get-next-cron-execution.js';
import 'dotenv/config';
import cron from 'node-cron';

async function clausulazo(scheduled = true) {
  if (scheduled) {
    const cronExpression = '01 00 00 * * 1';
    const timezone = 'Europe/Madrid';
    const nextExecution = await getNextCronExecution(cronExpression, timezone);
    console.log(`Clausulazo programado a las ${nextExecution}`);
    cron.schedule(
      cronExpression,
      async () => await getPlayerDataAndPayClausula(process.env.PLAYER_ID),
      { timezone: timezone }
    );
  } else {
    await getPlayerDataAndPayClausula(process.env.PLAYER_ID);
  }
}

//Obtiene los datos del jugador y paga la cláusula
async function getPlayerDataAndPayClausula(playerId) {
  const response = await getPlayerData(playerId);
  const playerSlug = response.answer.data.slug;
  const price = response.answer.championship.clause.price;
  const playerName = response.answer.data.name;
  if (playerSlug) {
    const response = await payClausula(playerSlug, price, playerId);
    await handlePayClauseResponse(response, playerName);
  } else console.log('No se ha encontrado el jugador');
  process.exit(0);
}

//Maneja la respuesta del pago de la cláusula
async function handlePayClauseResponse(response, playerName) {
  if (response.answer.error) {
    const errorCode = response.answer.code;
    if (errorCode === 'api.error.max_clauses')
      console.log('Máximas cláusulas pagadas');
    else console.log(response.answer.code);
  } else console.log(`Has pagado la claúsula de ${playerName}`);
}

clausulazo();
