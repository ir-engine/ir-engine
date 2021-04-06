import ThreeMeshUI, { Block, Keyboard } from "../../assets/three-mesh-ui";
import { Group, Object3D, Color } from "three";

class SceneButton extends Object3D {
	constructor(title, index) {
		super();	
		this.init(title, index);
	  }
	
	  init(title, index){
		let pos = [0, 0, 0];
		
		switch ( index ) {
			case 0:
				pos = [-0.5, 1.85, 0];
				break;
			case 1:
				pos = [-0.05, 1.85, 0];
				break;
			case 2:
				pos = [1, 2, 0];
				break;
		}
	
		const textBlock = new ThreeMeshUI.Block({
		  height: 0.1,
		  width: 0.4,
		  margin: 0,
		  padding: 0.03,
		  fontSize: 0.025,
		  alignContent: "center",
		  backgroundColor: new Color( 'blue' ),
		  backgroundOpacity: 1.0,
	
		  fontFamily:
			"https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json",
		  fontTexture:
			"https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png"
		}).add(
		  new ThreeMeshUI.Text({
			content: title,
			fontSize: 0.05,
			// fontColor: new THREE.Color(0x96ffba)
		  })
		);
	
		textBlock.position.set(pos[0], pos[1], pos[2]);
	
		this.add(textBlock);
	  }
}

export default SceneButton;