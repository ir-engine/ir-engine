import { Engine } from "@xrengine/engine/src/ecs/classes/Engine";
import { System } from "@xrengine/engine/src/ecs/classes/System";
import { SystemUpdateType } from "@xrengine/engine/src/ecs/functions/SystemUpdateType";

export class RenderSystem extends System {
	updateType = SystemUpdateType.Fixed;

	/**
	 * Execute the camera system for different events of queries.\
	 * Called each frame by default.
	 *
	 * @param delta time since last frame.
	 */
	execute(delta: number): void {
		Engine.renderer.render(Engine.scene, Engine.camera);
	}
}
