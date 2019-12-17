const { DynamoDB } = require("aws-sdk");

exports.handler = async function(event) {
  try {
    const db = new DynamoDB.DocumentClient();
    const user = await db
      .get({
        TableName: process.env.USERS_TABLE_NAME,
        Key: { id: event.pathParameters.id }
      })
      .promise();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
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
