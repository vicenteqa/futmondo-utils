import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { getChampionshipInfo } from './src/endpoints/get-championship-info.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function getLastAccessInfo() {
  const info = await getChampionshipInfo();
  const teams = info.answer.teams;

  // Filtrar para excluir a Vicente
  const filteredTeams = teams.filter((team) => team.name !== 'Vicente');

  const result = filteredTeams.map((team) => {
    const lastAccessUTC = team.lastAccess || 'desconocido';
    const lastAccessLocal =
      lastAccessUTC !== 'desconocido'
        ? convertToLocalTime(lastAccessUTC)
        : 'desconocido';
    return {
      nombre: removeLastSurname(team.name),
      ultimo_acceso: lastAccessLocal,
      lastAccessUTC:
        lastAccessUTC !== 'desconocido' ? dayjs(lastAccessUTC) : null,
    };
  });

  // Ordenar por último acceso más reciente
  result.sort((a, b) => {
    if (a.lastAccessUTC && b.lastAccessUTC) {
      return b.lastAccessUTC - a.lastAccessUTC;
    } else if (a.lastAccessUTC) {
      return -1;
    } else if (b.lastAccessUTC) {
      return 1;
    } else {
      return 0;
    }
  });

  // Eliminar el campo lastAccessUTC antes de devolver el resultado
  return result.map(({ lastAccessUTC, ...rest }) => rest);
}

function convertToLocalTime(utcDate) {
  const localDate = dayjs.utc(utcDate).tz('Europe/Madrid'); // Convertir de UTC a UTC+2
  return localDate.format('YYYY-MM-DD HH:mm:ss'); // Formato legible para humanos
}

function removeLastSurname(name) {
  const parts = name.split(' ');
  if (parts.length > 2) {
    parts.pop(); // Eliminar el último apellido
  }
  return parts.join(' ');
}

async function main() {
  const result = await getLastAccessInfo();
  console.log(result);
}

main();
