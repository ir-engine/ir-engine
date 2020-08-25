export interface ICharacterState {
	 animationLength: any;

	canFindVehiclesToEnter: boolean; // Find a suitable car and run towards it
	canEnterVehicles: boolean; // Actually get into the vehicle
	canLeaveVehicles: boolean;

	update(timeStep: number): void;
	onInputChange(): void;
}