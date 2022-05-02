import AWS from 'aws-sdk';
import createError from 'http-errors';

import { getAuctionById } from './getAuction';
import commonMiddleware from '../../lib/commonMiddleware';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placBid(event, context) {

  const { id } = event.pathParameters;
  const { amount } = event.body;

  const auction = await getAuctionById(id);

  if (auction.status !== 'OPEN') {
    throw createError.BadRequest('Auction is not open');
  }

  if (amount <= auction.highestBid.amount) {
    throw new createError.BadRequest(`Bid amount must be greater than ${auction.highestBid.amount}`);
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'SET highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
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

export const handler = commonMiddleware(placBid);