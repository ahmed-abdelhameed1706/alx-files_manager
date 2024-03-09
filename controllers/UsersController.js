import sha1 from 'sha1';
import dbClient from '../utils/db';

const postNew = async (req, res) => {
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

  const hashedPassword = sha1(password);
  const newUser = await dbClient.users.insertOne({
    email,
    password: hashedPassword,
  });
  const newUserData = {
    id: newUser.insertedId,
    email,
  };
  return res.status(201).send(newUserData);
};

export default postNew;
