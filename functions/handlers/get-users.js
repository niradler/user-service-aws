const { DynamoDB } = require('aws-sdk');

exports.handler = async function (event) {
  try {

    const db = new DynamoDB.DocumentClient();
   const response = await db.scan({   TableName: process.env.USERS_TABLE_NAME}).promise();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response)
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