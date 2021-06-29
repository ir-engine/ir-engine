
import {CreatorShort} from './Creator'

export interface CommentInterface {
  id: string;
  feedId: string;
  creator : CreatorShort,
  text : string,
  fires: number,    
  isFired?: boolean,
}
