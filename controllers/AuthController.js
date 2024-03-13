import { v4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const decrypt64 = (str) => Buffer.from(str, 'base64').toString('utf-8');

export const getConnect = async (req, res) => {
  const encrypted = req.headers.authorization.split(' ')[1];

  if (!encrypted) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const decrypted = decrypt64(encrypted);
  const email = decrypted.split(':')[0];
  const password = decrypted.split(':')[1];

  const user = await dbClient.users.findOne({ email });

  if (!user || user.password !== sha1(password)) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const token = v4();
  const key = `auth_${token}`;
  redisClient.set(key, user._id.toString(), 86400);
  return res.status(200).send({ token });
};

export const getDisconnect = async (req, res) => {
  const token = req.header('X-Token');

  if (!token) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const key = `auth_${token}`;

  const userId = await redisClient.get(key);

  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  await redisClient.del(key);

  return res.status(204).send();
};
