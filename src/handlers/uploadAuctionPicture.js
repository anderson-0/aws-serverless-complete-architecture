import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

import { uploadPictureToS3 } from '../../lib/uploadPictureToS3';
import { getAuctionById } from './getAuction';

export async function uploadAuctionPicture(event, context) {

  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);
  const imageAsStringBase64 = event.body.replace(/^data:image\/\w+;base64,/, ''); // remove data:image/png;base64,
  const imageAsBuffer = Buffer.from(imageAsStringBase64, 'base64');

  try {
    const uploadToS3Result = await uploadPictureToS3(`${auction.id}.jpg`, imageAsBuffer);
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'uploadAuctionPicture Endpoint Hit',
      input: uploadToS3Result,
    }),
  };
}

export const handler = middy(uploadAuctionPicture)
  .use(httpErrorHandler());