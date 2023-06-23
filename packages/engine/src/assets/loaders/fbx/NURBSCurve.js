
/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/


import {
	Curve,
	Vector3,
	Vector4
} from 'three';
import * as NURBSUtils from './NURBSUtils.js';

/**
 * NURBS curve object
 *
 * Derives from Curve, overriding getPoint and getTangent.
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 *
 **/

class NURBSCurve extends Curve {

	constructor(
		degree,
		knots /* array of reals */,
		controlPoints /* array of Vector(2|3|4) */,
		startKnot /* index in knots */,
		endKnot /* index in knots */
	) {

		super();

		this.degree = degree;
		this.knots = knots;
		this.controlPoints = [];
		// Used by periodic NURBS to remove hidden spans
		this.startKnot = startKnot || 0;
		this.endKnot = endKnot || ( this.knots.length - 1 );

		for ( let i = 0; i < controlPoints.length; ++ i ) {

			// ensure Vector4 for control points
			const point = controlPoints[ i ];
			this.controlPoints[ i ] = new Vector4( point.x, point.y, point.z, point.w );

		}

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		const u = this.knots[ this.startKnot ] + t * ( this.knots[ this.endKnot ] - this.knots[ this.startKnot ] ); // linear mapping t->u

		// following results in (wx, wy, wz, w) homogeneous point
		const hpoint = NURBSUtils.calcBSplinePoint( this.degree, this.knots, this.controlPoints, u );

		if ( hpoint.w !== 1.0 ) {

			// project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
			hpoint.divideScalar( hpoint.w );

		}

		return point.set( hpoint.x, hpoint.y, hpoint.z );

	}

	getTangent( t, optionalTarget = new Vector3() ) {

		const tangent = optionalTarget;

		const u = this.knots[ 0 ] + t * ( this.knots[ this.knots.length - 1 ] - this.knots[ 0 ] );
		const ders = NURBSUtils.calcNURBSDerivatives( this.degree, this.knots, this.controlPoints, u, 1 );
		tangent.copy( ders[ 1 ] ).normalize();

		return tangent;

	}

}

export { NURBSCurve };