import { getLastAccessInfo } from '../logic/ultimo-acceso.js';

const lastAccessInfo = await getLastAccessInfo();
console.log(lastAccessInfo);
