import type { NextApiRequest, NextApiResponse } from 'next';

declare module 'next' {
  interface NextApiRequest {
    method: string;
    headers: Record<string, string | string[] | undefined>;
    cookies: Partial<{
      [key: string]: string;
    }>;
    body: any;
  }

  interface NextApiResponse<T = any> {
    status(code: number): NextApiResponse<T>;
    json(data: T): void;
    setHeader(name: string, value: string | string[]): void;
  }
}

export type { NextApiRequest, NextApiResponse };

declare module '@stripe/stripe-js';
declare module '@stripe/react-stripe-js';