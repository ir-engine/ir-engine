import { Component } from '../../ecs/classes/Component';
import XRTrackingReference from './XRTrackingReferences';

/**
 * 
 * @author Avaer Kazmer
 */
class XRPose extends Component<XRPose>{
	// Tracking references
	head: any;
	leftHand: any;
	rightHand: any;
	floorHeight: number;

	referencePlayerHeightHmd: number;
	referencePlayerWidthWrist: number;
	playerHeightHmd: number;
	playerWidthWrist: number;
}

export default XRPose;
