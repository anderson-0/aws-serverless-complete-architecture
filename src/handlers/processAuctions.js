import createError from 'http-errors';

import { getEndedAuctions } from '../../lib/getEndedAuctions';
import { closeAuction } from '../../lib/closeAuction';

async function processAuctions(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();
    const promises = auctionsToClose.map(auction => closeAuction(auction));
    await Promise.all(promises);

    console.log(auctionsToClose);

    return {
      closed: auctionsToClose.length,
    };
  } catch (error) {
    console.error(error);
    throw createError.InternalServerError(error);
  }
}

export const handler = processAuctions;