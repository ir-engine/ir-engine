import { CharacterAvatars } from "../CharacterAvatars";

export function getPseudoRandomAvatarIdByUserId(userId : string): string {
    let pseudoRand = null;
   for (let i = 0; i < userId.length; i++) {
     pseudoRand += userId.charCodeAt(i);
   }
   return CharacterAvatars[pseudoRand%CharacterAvatars.length].id;
}