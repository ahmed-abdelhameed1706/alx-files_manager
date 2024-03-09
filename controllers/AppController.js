import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export const getStatus = (req, res) => {
  const status = {
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  };
  res.status(200).send(status);
};

export const getStats = async (req, res) => {
  const stats = {
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  };
  res.status(200).send(stats);
};
