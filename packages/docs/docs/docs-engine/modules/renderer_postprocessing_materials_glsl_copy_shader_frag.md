---
id: "renderer_postprocessing_materials_glsl_copy_shader_frag"
title: "Module: renderer/postprocessing/materials/glsl/copy/shader.frag"
sidebar_label: "renderer/postprocessing/materials/glsl/copy/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/materials/glsl/copy/shader.frag

## Properties

### default

• **default**: *uniform sampler2D inputBuffer;
uniform float opacity;

varying vec2 vUv;

void main() {

	vec4 texel = texture2D(inputBuffer, vUv);
	gl_FragColor = opacity * texel;

	#include <encodings_fragment>

}
*
