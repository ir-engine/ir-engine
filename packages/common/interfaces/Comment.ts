
import {CreatorShort} from './Creator'

export interface CommentInterface {
  id: string;
  creator : CreatorShort,
  text : string,
  fires: number,    
  isFired?: boolean,
}
