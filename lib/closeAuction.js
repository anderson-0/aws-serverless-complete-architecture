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

  console.log(`Will send message to ${seller} using queue ${process.env.MAIL_QUEUE_URL}`);

  const notifySeller = sqs.sendMessage({
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      subject: `Your item ${title} has been sold!`,
      recipient: seller,
      body: `Congratulations! Your item ${title} has been sold for ${amount} to ${bidder}!`,
    }),
  }).promise();

  console.log(`Will send message to ${bidder} using queue ${process.env.MAIL_QUEUE_URL}`);

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