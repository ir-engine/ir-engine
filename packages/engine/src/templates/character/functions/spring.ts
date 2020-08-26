import { SimulationFrame } from '../../../physics/components/SimulationFrame';

export function spring(source: number, dest: number, velocity: number, mass: number, damping: number): SimulationFrame {
	let acceleration = dest - source;
	acceleration /= mass;
	velocity += acceleration;
	velocity *= damping;

	let position = source + velocity;

	return new SimulationFrame(position, velocity);
}
