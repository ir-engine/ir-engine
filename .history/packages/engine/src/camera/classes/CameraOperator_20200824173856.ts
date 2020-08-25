import _ from 'lodash';
import { Vector3, Vector2, Camera, MathUtils } from 'three';
import { Utils } from 'utils/Utils';
import { Engine } from '../../ecs/classes/Engine';

export class CameraOperator
{
	public target: Vector3;
	public sensitivity: Vector2;
	public radius: number = 1;
	public theta: number;
	public phi: number;
	public onMouseDownPosition: Vector2;
	public onMouseDownTheta: any;
	public onMouseDownPhi: any;
	public targetRadius: number = 1;

	public movementSpeed: number;

	public upVelocity: number = 0;
	public forwardVelocity: number = 0;
	public rightVelocity: number = 0;

	public followMode: boolean = false;

	constructor(camera: Camera, sensitivityX: number = 1, sensitivityY: number = sensitivityX * 0.8)
	{
		this.target = new Vector3();
		this.sensitivity = new Vector2(sensitivityX, sensitivityY);

		this.movementSpeed = 0.06;
		this.radius = 3;
		this.theta = 0;
		this.phi = 0;

		this.onMouseDownPosition = new Vector2();
		this.onMouseDownTheta = this.theta;
		this.onMouseDownPhi = this.phi;
	}

	public setSensitivity(sensitivityX: number, sensitivityY: number = sensitivityX): void
	{
		this.sensitivity = new Vector2(sensitivityX, sensitivityY);
	}

	public setRadius(value: number, instantly: boolean = false): void
	{
		this.targetRadius = Math.max(0.001, value);
		if (instantly === true)
		{
			this.radius = value;
		}
	}

	public move(deltaX: number, deltaY: number): void
	{
		this.theta -= deltaX * (this.sensitivity.x / 2);
		this.theta %= 360;
		this.phi += deltaY * (this.sensitivity.y / 2);
		this.phi = Math.min(85, Math.max(-85, this.phi));
	}

	public update(): void
	{
		if (this.followMode === true)
		{
			Engine.camera.position.y = MathUtils.clamp(Engine.camera.position.y, this.target.y, Number.POSITIVE_INFINITY);
			Engine.camera.lookAt(this.target);
			let newPos = this.target.clone().add(new Vector3().subVectors(Engine.camera.position, this.target).normalize().multiplyScalar(this.targetRadius));
			Engine.camera.position.x = newPos.x;
			Engine.camera.position.y = newPos.y;
			Engine.camera.position.z = newPos.z;
		}
		else 
		{
			this.radius = MathUtils.lerp(this.radius, this.targetRadius, 0.1);
	
			Engine.camera.position.x = this.target.x + this.radius * Math.sin(this.theta * Math.PI / 180) * Math.cos(this.phi * Math.PI / 180);
			Engine.camera.position.y = this.target.y + this.radius * Math.sin(this.phi * Math.PI / 180);
			Engine.camera.position.z = this.target.z + this.radius * Math.cos(this.theta * Math.PI / 180) * Math.cos(this.phi * Math.PI / 180);
			Engine.camera.updateMatrix();
			Engine.camera.lookAt(this.target);
		}
	}

	public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void
	{
		// Free camera
		if (code === 'KeyC' && pressed === true && event.shiftKey === true)
		{
			if (this.characterCaller !== undefined)
			{
				this.world.inputManager.setInputReceiver(this.characterCaller);
				this.characterCaller = undefined;
			}
		}
		else
		{
			for (const action in this.actions) {
				if (this.actions.hasOwnProperty(action)) {
					const binding = this.actions[action];
	
					if (_.includes(binding.eventCodes, code))
					{
						binding.isPressed = pressed;
					}
				}
			}
		}
	}

	public handleMouseWheel(event: WheelEvent, value: number): void
	{
		this.world.scrollTheTimeScale(value);
	}

	public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void
	{
		for (const action in this.actions) {
			if (this.actions.hasOwnProperty(action)) {
				const binding = this.actions[action];

				if (_.includes(binding.eventCodes, code))
				{
					binding.isPressed = pressed;
				}
			}
		}
	}

	public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void
	{
		this.move(deltaX, deltaY);
	}

	public inputReceiverInit(): void
	{
		this.target.copy(Engine.camera.position);
		this.setRadius(0, true);
		// this.world.dirLight.target = this.world.camera;

		this.world.updateControls([
			{
				keys: ['W', 'S', 'A', 'D'],
				desc: 'Move around'
			},
			{
				keys: ['E', 'Q'],
				desc: 'Move up / down'
			},
			{
				keys: ['Shift'],
				desc: 'Speed up'
			},
			{
				keys: ['Shift', '+', 'C'],
				desc: 'Exit free camera mode'
			},
		]);
	}

	public inputReceiverUpdate(timeStep: number): void
	{
		// Set fly speed
		let speed = this.movementSpeed * (this.actions.fast.isPressed ? timeStep * 600 : timeStep * 60);

		const up = Utils.getUp(Engine.camera);
		const right = Utils.getRight(Engine.camera);
		const forward = Utils.getBack(Engine.camera);

		this.upVelocity = MathUtils.lerp(this.upVelocity, +this.actions.up.isPressed - +this.actions.down.isPressed, 0.3);
		this.forwardVelocity = MathUtils.lerp(this.forwardVelocity, +this.actions.forward.isPressed - +this.actions.back.isPressed, 0.3);
		this.rightVelocity = MathUtils.lerp(this.rightVelocity, +this.actions.right.isPressed - +this.actions.left.isPressed, 0.3);

		this.world.cameraOperator.target.add(up.multiplyScalar(speed * this.upVelocity));
		this.world.cameraOperator.target.add(forward.multiplyScalar(speed * this.forwardVelocity));
		this.world.cameraOperator.target.add(right.multiplyScalar(speed * this.rightVelocity));
	}
}