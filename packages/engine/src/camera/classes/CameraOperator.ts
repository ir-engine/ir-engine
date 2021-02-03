import { Camera, MathUtils, Vector2, Vector3 } from 'three';
import { Engine } from '../../ecs/classes/Engine';

export class CameraOperator
{
	public target: Vector3;
	public sensitivity: Vector2;
	public radius = 1;
	public theta: number;
	public phi: number;
	public onMouseDownPosition: Vector2;
	public onMouseDownTheta: any;
	public onMouseDownPhi: any;
	public targetRadius = 1;

	public movementSpeed: number;

	public upVelocity = 0;
	public forwardVelocity = 0;
	public rightVelocity = 0;

	public followMode = false;
	constructor(camera: Camera, sensitivityX = 1, sensitivityY: number = sensitivityX * 0.8)
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

	public setRadius(value: number, instantly = false): void
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
			const newPos = this.target.clone().add(new Vector3().subVectors(Engine.camera.position, this.target).normalize().multiplyScalar(this.targetRadius));
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

}