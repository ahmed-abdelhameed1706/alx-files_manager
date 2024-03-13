import { ObjectId } from 'mongodb';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export const postUpload = async (req, res) => {
  const token = req.header('X-Token');
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const user = await dbClient.users.findOne({ _id: ObjectId(userId) });

  if (!user) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const {
    name, type, parentId, isPublic, data,
  } = req.body;

  if (!name) {
    return res.status(400).send({ error: 'Missing name' });
  }

  if (!type || (type !== 'folder' && type !== 'file' && type !== 'image')) {
    return res.status(400).send({ error: 'Missing type' });
  }

  if (type !== 'folder' && !data) {
    return res.status(400).send({ error: 'Missing data' });
  }

  if (parentId) {
    const parent = await dbClient.files.findOne({ _id: ObjectId(parentId) });
    if (!parent) {
      return res.status(400).send({ error: 'Parent not found' });
    }

    if (parent.type !== 'folder') {
      return res.status(400).send({ error: 'Parent is not a folder' });
    }
  }
  if (type === 'folder') {
    const newFolder = await dbClient.files.insertOne({
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId || 0,
    });
    return res.status(201).send({
      id: newFolder.insertedId,
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId || 0,
    });
  }
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const filePath = path.join(folderPath, `${uuidv4()}`);
  const fileData = Buffer.from(data, 'base64');
  fs.writeFileSync(filePath, fileData);
  const newFile = await dbClient.files.insertOne({
    userId: ObjectId(userId),
    name,
    type,
    isPublic,
    parentId: parentId || 0,
    localPath: filePath,
  });
  return res.status(201).send({
    id: newFile.insertedId,
    userId: ObjectId(userId),
    name,
    type,
    isPublic,
    parentId: parentId || 0,
  });
};

export const getShow = async (req, res) => {
  const token = req.header('X-Token');
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const user = await dbClient.users.findOne({ _id: ObjectId(userId) });
  if (!user) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const fileId = req.params.id;

  const file = await dbClient.files.findOne({ _id: ObjectId(fileId) });

  if (!file) {
    return res.status(404).send({ error: 'Not found' });
  }

  if (file.userId.toString() !== userId) {
    return res.status(404).send({ error: 'Not found' });
  }

  return res.status(200).send({
    id: file._id,
    userId: file.userId,
    name: file.name,
    type: file.type,
    isPublic: file.isPublic,
    parentId: file.parentId,
  });
};

export const getIndex = async (req, res) => {
  const token = req.header('X-Token');
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const user = await dbClient.users.findOne({ _id: ObjectId(userId) });
  if (!user) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const parentId = req.query.parentId || 0;
  const files = await dbClient.files
    .aggregate([
      { $match: { userId: ObjectId(userId), parentId: ObjectId(parentId) } },
      { $limit: 20 },
    ])
    .toArray();
  return res.status(200).send(files);
};
// curl -XGET 0.0.0.0:5000/files -H "X-Token: 25c94fb2-81e7-44ae-8e20-fe2eae0c5fe2" ; echo ""
