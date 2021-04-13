---
id: "renderer_postprocessing_glsl_texture_shader_vert"
title: "Module: renderer/postprocessing/glsl/texture/shader.vert"
sidebar_label: "renderer/postprocessing/glsl/texture/shader.vert"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/texture/shader.vert

## Properties

### default

• **default**: *#ifdef ASPECT_CORRECTION

	uniform float scale;

#else

	uniform mat3 uvTransform;

#endif

varying vec2 vUv2;

void mainSupport(const in vec2 uv) {

	#ifdef ASPECT_CORRECTION

		vUv2 = uv * vec2(aspect, 1.0) * scale;

	#else

		vUv2 = (uvTransform * vec3(uv, 1.0)).xy;

	#endif

}
*
