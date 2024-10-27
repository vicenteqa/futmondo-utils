import { Telegraf } from 'telegraf';
import { getSortedMarket } from './src/features/mejores-mercado.feat.js';
import { getLastAccessInfo } from './src/logic/ultimo-acceso.js';
import { setBid } from './src/logic/puja.js';
import { formatCurrency, sleep } from './src/common/utils.js';
import { getPlayerDataAndPayClausula } from './src/logic/clausulazo.js';
import { getPlayersFromSpecificUser } from './src/logic/get-teams-players.js';
import { getNextCronExecution } from './src/common/get-next-cron-execution.js';
import dayjs from 'dayjs';
import 'dotenv/config';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import cron from 'node-cron';
dayjs.extend(utc);
dayjs.extend(timezone);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply('¡Hola! Soy tu bot de Futmondo.'));

bot.help((ctx) =>
  ctx.reply(
    'Puedes usar los siguientes comandos:\n/start - Iniciar el bot\n/help - Obtener ayuda\n/puja {id} {cantidad} - Pujar por un jugador\n/mejores - Obtener los mejores jugadores del mercado\n/mejores id - Obtener los mejores jugadores del mercado con su id\n/caros - Obtener los jugadores más caros del mercado\n/caros id - Obtener los jugadores más caros del mercado con su id\n'
  )
);

bot.command('team', async (ctx) => {
  const message = ctx.message.text;
  const args = message.split(' ');
  const team = args[1];
  const players = await getPlayersFromSpecificUser(team);
  const answer = formatTeamPlayersDataToString(players, true);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('puja', async (ctx) => {
  const message = ctx.message.text;
  const args = message.split(' ');
  const id = args[1];
  const amount = args[2];
  const response = await setBid(id, amount);
  ctx.reply(response, { parse_mode: 'Markdown' });
});

bot.command('market', async (ctx) => {
  const message = ctx.message.text;
  const args = message.split(' ');
  let sortingMethod = args[1];
  let showId = false;
  if (args.length === 2) showId = true;
  const players = await getSortedMarket(sortingMethod);
  let answer = '';
  if (players === undefined)
    answer = 'No se han podido obtener los datos del mercado';
  else answer = formatMarketDataToString(players, showId);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

function formatMarketDataToString(players, showId) {
  let answer = '';
  players.forEach((player) => {
    answer += `*${player.jugador}* ${player.lesionado ? '🏥' : ''}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${formatCurrency(player.cambio)}\n`;
    answer += `Pujas: ${player.pujas}\n`;
    answer += `Precio: ${formatCurrency(player.precio)}\n`;
    answer += `Media: ${player.media}\n`;
    answer += `Forma: ${player.forma}\n`;
    if (showId) {
      answer += `\n\`${player.id}\`\n\n\n`; // Mostrar el ID solo si showId es true
    }
    answer += '\n\n';
  });
  return answer;
}

function formatTeamPlayersDataToString(players, showId) {
  let answer = '';
  players.forEach((player) => {
    answer += `*${player.jugador}* ${player.lesionado ? '🏥' : ''}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${formatCurrency(player.cambio)}\n`;
    answer += `Pujas: ${player.pujas}\n`;
    answer += `Cláusula: ${formatCurrency(player.clausula)}\n`;
    answer += `Media: ${player.media}\n`;
    answer += `Forma: ${player.forma}\n`;
    if (showId) {
      answer += `\n\`${player.id}\`\n\n\n`; // Mostrar el ID solo si showId es true
    }
    answer += '\n\n';
  });
  return answer;
}

bot.command('conexiones', async (ctx) => {
  const lastUserConnections = await getLastAccessInfo();
  const answer = formatLastAccessDataToString(lastUserConnections);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('clausulazo', async (ctx) => {
  const cronExpression = '01 00 00 * * *';
  const timezone = 'Europe/Madrid';
  const nextExecution = await getNextCronExecution(cronExpression, timezone);
  ctx.reply(`Clausulazo programado a las ${nextExecution}`);

  const args = getArgs(ctx);
  const playerId = args[1];
  let answer = '';
  cron.schedule(cronExpression, async () => {
    const beforeClausulazo = dayjs()
      .tz(dayjs.tz.guess())
      .format('DD/MM/YYYY HH:mm:ss');
    answer = await getPlayerDataAndPayClausula(playerId);
    const afterClausulazo = dayjs()
      .tz(dayjs.tz.guess())
      .format('DD/MM/YYYY HH:mm:ss');
    ctx.reply(beforeClausulazo, { parse_mode: 'Markdown' });
    ctx.reply(answer, { parse_mode: 'Markdown' });
    ctx.reply(afterClausulazo, { parse_mode: 'Markdown' });
  });
});
function getArgs(ctx) {
  const message = ctx.message.text;
  return message.split(' ');
}

function formatLastAccessDataToString(data) {
  let answer = '';
  data.forEach((user) => {
    answer += `*${user.nombre}*: ${user.ultimo_acceso}\n`;
  });
  return answer;
}

bot.launch();

console.log('Telegram Bot de Futmondo iniciado');
