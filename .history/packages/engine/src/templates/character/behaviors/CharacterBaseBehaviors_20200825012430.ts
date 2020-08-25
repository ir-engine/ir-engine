export const initializeCharacterState: Behavior = (entity: Entity) => {
	const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	character.velocitySimulator.damping = character.defaultVelocitySimulatorDamping;
	character.velocitySimulator.mass = character.defaultVelocitySimulatorMass;

	character.rotationSimulator.damping = character.defaultRotationSimulatorDamping;
	character.rotationSimulator.mass = character.defaultRotationSimulatorMass;

	character.canFindVehiclesToEnter = true;
	character.canEnterVehicles = false;
	character.canLeaveVehicles = true;
  

	character.arcadeVelocityIsAdditive = false;
	setArcadeVelocityInfluence(entity, { x: 1, y: 0, z: 1 });
};

export const updateCharacterState: Behavior = (entity, args = null, deltaTime: number): void => {
	const state = getMutableComponent<State>(entity, State as any);

	state.timer += deltaTime;
};
