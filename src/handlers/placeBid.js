import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';

import { getAuctionById } from './getAuction';
import placeBidSchema from '../../lib/schemas/placeBidSchema';
import commonMiddleware from '../../lib/commonMiddleware';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placBid(event, context) {

  const { id } = event.pathParameters;
  const { amount } = event.body;

  // Email from bidder will be extracted from the JWT token
  // intercepted by auth-service lambda middleware
  const { email: bidderEmail } = event.requestContext.authorizer;

  if (!email) {
    throw new createError.Unauthorized('Email not found in JWT token. Please fix Auth0 scope.');
  }

  const auction = await getAuctionById(id);

  // Prevents people from bidding on their own auctions
  if (bidderEmail === auction.seller) {
    throw new createError.BadRequest('You cannot bid on your own auction');
  }

  if (auction.status !== 'OPEN') {
    throw createError.BadRequest('Auction is not open');
  }

  if (amount <= auction.highestBid.amount) {
    throw new createError.BadRequest(`Bid amount must be greater than ${auction.highestBid.amount}`);
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'SET highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': bidderEmail,
    },
    ReturnValues: 'ALL_NEW', // Returns the updated item
  };

  let updatedAuction;

  try {
    const result = await dynamoDb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.log(error);
    return createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placBid)
  .use(validator({
    inputSchema: placeBidSchema,
    ajvOptions: {
      strict: false,
    }
  }));