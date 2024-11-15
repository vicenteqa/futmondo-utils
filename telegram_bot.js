import { Telegraf } from 'telegraf';
import { payClausula } from './src/endpoints/pay-clausula.js';
import { getSortedMarket } from './src/features/mejores-mercado.feat.js';
import { getBestMarket } from './src/features/mejores-mercado.feat.js';
import { getLastAccessInfo } from './src/logic/ultimo-acceso.js';
import { setBid } from './src/logic/puja.js';
import { formatCurrency, sleep } from './src/common/utils.js';
import { getPlayersFromSpecificUser } from './src/logic/get-teams-players.js';
import dayjs from 'dayjs';
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

bot.command('wanted', async (ctx) => {
  const args = getArgs(ctx);
  let sortingMethod = args[1];
  const players = await getBestMarket(sortingMethod);
  let answer = '';
  if (players === undefined)
    answer = 'No se han podido obtener los datos del mercado';
  else answer = formatMarketDataToString(players);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

console.log(process.env.CHAT_ID);
cron.schedule('30 3 * * *', async () => {
  const chatId = process.env.CHAT_ID;
  const players = await getBestMarket('cambio');
  if (players.length === 0) return;
  else {
    for (let i = 0; i < players.length; i++) {
      if (
        players[i].team !== 'Betis' &&
        players[i].propietario === 'Computer'
      ) {
        const bidResult = await setBid(players[i].id);
        bot.telegram.sendMessage(chatId, bidResult, { parse_mode: 'Markdown' });
      }
    }
  }
});

function formatMarketDataToString(players) {
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

cron.schedule('09 8 * * *', async () => {
  const currentTime = dayjs().tz('Europe/Madrid').format('HH:mm:ss');

  await sleep(500);
  const RuiSilva = payClausula(
    '55067163',
    '22252110',
    '520355fc634ddea00b000025'
  );
  const VitorRoque = payClausula(
    '2000095783',
    '47210229',
    '6593d8f92ea4e76ff9ce4d44'
  );

  const Bartra = payClausula(
    '67063004',
    '35725060',
    '522f8e353ce1ab673f00000b'
  );

  await Promise.all([RuiSilva, VitorRoque, Bartra]).then((values) => {
    for (let i = 0; i < values.length; i++) {
      const response = values[i];
      if (response.answer.error) {
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          `${currentTime} Clausulazo: ${response.answer.code}`
        );
      } else {
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          `${currentTime} Clausulazo: ${JSON.stringify(response.answer)}`,
          { parse_mode: 'Markdown' }
        );
      }
    }
  });
});

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
    cron.schedule('0 0 * * 1', async () => {
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

bot.command('clausulazoya', async (ctx) => {
  const args = getArgs(ctx);
  if (args.length !== 5)
    return ctx.reply(
      'Debes especificar los datos necesarios para realizar un clausulazo'
    );
  else {
    const playerSlug = args[1];
    const playerPrice = args[2];
    const playerId = args[3];
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
  }
});

bot.command('conexiones', async (ctx) => {
  const lastUserConnections = await getLastAccessInfo();
  const answer = formatLastAccessDataToString(lastUserConnections);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

cron.schedule('45 06 * * *', async () => {
  const chatId = process.env.CHAT_ID;
  const players = await getBestMarket('cambio');
  const betisPlayers = players.filter((player) =>
    player.equipo.includes('Betis')
  );
  if (betisPlayers.length === 0) return;
  else {
    const message = formatMarketDataToString(players);
    bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }
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
