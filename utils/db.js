import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.db = client.db(database);
        this.users = this.db.collection('users');
        this.files = this.db.collection('files');
      } else {
        this.db = null;
      }
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    const userCount = await this.users.countDocuments();
    return userCount;
  }

  async nbFiles() {
    const fileCount = await this.files.countDocuments();
    return fileCount;
  }
}

const dbClient = new DBClient();

export default dbClient;
