import * as crypto from 'crypto'

export const generateChecksum = (data: any) => {
  return crypto
      .createHash('md5')
      .update(data)
      .digest('hex');
}