const { DynamoDB } = require("aws-sdk");
const bcrypt = require("bcryptjs");

const compare = (password, hash) =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function(err, res) {
      if (err) reject(err);
      else resolve(res);
    });
  });

exports.handler = async function(event) {
  try {
    const request = JSON.parse(event.body);
    const db = new DynamoDB.DocumentClient();
    const user = await db
      .get({
        TableName: process.env.USERS_TABLE_NAME,
        Key: { email: request.email }
      })
      .promise();
    const isAuth = await compare(request.password, user.password);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isAuth)
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
