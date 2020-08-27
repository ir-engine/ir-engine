
import {
	Vector3,
	Vector4
} from "three";


/**************************************************************
 *	NURBS Utils
 **************************************************************/

export namespace NURBSUtils {

	/*
	Finds knot vector span.
	p : degree
	u : parametric value
	U : knot vector
	returns the span
	*/
  export function findSpan(p: number, u: number, U: number[]): number {

		let n = U.length - p - 1;

		if ( u >= U[ n ] ) {

			return n - 1;

		}

		if ( u <= U[ p ] ) {

			return p;

		}

		let low = p;
		let high = n;
		let mid = Math.floor( ( low + high ) / 2 );

		while ( u < U[ mid ] || u >= U[ mid + 1 ] ) {

			if ( u < U[ mid ] ) {

				high = mid;

			} else {

				low = mid;

			}

			mid = Math.floor( ( low + high ) / 2 );

		}

		return mid;

	}


	/*
	Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2
	span : span in which u lies
	u    : parametric point
	p    : degree
	U    : knot vector
	returns array[p+1] with basis functions values.
	*/
  export function calcBasisFunctions(span: number, u: number, p: number, U: number[]): number[]{
		let N = [];
		let left = [];
		let right = [];
		N[ 0 ] = 1.0;

		for ( let j = 1; j <= p; ++ j ) {

			left[ j ] = u - U[ span + 1 - j ];
			right[ j ] = U[ span + j ] - u;

			let saved = 0.0;

			for ( let r = 0; r < j; ++ r ) {

				let rv = right[ r + 1 ];
				let lv = left[ j - r ];
				let temp = N[ r ] / ( rv + lv );
				N[ r ] = saved + rv * temp;
				saved = lv * temp;

			 }

			 N[ j ] = saved;

		 }

		 return N;

	}


	/*
	Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.
	p : degree of B-Spline
	U : knot vector
	P : control points (x, y, z, w)
	u : parametric point
	returns point for given u
	*/
  export function calcBSplinePoint(p: number, U: number[], P: Vector4[], u: number): Vector4 {
		let span = findSpan( p, u, U );
		let N = calcBasisFunctions( span, u, p, U );
		let C = new Vector4( 0, 0, 0, 0 );

		for ( let j = 0; j <= p; ++ j ) {

			let point = P[ span - p + j ];
			let Nj = N[ j ];
			let wNj = point.w * Nj;
			C.x += point.x * wNj;
			C.y += point.y * wNj;
			C.z += point.z * wNj;
			C.w += point.w * Nj;

		}

		return C;

	}


	/*
	Calculate basis functions derivatives. See The NURBS Book, page 72, algorithm A2.3.
	span : span in which u lies
	u    : parametric point
	p    : degree
	n    : number of derivatives to calculate
	U    : knot vector
	returns array[n+1][p+1] with basis functions derivatives
	*/
  export function calcBasisFunctionDerivatives(span: number,u: number, p: number, n: number, U: number[]): number[][] {

		let zeroArr = [];
		for ( let i = 0; i <= p; ++ i )
			zeroArr[ i ] = 0.0;

		let ders = [];
		for ( let i = 0; i <= n; ++ i )
			ders[ i ] = zeroArr.slice( 0 );

		let ndu = [];
		for ( let i = 0; i <= p; ++ i )
			ndu[ i ] = zeroArr.slice( 0 );

		ndu[ 0 ][ 0 ] = 1.0;

		let left = zeroArr.slice( 0 );
		let right = zeroArr.slice( 0 );

		for ( let j = 1; j <= p; ++ j ) {

			left[ j ] = u - U[ span + 1 - j ];
			right[ j ] = U[ span + j ] - u;

			let saved = 0.0;

			for ( let r = 0; r < j; ++ r ) {

				let rv = right[ r + 1 ];
				let lv = left[ j - r ];
				ndu[ j ][ r ] = rv + lv;

				let temp = ndu[ r ][ j - 1 ] / ndu[ j ][ r ];
				ndu[ r ][ j ] = saved + rv * temp;
				saved = lv * temp;

			}

			ndu[ j ][ j ] = saved;

		}

		for ( let j = 0; j <= p; ++ j ) {

			ders[ 0 ][ j ] = ndu[ j ][ p ];

		}

		for ( let r = 0; r <= p; ++ r ) {

			let s1 = 0;
			let s2 = 1;

			let a = [];
			for ( let i = 0; i <= p; ++ i ) {

				a[ i ] = zeroArr.slice( 0 );

			}
			a[ 0 ][ 0 ] = 1.0;

			for ( let k = 1; k <= n; ++ k ) {

				let d = 0.0;
				let rk = r - k;
				let pk = p - k;

				if ( r >= k ) {

					a[ s2 ][ 0 ] = a[ s1 ][ 0 ] / ndu[ pk + 1 ][ rk ];
					d = a[ s2 ][ 0 ] * ndu[ rk ][ pk ];

				}

				let j1 = ( rk >= - 1 ) ? 1 : - rk;
				let j2 = ( r - 1 <= pk ) ? k - 1 : p - r;

				for ( let j = j1; j <= j2; ++ j ) {

					a[ s2 ][ j ] = ( a[ s1 ][ j ] - a[ s1 ][ j - 1 ] ) / ndu[ pk + 1 ][ rk + j ];
					d += a[ s2 ][ j ] * ndu[ rk + j ][ pk ];

				}

				if ( r <= pk ) {

					a[ s2 ][ k ] = - a[ s1 ][ k - 1 ] / ndu[ pk + 1 ][ r ];
					d += a[ s2 ][ k ] * ndu[ r ][ pk ];

				}

				ders[ k ][ r ] = d;

				let j = s1;
				s1 = s2;
				s2 = j;

			}

		}

		let r = p;

		for ( let k = 1; k <= n; ++ k ) {

			for ( let j = 0; j <= p; ++ j ) {

				ders[ k ][ j ] *= r;

			}
			r *= p - k;

		}

		return ders;

	}


