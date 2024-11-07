import { Telegraf } from 'telegraf';
import { payClausula } from './src/endpoints/pay-clausula.js';
import { getSortedMarket } from './src/features/mejores-mercado.feat.js';
import { getLastAccessInfo } from './src/logic/ultimo-acceso.js';
import { setBid } from './src/logic/puja.js';
import { formatCurrency, sleep } from './src/common/utils.js';
import { getPlayersFromSpecificUser } from './src/logic/get-teams-players.js';

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
  const answer = formatTeamPlayersDataToString(players);
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
  const args = getArgs(ctx);
  let sortingMethod = args[1];
  const players = await getSortedMarket(sortingMethod);
  let answer = '';
  if (players === undefined)
    answer = 'No se han podido obtener los datos del mercado';
  else answer = formatMarketDataToString(players);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

function formatMarketDataToString(players, showId = true) {
  let answer = '';
  players.forEach((player) => {
    answer += `*${player.jugador}* ${player.lesionado ? '🏥' : ''}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${formatCurrency(player.cambio)}\n`;
    answer += `Pujas: ${player.pujas}\n`;
    answer += `Precio: ${formatCurrency(player.precio)}\n`;
    answer += `Media: ${player.media}\n`;
    answer += `Forma: ${player.forma}\n`;
    answer += `\n\`/puja ${player.id}\`\n\n\n`;
  });
  return answer;
}

function formatTeamPlayersDataToString(players) {
  let answer = '';
  players.forEach((player) => {
    answer += `*${player.jugador}* ${player.lesionado ? '🏥' : ''}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${formatCurrency(player.cambio)}\n`;
    answer += `Pujas: ${player.pujas}\n`;
    answer += `Cláusula: ${formatCurrency(player.clausula)}\n`;
    answer += `Media: ${player.media}\n`;
    answer += `Forma: ${player.forma}\n`;
    answer += `\n\`/clausulazo ${player.slug} ${player.clausula} ${player.id} ${player.jugador.replace(/\s+/g, '')}\`\n\n\n`;
  });
  return answer;
}

bot.command('clausulazo', async (ctx) => {
  const args = getArgs(ctx);
  if (args.length !== 5)
    return ctx.reply(
      'Debes especificar los datos necesarios para realizar un clausulazo'
    );
  else {
    const playerSlug = args[1];
    const playerPrice = args[2];
    const playerId = args[3];
    cron.schedule('00 00 * * *', async () => {
      await sleep(1000);
      const response = await payClausula(playerSlug, playerPrice, playerId);
      const currentTime = dayjs().tz('Europe/Madrid').format('HH:mm:ss');

      if (response.answer.error)
        ctx.reply(
          `${currentTime} Clausulazo ${args[4]}: ${response.answer.code}`
        );
      else
        ctx.reply(
          `${currentTime} Clausulazo ${args[4]}: ${JSON.stringify(response.answer)}`,
          {
            parse_mode: 'Markdown',
          }
        );
    });
  }
});

bot.command('conexiones', async (ctx) => {
  const lastUserConnections = await getLastAccessInfo();
  const answer = formatLastAccessDataToString(lastUserConnections);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

cron.schedule('00 00 * * *', async () => {
  const chatId = process.env.CHATID;
  await sleep(1000);
  const currentTime = dayjs().tz('Europe/Madrid').format('HH:mm:ss');
  const message = `La hora actual es: ${currentTime}. Esto podría ser un clausulazo`;
  bot.telegram.sendMessage(chatId, message);
});

cron.schedule('45 06 * * *', async () => {
  const chatId = process.env.CHATID;
  const players = await getSortedMarket('cambio');
  const message = formatMarketDataToString(players);
  bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
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
