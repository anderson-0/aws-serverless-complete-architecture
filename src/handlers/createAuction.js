import {v4 as uuid} from 'uuid';
import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;

  const auction = {
    id: uuid(),
    title,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  await dynamoDb.put({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Item: auction,
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ auction }),
  };
}

export const handler = middy(createAuction)
   .use(httpJsonBodyParser())
   .use(httpEventNormalizer())
   .use(httpErrorHandler());