	/*
		Calculate derivatives of a B-Spline. See The NURBS Book, page 93, algorithm A3.2.
		p  : degree
		U  : knot vector
		P  : control points
		u  : Parametric points
		nd : number of derivatives
		returns array[d+1] with derivatives
		*/
    export function calcBSplineDerivatives(p: number, U: number[], P: Vector4[], u: number, nd: number): Vector4[] {
		let du = nd < p ? nd : p;
		let CK = [];
		let span = findSpan( p, u, U );
		let nders = calcBasisFunctionDerivatives( span, u, p, du, U );
		let Pw = [];

		for ( let i = 0; i < P.length; ++ i ) {

			let point = P[ i ].clone();
			let w = point.w;

			point.x *= w;
			point.y *= w;
			point.z *= w;

			Pw[ i ] = point;

		}
		for ( let k = 0; k <= du; ++ k ) {

			let point = Pw[ span - p ].clone().multiplyScalar( nders[ k ][ 0 ] );

			for ( let j = 1; j <= p; ++ j ) {

				point.add( Pw[ span - p + j ].clone().multiplyScalar( nders[ k ][ j ] ) );

			}

			CK[ k ] = point;

		}

		for ( let k = du + 1; k <= nd + 1; ++ k ) {

			CK[ k ] = new Vector4( 0, 0, 0 );

		}

		return CK;

	}


	/*
	Calculate "K over I"
	returns k!/(i!(k-i)!)
	*/
  export function calcKoverI(k: number, i: number): number {
		let nom = 1;

		for ( let j = 2; j <= k; ++ j ) {

			nom *= j;

		}

		let denom = 1;

		for ( let j = 2; j <= i; ++ j ) {

			denom *= j;

		}

		for ( let j = 2; j <= k - i; ++ j ) {

			denom *= j;

		}

		return nom / denom;

	}


	/*
	Calculate derivatives (0-nd) of rational curve. See The NURBS Book, page 127, algorithm A4.2.
	Pders : result of function calcBSplineDerivatives
	returns array with derivatives for rational curve.
	*/
  export function calcRationalCurveDerivatives(Pders: Vector4[]): Vector3[] {
		let nd = Pders.length;
		let Aders = [];
		let wders = [];

		for ( let i = 0; i < nd; ++ i ) {

			let point = Pders[ i ];
			Aders[ i ] = new Vector3( point.x, point.y, point.z );
			wders[ i ] = point.w;

		}

		let CK = [];

		for ( let k = 0; k < nd; ++ k ) {

			let v = Aders[ k ].clone();

			for ( let i = 1; i <= k; ++ i ) {

				v.sub( CK[ k - i ].clone().multiplyScalar( calcKoverI( k, i ) * wders[ i ] ) );

			}

			CK[ k ] = v.divideScalar( wders[ 0 ] );

		}

		return CK;

	}


	/*
	Calculate NURBS curve derivatives. See The NURBS Book, page 127, algorithm A4.2.
	p  : degree
	U  : knot vector
	P  : control points in homogeneous space
	u  : parametric points
	nd : number of derivatives
	returns array with derivatives.
	*/
  export function calcNURBSDerivatives(p: number, U: number[], P: Vector4[], u: number, nd: number): Vector3[]{
		let Pders = calcBSplineDerivatives( p, U, P, u, nd );
		return calcRationalCurveDerivatives( Pders );

	}


	/*
	Calculate rational B-Spline surface point. See The NURBS Book, page 134, algorithm A4.3.
	p1, p2 : degrees of B-Spline surface
	U1, U2 : knot vectors
	P      : control points (x, y, z, w)
	u, v   : parametric values
	returns point for given (u, v)
	*/
  export function calcSurfacePoint(p: number, q: number, U: number[], V: number[], P: Vector4[], u: number, v: number, target: Vector3) {
		let uspan = findSpan( p, u, U );
		let vspan = findSpan( q, v, V );
		let Nu = calcBasisFunctions( uspan, u, p, U );
		let Nv = calcBasisFunctions( vspan, v, q, V );
		let temp = [];

		for ( let l = 0; l <= q; ++ l ) {

			temp[ l ] = new Vector4( 0, 0, 0, 0 );
			for ( let k = 0; k <= p; ++ k ) {

				let point = P[ uspan - p + k ][ vspan - q + l ].clone();
				let w = point.w;
				point.x *= w;
				point.y *= w;
				point.z *= w;
				temp[ l ].add( point.multiplyScalar( Nu[ k ] ) );

			}

		}

		let Sw = new Vector4( 0, 0, 0, 0 );
		for ( let l = 0; l <= q; ++ l ) {

			Sw.add( temp[ l ].multiplyScalar( Nv[ l ] ) );

		}

		Sw.divideScalar( Sw.w );
		target.set( Sw.x, Sw.y, Sw.z );

	}

};
