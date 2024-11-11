import { DateTime } from 'luxon';
import * as os from 'os';

export const sleep = async (ms: number): Promise<number> => {
  const startMs = DateTime.utc().toMillis();
  await new Promise(resolve => setTimeout(resolve, ms));
  return DateTime.utc().toMillis() - startMs;
};

export const getOSFamily = (): 'Windows' | 'Unix' =>
  os.platform() === 'win32' ? 'Windows' : 'Unix';
