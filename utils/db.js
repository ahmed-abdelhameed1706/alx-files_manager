import { MongoClient } from "mongodb";

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || "localhost";
    this.port = process.env.DB_PORT || 27017;
    this.dbName = process.env.DB_DATABASE || "file_manager";
    this.url = `mongodb://${this.host}:${this.port}`;

    MongoClient.connect(
      this.url,
      { useUnifiedTopology: true },
      (err, client) => {
        if (!err) {
          this.db = client.db(this.dbName);
          this.users = this.db.collection("users");
          this.files = this.db.collection("files");
        } else {
          this.db = null;
        }
      }
    );
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
