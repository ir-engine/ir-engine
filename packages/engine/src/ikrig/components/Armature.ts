import { Component } from "../../ecs/classes/Component";
class Armature extends Component<Armature> {
	updated = true;
	skeleton: any = null;
	bones: any[] = [];
	name_map: {} = {};
}

export default Armature;