declare module 'qrcode-styling' {
    export default class QRCodeStyling {
      constructor(options: QRCodeStylingOptions);
  
      append(container: HTMLElement): void;
      getRawData(type?: string): Promise<Blob>;
      update(options: Partial<QRCodeStylingOptions>): void;
    }
  
    export interface QRCodeStylingOptions {
      width?: number;
      height?: number;
      type?: 'svg' | 'canvas';
      data?: string;
      image?: string;
      dotsOptions?: {
        color?: string;
        type?: 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
      };
      backgroundOptions?: {
        color?: string;
      };
      imageOptions?: {
        crossOrigin?: 'anonymous' | 'use-credentials';
        margin?: number;
      };
    }
  }
  