import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import createError from 'http-errors';

import { getAuctionById } from './getAuction';
import { setAuctionPictureUrl } from '../../lib/setAuctionPictureUrl';
import { uploadPictureToS3 } from '../../lib/uploadPictureToS3';

import uploadAuctionSchema from '../../lib/schemas/uploadAuctionSchema';

export async function uploadAuctionPicture(event, context) {

  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  if (auction.seller !== email) {
    throw new createError.Forbidden("Only the auction's seller can upload a picture.");
  }
  const imageAsStringBase64 = event.body.replace(/^data:image\/\w+;base64,/, ''); // remove data:image/png;base64,
  const imageAsBuffer = Buffer.from(imageAsStringBase64, 'base64');

  let updatedAuction;
  try {
    const s3ImageUrl = await uploadPictureToS3(`${auction.id}.jpg`, imageAsBuffer);
    auction.pictureUrl = s3ImageUrl;

    updatedAuction = await setAuctionPictureUrl(auction.id, auction.pictureUrl);
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = middy(uploadAuctionPicture)
  .use(httpErrorHandler())
  .use(validator({
    inputSchema: uploadAuctionSchema,
    ajvOptions: {
      strict: false,
    }
  }));