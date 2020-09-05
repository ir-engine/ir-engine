import { Vector3 } from 'three';

export function springV(source: Vector3, dest: Vector3, velocity: Vector3, mass: number, damping: number): void {
	const acceleration = new Vector3().subVectors(dest, source);
	acceleration.divideScalar(mass);
	velocity.add(acceleration);
	velocity.multiplyScalar(damping);
	source.add(velocity);
}
