import type { Principal } from '@dfinity/principal';
export interface Post {
  'id' : bigint,
  'text' : string,
  'user_id' : string,
  'timestamp' : bigint,
}
export interface _SERVICE {
  'wall' : (arg_0: string) => Promise<Array<Post>>,
  'write' : (arg_0: string) => Promise<undefined>,
}
