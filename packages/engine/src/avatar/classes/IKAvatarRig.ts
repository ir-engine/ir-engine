import { Avatar, AvatarOptions } from './AvatarRig';

/**
 * 
 * @author Avaer Kazmer
 */
export class IKAvatarRig extends Avatar {
  constructor(object, options: AvatarOptions = { top: true, bottom: true, visemes: true, hair: true, fingers: true} )
  {
    super(object, options);
  }
}
