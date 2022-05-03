import {v4 as uuid} from 'uuid';
import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';

import commonMiddleware from '../../lib/commonMiddleware';
import createAuctionSchema from '../../lib/schemas/createAuctionSchema';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;

  // Email from person that creates the auction
  // will be extracted from JWT token intercepted by auth-service lambda middleware
  const { email } = event.requestContext.authorizer;

  if (!email) {
    throw new createError.Unauthorized('Email not found in JWT token. Please fix Auth0 scope.');
  }

  const now = new Date();
  const endDate = new Date();

  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
    seller: email,
    pictureUrl: null,
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

export const handler = commonMiddleware(createAuction)
  .use(validator({
    inputSchema: createAuctionSchema,
    ajvOptions: {
      strict: false,
    }
  }));