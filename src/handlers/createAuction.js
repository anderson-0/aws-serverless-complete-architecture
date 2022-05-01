import {v4 as uuid} from 'uuid'

async function createAuction(event, context) {
  const { title } = JSON.parse(event.body);

  const auction = {
    id: uuid(),
    title,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  return {
    statusCode: 200,
    body: JSON.stringify({ auction }),
  };
}

export const handler = createAuction;


