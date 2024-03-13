import sha1 from "sha1";
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

export const postNew = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).send({ error: "Missing email" });
  }
  if (!password) {
    return res.status(400).send({ error: "Missing password" });
  }
  const user = await dbClient.users.findOne({ email });
  if (user) {
    return res.status(400).send({ error: "Already exist" });
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

export const getMe = async (req, res) => {
  const token = req.headers["x-token"];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  const key = `auth_${token}`;
  const userId = await redisClient.get(key);

  const user = await dbClient.users.findOne({ _id: userId });

  if (!user) {
    return res.status(401).send("Unauthorized");
  }

  return res.status(200).send({ id: user._id, email: user.email });
};
