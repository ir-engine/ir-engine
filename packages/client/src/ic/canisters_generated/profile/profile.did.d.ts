import type { Principal } from '@dfinity/principal';
export interface Profile {
  'name' : string,
  'description' : string,
  'address' : string,
}
export interface _SERVICE {
  'getOwnPrincipal' : () => Promise<Principal>,
  'getOwnProfile' : () => Promise<Profile>,
  'getPrincipalByEth' : (arg_0: string) => Promise<[] | [Principal]>,
  'getProfileByEth' : (arg_0: string) => Promise<[] | [Profile]>,
  'getProfileByName' : (arg_0: string) => Promise<[] | [Profile]>,
  'getProfileByPrincipal' : (arg_0: Principal) => Promise<[] | [Profile]>,
  'linkAddress' : (arg_0: string, arg_1: string) => Promise<Profile>,
  'list' : () => Promise<Array<Profile>>,
  'search' : (arg_0: string) => Promise<[] | [Profile]>,
  'setDescription' : (arg_0: string) => Promise<Profile>,
  'setName' : (arg_0: string) => Promise<Profile>,
}
