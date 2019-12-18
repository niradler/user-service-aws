const { DynamoDB } = require("aws-sdk");
const uuidv4 = require("uuid/v4");
const bcrypt = require("bcryptjs");
const PRIMARY_KEY = "id";

const hash = password =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function(err, hash) {
      if (err) reject(err);
      else resolve(hash);
    });
  });

exports.handler = async function(event) {
  try {
    const user = JSON.parse(event.body);
    const db = new DynamoDB.DocumentClient();
    user[PRIMARY_KEY] = uuidv4();
    user.password = await hash(user.password);
    const userSaved = await db
      .put({
        TableName: process.env.USERS_TABLE_NAME,
        Item: {
          ...user
        }
      })
      .promise();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user[PRIMARY_KEY], ...userSaved })
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
