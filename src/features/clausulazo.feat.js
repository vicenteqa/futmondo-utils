import 'dotenv/config';
import { getPlayerDataAndPayClausula } from '../logic/clausulazo.js';
import { getNextCronExecution } from '../common/get-next-cron-execution.js';
import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

const playerId = '5f7c91e784180b4fc44cd0ee';

async function clausulazo(scheduled = true) {
  if (scheduled) {
    const cronExpression = '01 06 16 * * *';
    const timezone = 'Europe/Madrid';
    const nextExecution = await getNextCronExecution(cronExpression, timezone);
    console.log(`Clausulazo programado a las ${nextExecution}`);
    cron.schedule(
      cronExpression,
      async () => {
        const response = await getPlayerDataAndPayClausula(playerId);
        const afterClausulazo = dayjs()
          .tz(dayjs.tz.guess())
          .format('DD/MM/YYYY HH:mm:ss');
        console.log(response, ` ${afterClausulazo}`);
      },
      { timezone: timezone }
    );
  } else {
    const response = await getPlayerDataAndPayClausula(playerId);
    const afterClausulazo = dayjs()
      .tz(dayjs.tz.guess())
      .format('DD/MM/YYYY HH:mm:ss');
    console.log(response, ` ${afterClausulazo}`);
  }
}

clausulazo();
