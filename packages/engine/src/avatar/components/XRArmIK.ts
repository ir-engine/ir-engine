import { Component } from '../../ecs/classes/Component';
import { Side } from '../functions/AvatarBodyFunctions';

/**
 * 
 * @author Avaer Kazmer
 */
class XRArmIK extends Component<XRArmIK> {
  arm: any;
  shoulder: any;
  shoulderPoser: any;
  target: any;
  side: Side;
  upperArmLength: number;
  lowerArmLength: number;
  armLength: number;
  
}

export default XRArmIK;
