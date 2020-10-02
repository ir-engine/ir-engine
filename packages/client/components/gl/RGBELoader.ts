/**
 * @author Nikos M. / https://github.com/foo123/
 */

import {
	DataTextureLoader,
	FloatType,
	HalfFloatType,
	LinearEncoding,
	LinearFilter,
	NearestFilter,
	RGBEEncoding,
	RGBEFormat,
	RGBFormat,
	UnsignedByteType
} from "three";

// https://github.com/mrdoob/three.js/issues/5552
// http://en.wikipedia.org/wiki/RGBE_image_format

const RGBELoader = function ( manager?: any ) {

	DataTextureLoader.call( this, manager );

	this.type = UnsignedByteType;

};

RGBELoader.prototype = Object.assign( Object.create( DataTextureLoader.prototype ), {

	constructor: RGBELoader,

	// adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html

	parse: function ( buffer ) {

		const
			/* return codes for rgbe routines */
			//RGBE_RETURN_SUCCESS = 0,
			RGBE_RETURN_FAILURE = - 1,

			/* default error routine.  change this to change error handling */
			rgbeReadError = 1,
			rgbeWriteError = 2,
			rgbeFormatError = 3,
			rgbeMemoryError = 4,
			rgbeError = function ( rgbeErrorCode, msg? ): number {

				switch ( rgbeErrorCode ) {

					case rgbeReadError: console.error( "RGBELoader Read Error: " + ( msg || '' ) );
						break;
					case rgbeWriteError: console.error( "RGBELoader Write Error: " + ( msg || '' ) );
						break;
					case rgbeFormatError: console.error( "RGBELoader Bad File Format: " + ( msg || '' ) );
						break;
					default:
					case rgbeMemoryError: console.error( "RGBELoader: Error: " + ( msg || '' ) );

				}
				return RGBE_RETURN_FAILURE;

			},

			/* offsets to red, green, and blue components in a data (float) pixel */
			//RGBE_DATA_RED = 0,
			//RGBE_DATA_GREEN = 1,
			//RGBE_DATA_BLUE = 2,

			/* number of floats per pixel, use 4 since stored in rgba image format */
			//RGBE_DATA_SIZE = 4,

			/* flags indicating which fields in an rgbeHeaderInfo are valid */
			RGBE_VALID_PROGRAMTYPE = 1,
			RGBE_VALID_FORMAT = 2,
			RGBE_VALID_DIMENSIONS = 4,

			NEWLINE = "\n",

			fgets = function ( buffer, lineLimit?, consume? ) {

				lineLimit = ! lineLimit ? 1024 : lineLimit;
				const chunkSize = 128;
				let p = buffer.pos,
					i = - 1, len = 0, s = '',
					chunk = String.fromCharCode.apply( null, new Uint16Array( buffer.subarray( p, p + chunkSize ) ) )
				;
				while ( ( 0 > ( i = chunk.indexOf( NEWLINE ) ) ) && ( len < lineLimit ) && ( p < buffer.byteLength ) ) {

					s += chunk; len += chunk.length;
					p += chunkSize;
					chunk += String.fromCharCode.apply( null, new Uint16Array( buffer.subarray( p, p + chunkSize ) ) );

				}

				if ( - 1 < i ) {

					/*for (i=l-1; i>=0; i--) {
						byteCode = m.charCodeAt(i);
						if (byteCode > 0x7f && byteCode <= 0x7ff) byteLen++;
						else if (byteCode > 0x7ff && byteCode <= 0xffff) byteLen += 2;
						if (byteCode >= 0xDC00 && byteCode <= 0xDFFF) i--; //trail surrogate
					}*/
					if ( false !== consume ) buffer.pos += len + i + 1;
					return s + chunk.slice( 0, i );

				}
				return false;

			},

			/* minimal header reading.  modify if you want to parse more information */
			// eslint-disable-next-line @typescript-eslint/camelcase
			RGBE_ReadHeader = function ( buffer ) {
				let line, match;

				// regexes to parse header info fields
				const magicTokenRe = /^#\?(\S+)$/;
				const gammaRe = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/;
				const exposureRe = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/;
				const formaRe = /^\s*FORMAT=(\S+)\s*$/;
				const dimensionsRe = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/;

				// RGBE format header struct
				const header = {

					valid: 0, /* indicate which fields are valid */

					string: '', /* the actual header string */

					comments: '', /* comments found in header */

					programtype: 'RGBE', /* listed at beginning of file to identify it after "#?". defaults to "RGBE" */

					format: '', /* RGBE format, default 32-bit_rle_rgbe */

					gamma: 1.0, /* image has already been gamma corrected with given gamma. defaults to 1.0 (no correction) */

					exposure: 1.0, /* a value of 1.0 in an image corresponds to <exposure> watts/steradian/m^2. defaults to 1.0 */

					width: 0, height: 0 /* image dimensions, width/height */

				};

				if ( buffer.pos >= buffer.byteLength || ! ( line = fgets( buffer ) ) ) {

					return rgbeError( rgbeReadError, "no header found" );

				}
				/* if you want to require the magic token then uncomment the next line */
				if ( ! ( match = line.match( magicTokenRe ) ) ) {

					return rgbeError( rgbeFormatError, "bad initial token" );

				}
				header.valid |= RGBE_VALID_PROGRAMTYPE;
				header.programtype = match[ 1 ];
				header.string += line + "\n";

				while ( true ) {

					line = fgets( buffer );
					if ( false === line ) break;
					header.string += line + "\n";

					if ( '#' === line.charAt( 0 ) ) {

						header.comments += line + "\n";
						continue; // comment line

					}

					if ( match = line.match( gammaRe ) ) {

						header.gamma = parseFloat( match[ 1 ] );

					}
					if ( match = line.match( exposureRe ) ) {

						header.exposure = parseFloat( match[ 1 ] );

					}
					if ( match = line.match( formaRe ) ) {

						header.valid |= RGBE_VALID_FORMAT;
						header.format = match[ 1 ];//'32-bit_rle_rgbe';

					}
					if ( match = line.match( dimensionsRe ) ) {

						header.valid |= RGBE_VALID_DIMENSIONS;
						header.height = parseInt( match[ 1 ], 10 );
						header.width = parseInt( match[ 2 ], 10 );

					}

					if ( ( header.valid & RGBE_VALID_FORMAT ) && ( header.valid & RGBE_VALID_DIMENSIONS ) ) break;

				}

				if ( ! ( header.valid & RGBE_VALID_FORMAT ) ) {

					return rgbeError( rgbeFormatError, "missing format specifier" );

				}
				if ( ! ( header.valid & RGBE_VALID_DIMENSIONS ) ) {

					return rgbeError( rgbeFormatError, "missing image size specifier" );

				}

				return header;

			},

			// eslint-disable-next-line @typescript-eslint/camelcase
			RGBE_ReadPixels_RLE = function ( buffer, w, h ): any {
				const scanlineWidth = w;
				let offset, pos, count, byteValue,
					ptr, i, l, off, isEncodedRun,
					numScanlines = h
				;

				if (
					// run length encoding is not allowed so read flat
					( ( scanlineWidth < 8 ) || ( scanlineWidth > 0x7fff ) ) ||
					// this file is not run length encoded
					( ( 2 !== buffer[ 0 ] ) || ( 2 !== buffer[ 1 ] ) || ( buffer[ 2 ] & 0x80 ) )
				) {

					// return the flat buffer
					return new Uint8Array( buffer );

				}

				if ( scanlineWidth !== ( ( buffer[ 2 ] << 8 ) | buffer[ 3 ] ) ) {

					return rgbeError( rgbeFormatError, "wrong scanline width" );

				}

				const dataRgba = new Uint8Array( 4 * w * h );

				if ( ! dataRgba || ! dataRgba.length ) {

					return rgbeError( rgbeMemoryError, "unable to allocate buffer space" );

				}

				offset = 0; pos = 0;
				const ptrEnd = 4 * scanlineWidth;
				const rgbeStart = new Uint8Array( 4 );
				const scanlineBuffer = new Uint8Array( ptrEnd );

				// read in each successive scanline
				while ( ( numScanlines > 0 ) && ( pos < buffer.byteLength ) ) {

					if ( pos + 4 > buffer.byteLength ) {

						return rgbeError( rgbeReadError );

					}

					rgbeStart[ 0 ] = buffer[ pos ++ ];
					rgbeStart[ 1 ] = buffer[ pos ++ ];
					rgbeStart[ 2 ] = buffer[ pos ++ ];
					rgbeStart[ 3 ] = buffer[ pos ++ ];

					if ( ( 2 != rgbeStart[ 0 ] ) || ( 2 != rgbeStart[ 1 ] ) || ( ( ( rgbeStart[ 2 ] << 8 ) | rgbeStart[ 3 ] ) != scanlineWidth ) ) {

						return rgbeError( rgbeFormatError, "bad rgbe scanline format" );

					}

					// read each of the four channels for the scanline into the buffer
					// first red, then green, then blue, then exponent
					ptr = 0;
					while ( ( ptr < ptrEnd ) && ( pos < buffer.byteLength ) ) {

						count = buffer[ pos ++ ];
						isEncodedRun = count > 128;
						if ( isEncodedRun ) count -= 128;

						if ( ( 0 === count ) || ( ptr + count > ptrEnd ) ) {

							return rgbeError( rgbeFormatError, "bad scanline data" );

						}

						if ( isEncodedRun ) {

							// a (encoded) run of the same value
							byteValue = buffer[ pos ++ ];
							for ( i = 0; i < count; i ++ ) {

								scanlineBuffer[ ptr ++ ] = byteValue;

							}
							//ptr += count;

						} else {

							// a literal-run
							scanlineBuffer.set( buffer.subarray( pos, pos + count ), ptr );
							ptr += count; pos += count;

						}

					}


					// now convert data from buffer into rgba
					// first red, then green, then blue, then exponent (alpha)
					l = scanlineWidth; //scanlineBuffer.byteLength;
					for ( i = 0; i < l; i ++ ) {

						off = 0;
						dataRgba[ offset ] = scanlineBuffer[ i + off ];
						off += scanlineWidth; //1;
						dataRgba[ offset + 1 ] = scanlineBuffer[ i + off ];
						off += scanlineWidth; //1;
						dataRgba[ offset + 2 ] = scanlineBuffer[ i + off ];
						off += scanlineWidth; //1;
						dataRgba[ offset + 3 ] = scanlineBuffer[ i + off ];
						offset += 4;

					}

					numScanlines --;

				}

				return dataRgba;

			};

		const RGBEByteToRGBFloat = function ( sourceArray, sourceOffset, destArray, destOffset ) {

			const e = sourceArray[ sourceOffset + 3 ];
			const scale = Math.pow( 2.0, e - 128.0 ) / 255.0;

			destArray[ destOffset + 0 ] = sourceArray[ sourceOffset + 0 ] * scale;
			destArray[ destOffset + 1 ] = sourceArray[ sourceOffset + 1 ] * scale;
			destArray[ destOffset + 2 ] = sourceArray[ sourceOffset + 2 ] * scale;

		};

		const RGBEByteToRGBHalf = ( function () {

			// Source: http://gamedev.stackexchange.com/questions/17326/conversion-of-a-number-from-single-precision-floating-point-representation-to-a/17410#17410

			const floatView = new Float32Array( 1 );
			const int32View = new Int32Array( floatView.buffer );

			/* This method is faster than the OpenEXR implementation (very often
			 * used, eg. in Ogre), with the additional benefit of rounding, inspired
			 * by James Tursa?s half-precision code. */
			function toHalf( val ) {

				floatView[ 0 ] = val;
				const x = int32View[ 0 ];

				let bits = ( x >> 16 ) & 0x8000; /* Get the sign */
				let m = ( x >> 12 ) & 0x07ff; /* Keep one extra bit for rounding */
				const e = ( x >> 23 ) & 0xff; /* Using int is faster here */

				/* If zero, or denormal, or exponent underflows too much for a denormal
				 * half, return signed zero. */
				if ( e < 103 ) return bits;

				/* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
				if ( e > 142 ) {

					bits |= 0x7c00;
					/* If exponent was 0xff and one mantissa bit was set, it means NaN,
							 * not Inf, so make sure we set one mantissa bit too. */
					bits |= ( ( e == 255 ) ? 0 : 1 ) && ( x & 0x007fffff );
					return bits;

				}

				/* If exponent underflows but not too much, return a denormal */
				if ( e < 113 ) {

					m |= 0x0800;
					/* Extra rounding may overflow and set mantissa to 0 and exponent
					 * to 1, which is OK. */
					bits |= ( m >> ( 114 - e ) ) + ( ( m >> ( 113 - e ) ) & 1 );
					return bits;

				}

				bits |= ( ( e - 112 ) << 10 ) | ( m >> 1 );
				/* Extra rounding. An overflow will set mantissa to 0 and increment
				 * the exponent, which is OK. */
				bits += m & 1;
				return bits;

			}

			return function ( sourceArray, sourceOffset, destArray, destOffset ) {

				const e = sourceArray[ sourceOffset + 3 ];
				const scale = Math.pow( 2.0, e - 128.0 ) / 255.0;

				destArray[ destOffset + 0 ] = toHalf( sourceArray[ sourceOffset + 0 ] * scale );
				destArray[ destOffset + 1 ] = toHalf( sourceArray[ sourceOffset + 1 ] * scale );
				destArray[ destOffset + 2 ] = toHalf( sourceArray[ sourceOffset + 2 ] * scale );

			};

		} )();

		const byteArray = new Uint8Array( buffer ) as any;
		byteArray.pos = 0;
		const rgbeHeaderInfo = RGBE_ReadHeader( byteArray ) as any;

		if ( RGBE_RETURN_FAILURE !== rgbeHeaderInfo ) {

			const w = rgbeHeaderInfo.width,
				h = rgbeHeaderInfo.height,
				imageRgbaData = RGBE_ReadPixels_RLE( byteArray.subarray( byteArray.pos ), w, h );

			if ( RGBE_RETURN_FAILURE !== imageRgbaData ) {
				let data, format, type, numElements, floatArray, halfArray;
				switch ( this.type ) {

					case UnsignedByteType:

						data = imageRgbaData;
						format = RGBEFormat; // handled as THREE.RGBAFormat in shaders
						type = UnsignedByteType;
						break;

					case FloatType:

						numElements = ( imageRgbaData.length / 4 ) * 3;
						floatArray = new Float32Array( numElements );

						for ( let j = 0; j < numElements; j ++ ) {

							RGBEByteToRGBFloat( imageRgbaData, j * 4, floatArray, j * 3 );

						}

						data = floatArray as any;
						format = RGBFormat;
						type = FloatType;
						break;

					case HalfFloatType:

						numElements = ( imageRgbaData.length / 4 ) * 3;
						halfArray = new Uint16Array( numElements );

						for ( let j = 0; j < numElements; j ++ ) {

							RGBEByteToRGBHalf( imageRgbaData, j * 4, halfArray, j * 3 );

						}

						data = halfArray as any;
						format = RGBFormat;
						type = HalfFloatType;
						break;

					default:

						console.error( 'THREE.RGBELoader: unsupported type: ', this.type );
						break;

				}

				return {
					width: w, height: h,
					data: data,
					header: rgbeHeaderInfo.string,
					gamma: rgbeHeaderInfo.gamma,
					exposure: rgbeHeaderInfo.exposure,
					format: format,
					type: type
				};

			}

		}

		return null;

	},

	setDataType: function ( value ) {

		this.type = value;
		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

		function onLoadCallback( texture, texData ): void {

			switch ( texture.type ) {

				case UnsignedByteType:

					texture.encoding = RGBEEncoding;
					texture.minFilter = NearestFilter;
					texture.magFilter = NearestFilter;
					texture.generateMipmaps = false;
					texture.flipY = true;
					break;

				case FloatType:

					texture.encoding = LinearEncoding;
					texture.minFilter = LinearFilter;
					texture.magFilter = LinearFilter;
					texture.generateMipmaps = false;
					texture.flipY = true;
					break;

				case HalfFloatType:

					texture.encoding = LinearEncoding;
					texture.minFilter = LinearFilter;
					texture.magFilter = LinearFilter;
					texture.generateMipmaps = false;
					texture.flipY = true;
					break;

			}

			if ( onLoad ) onLoad( texture, texData );

		}

		return DataTextureLoader.prototype.load.call( this, url, onLoadCallback, onProgress, onError );

	}

} );

export { RGBELoader };