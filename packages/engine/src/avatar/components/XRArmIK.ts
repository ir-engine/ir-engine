import { Component } from '../../ecs/classes/Component';
import { Side } from "../enums/Side";

/**
 * 
 * @author Avaer Kazmer
 */
class XRArmIK extends Component<XRArmIK> {
  arm: any;
  shoulder: any;
  target: any;
  side: Side;
  upperArmLength: number;
  lowerArmLength: number;
  armLength: number;
  
}

export default XRArmIK;
