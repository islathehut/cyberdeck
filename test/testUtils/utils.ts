export const sleep = async (timeMs = 1000) => {
  await new Promise<void>(resolve =>
    setTimeout(() => {
      resolve();
    }, timeMs)
  );
};
