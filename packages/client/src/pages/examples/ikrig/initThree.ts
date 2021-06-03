import { Engine } from "@xrengine/engine/src/ecs/classes/Engine";
import { AmbientLight, DirectionalLight, GridHelper, PerspectiveCamera, Scene, WebGLRenderer } from "three";

export async function initThree() {
	const canvas = document.createElement("canvas");
	document.body.appendChild(canvas); // adds the canvas to the body element



	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Setup Renderer
	let w = window.innerWidth,
		h = window.innerHeight;
	//App.renderer = new WebGLRenderer( { canvas: App.canvas, antialias:true } );
	let ctx = canvas.getContext("webgl2"); //, { alpha: false }
	Engine.renderer = new WebGLRenderer({ canvas: canvas, context: ctx, antialias: true });

	Engine.renderer.setClearColor(0x3a3a3a, 1);
	Engine.renderer.setSize(w, h);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	Engine.scene = new Scene();
	Engine.scene.add(new GridHelper(20, 20, 0x0c610c, 0x444444));

	Engine.camera = new PerspectiveCamera(45, w / h, 0.01, 1000);
	Engine.camera.position.set(0, 1, 5);

	Engine.scene.add(Engine.camera);
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Setup Lighting
	let light = new DirectionalLight(0xffffff, 1.0);
	light.position.set(4, 10, 1);
	Engine.scene.add(light);

	Engine.scene.add(new AmbientLight(0x404040));
}
