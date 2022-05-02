import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';

import commonMiddleware from '../../lib/commonMiddleware';
import getAuctionsSchema from '../../lib/schemas/getAuctionsSchema';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {

  const { status } = event.queryStringParameters;

  let auctions;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDateIndex',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status,
    },
    ExpressionAttributeNames: {
      '#status': 'status', // status is a reserved word in DynamoDB. We need to use #status to refer to it.
    },
  };

  try {
    const result = await dynamoDb.query(params).promise();

    auctions = result.Items;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ auctions }),
  };
}

export const handler = commonMiddleware(getAuctions)
  .use(validator({
    inputSchema: getAuctionsSchema,
    ajvOptions: {
      useDefaults: true, // use default values for missing fields
      strict: false,
    }
  }));