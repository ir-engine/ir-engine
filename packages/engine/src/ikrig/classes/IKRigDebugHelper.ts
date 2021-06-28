import { Group } from "three";
import { Component } from "../../ecs/classes/Component";
import IKRigLinesComponent from "../components/IKRigLinesComponent";
import IKRigPointsComponent from "../components/IKRigPointsComponent";

class IKRigDebugHelper extends Component<IKRigDebugHelper> {
  points: IKRigPointsComponent;
  lines: IKRigLinesComponent;
  container = new Group()

  constructor() {
    super()
  }

  reset() {
    this.points.reset();
    this.lines.reset();
    return this;
  }

  setPoint(p, hex: any = 0xff0000, shape = null, size = null) { 
    this.points.add(p, hex, shape, size); return this; 
  }
  setLine(p0, p1, hex_0: any = 0xff0000, hex_1 = null, is_dash = false) { 
    this.lines.add(p0, p1, hex_0, hex_1, is_dash); return this; 
  }
}

export default IKRigDebugHelper;
