import { Pool } from 'mysql2/promise';

declare module './db' {
  const pool: Pool;
  export default pool;
}
