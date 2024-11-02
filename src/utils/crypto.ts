import * as crypto from 'crypto';

export const generateChecksum = (data: crypto.BinaryLike): string =>
  crypto.createHash('md5').update(data).digest('hex');
