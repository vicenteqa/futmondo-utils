import 'dotenv/config';
import { getPlayerDataAndPayClausula } from '../logic/clausulazo.js';
import { getNextCronExecution } from '../common/get-next-cron-execution.js';
import 'dotenv/config';
import cron from 'node-cron';

const playerId = '5f7c91e784180b4fc44cd0ee';

async function clausulazo(scheduled = true) {
  if (scheduled) {
    const cronExpression = '01 00 16 * * *';
    const timezone = 'Europe/Madrid';
    const nextExecution = await getNextCronExecution(cronExpression, timezone);
    console.log(`Clausulazo programado a las ${nextExecution}`);
    cron.schedule(
      cronExpression,
      async () => {
        const response = await getPlayerDataAndPayClausula(playerId);
        console.log(response);
      },
      { timezone: timezone }
    );
  } else {
    const response = await getPlayerDataAndPayClausula(playerId);
    console.log(response);
  }
}

clausulazo();
