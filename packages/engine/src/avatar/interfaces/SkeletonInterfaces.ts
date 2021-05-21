export interface ShortOptions {
	names?: any;
	hip?: string;
}

export interface RetargetOptions {
	useFirstFramePosition?: boolean;
	fps?: number;
	names?: any;
	hip?: string;
}

export interface Options {
	preserveMatrix?: boolean;
	preservePosition?: boolean;
	preserveHipPosition?: boolean;
	useTargetMatrix?: boolean;
	hip?: string;
	names?: any;
	offsets?: any;
}
