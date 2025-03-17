declare global {
    import mongodb from 'mongodb'
    import { MongooseUpdateQueryOptions } from 'mongoose'
    type DeepPartial<T> = {
        [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
    };
}

export {}