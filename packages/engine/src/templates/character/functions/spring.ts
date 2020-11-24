import { SimulationFrame } from '../../../physics/classes/SimulationFrame';

export function spring(source: number, dest: number, velocity: number, mass: number, damping: number): SimulationFrame {
	let acceleration = dest - source;
	acceleration /= mass;
	velocity += acceleration;
	velocity *= damping;

	const position = source + velocity;

	return new SimulationFrame(position, velocity);
}
