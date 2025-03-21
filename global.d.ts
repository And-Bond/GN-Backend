import type { Hapi } from '@hapi/hapi';
declare global {
    type DeepPartial<T> = {
        [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
    };
}

declare module "@hapi/hapi" {
    interface AuthCredentials {
      token: string;
    }
  
    interface Request extends HapiRequest {
      auth: {
        credentials: AuthCredentials;
      };
    }
  }

export {}