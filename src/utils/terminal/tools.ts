import { oraPromise } from "ora"

export const promiseWithSpinner = async <T>(promise: () => Promise<T>, text: string, successText: string): Promise<T> => {
  return oraPromise(promise, { 
    color: 'yellow',
    text,
    successText,
    spinner: 'dots',
    isEnabled: true,
    discardStdin: true
  })
}