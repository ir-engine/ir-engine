
import {CreatorShort} from './Creator'

export interface Comment {
  creator : CreatorShort,
  text : string,
  fires: number,    
  isFired?: boolean,
}
