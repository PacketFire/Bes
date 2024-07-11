import { Database } from 'sqlite3';
import settings from '../settings/settings';

const db = new Database(settings.database_path);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY, 
      url TEXT, 
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

export const saveSongMetadata = (url: string) => {
  return new Promise<void>((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO songs (url) VALUES (?)');
    stmt.run(url, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    stmt.finalize();
  });
};

export const getPlaylist = () => {
  return new Promise<{ id: number, url: string }[]>((resolve, reject) => {
    db.all('SELECT * FROM songs ORDER BY timestamp', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
