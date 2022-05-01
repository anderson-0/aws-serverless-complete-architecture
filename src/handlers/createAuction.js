import {v4 as uuid} from 'uuid';
import AWS from 'aws-sdk';
import createError from 'http-errors';

import commonMiddleware from '../../lib/commonMiddleware';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;

  const auction = {
    id: uuid(),
    title,
    status: 'open',
    createdAt: new Date().toISOString(),
    highestBid: {
      amount: 0,
    }
  };

  try {
    await dynamoDb.put({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction,
  }).promise();
  } catch (error) {
    console.log(error);
    return createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ auction }),
  };
}

export const handler = commonMiddleware(createAuction);