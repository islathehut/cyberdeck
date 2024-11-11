import * as os from 'os';

export const sleep = async (ms: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, ms));
};

export const getOSFamily = (): 'Windows' | 'Unix' =>
  os.platform() === 'win32' ? 'Windows' : 'Unix';
