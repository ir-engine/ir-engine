import { Texture } from 'three'

/** https://gist.github.com/bartwttewaall/5a1168d04a07d52eaf0571f7990191c2 **/

/**
 * @param {Texture} texture - a texture containing a loaded image with a defined width and height
 * @param {number} screenAspect - the aspect ratio (width / height) of the model that contains the texture
 * @param {"fit"|"fill"|"stretch"} mode - three modes of manipulating the texture offset and scale
 * @param {number} [alignH] - optional multiplier to align the texture horizontally - 0: left, 0.5: center, 1: right
 * @param {number} [alignV] - optional multiplier to align the texture vertically - 0: bottom, 0.5: middle, 1: top
 **/
export function fitTexture(
  texture: Texture,
  imageAspect: number,
  screenAspect: number,
  mode: 'fit' | 'fill' | 'stretch',
  alignH = 0.5,
  alignV = 0.5
) {
  const scale = imageAspect / screenAspect
  const offsetX = (imageAspect - screenAspect) / imageAspect
  const offsetY = (screenAspect - imageAspect) / screenAspect

  console.log({ imageAspect, scale, offsetX, offsetY })

  switch (mode) {
    case 'fit': {
      if (screenAspect < imageAspect) {
        texture.offset.set(0, offsetY * alignV)
        texture.repeat.set(1, scale)
      } else {
        texture.offset.set(offsetX * alignH, 0)
        texture.repeat.set(1 / scale, 1)
      }
      break
    }
    case 'fill': {
      if (screenAspect < imageAspect) {
        texture.offset.set(offsetX * alignH, 0)
        texture.repeat.set(1 / scale, 1)
      } else {
        texture.offset.set(0, offsetY * alignV)
        texture.repeat.set(1, scale)
      }
      break
    }
    case 'stretch':
    default: {
      texture.offset.set(0, 0)
      texture.repeat.set(1, 1)
      break
    }
  }
}

// #include <common>
// #include <uv_pars_vertex>
// #include <uv2_pars_vertex>
// #include <envmap_pars_vertex>
// #include <color_pars_vertex>
// #include <fog_pars_vertex>
// #include <morphtarget_pars_vertex>
// #include <skinning_pars_vertex>
// #include <logdepthbuf_pars_vertex>
// #include <clipping_planes_pars_vertex>
// void main() {
// 	#include <uv_vertex>
// 	#include <uv2_vertex>
// 	#include <color_vertex>
// 	#include <morphcolor_vertex>
// 	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
// 		#include <beginnormal_vertex>
// 		#include <morphnormal_vertex>
// 		#include <skinbase_vertex>
// 		#include <skinnormal_vertex>
// 		#include <defaultnormal_vertex>
// 	#endif
// 	#include <begin_vertex>
// 	#include <morphtarget_vertex>
// 	#include <skinning_vertex>
// 	#include <project_vertex>
// 	#include <logdepthbuf_vertex>
// 	#include <clipping_planes_vertex>
// 	#include <worldpos_vertex>
// 	#include <envmap_vertex>
// 	#include <fog_vertex>
// }
