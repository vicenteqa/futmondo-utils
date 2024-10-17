import cronParser from 'cron-parser';
import moment from 'moment-timezone';

export async function getNextCronExecution(cronExpression, timezone) {
  const options = {
    tz: timezone,
  };
  try {
    // Crear un objeto de intervalo para la expresión cron
    const interval = cronParser.parseExpression(cronExpression, options);

    // Obtener la próxima fecha de ejecución
    const nextExecution = interval.next().toDate();

    // Formatear la fecha de ejecución en la zona horaria de Madrid
    const formattedNextExecution = moment(nextExecution)
      .tz('Europe/Madrid')
      .format('YYYY-MM-DD HH:mm:ss');

    return formattedNextExecution;
  } catch (err) {
    console.error('Error al analizar la expresión cron:', err);
  }
}
