declare module 'ansi-art' {
  export function get(options: GetOptions): string;

  export interface GetOptions {
    artName?: string;
    filePath?: string;
    speechText?: string;
    speechBubbleOptions?: ChatBubbleOptions;
  }

  export interface ChatBubbleOptions {
    boxWidth?: number;
    boxType?: string;
    spikePosition?: number;
    spikeDirection?: string;
  }
}
