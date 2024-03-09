import bcrypt from 'bcrypt';
import dbClient from '../utils/db';

const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const postNew = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).send({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).send({ error: 'Missing password' });
  }
  const user = await dbClient.users.findOne({ email });
  if (user) {
    return res.status(400).send({ error: 'Already exist' });
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await dbClient.users.insertOne({ email, hashedPassword });
  const newUserData = {
    id: newUser.insertedId,
    email,
  };
  return res.status(201).send(newUserData);
};

export const getMe = async () => {};
