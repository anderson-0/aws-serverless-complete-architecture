import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
export async function closeAuction(auction) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: {
      id: auction.id,
    },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    }
  };

  await dynamoDb.update(params).promise();
  const { title, seller, highestBid} = auction;
  const { amount, bidder } = highestBid;

  if (amount === 0) {
    await sqs.sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: `No bid received for ${title}`,
        recipient: seller,
        body: `Your item ${title} had no bids for the past hour. Better luck next time!`,
      }),
  }).promise();
  } else {
    const notifySeller = sqs.sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: `Your item ${title} has been sold!`,
        recipient: seller,
        body: `Congratulations! Your item ${title} has been sold for ${amount} to ${bidder}!`,
      }),
    }).promise();

    const notifyBidder = sqs.sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: `You won an item ${title}!`,
        recipient: bidder,
        body: `Congratulations! You won an item ${title} from ${seller} for ${amount}!`,
      }),
    }).promise();

    return Promise.all([notifySeller, notifyBidder]);
  }
}