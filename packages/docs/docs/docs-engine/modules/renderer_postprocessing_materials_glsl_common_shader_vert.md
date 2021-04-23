---
id: "renderer_postprocessing_materials_glsl_common_shader_vert"
title: "Module: renderer/postprocessing/materials/glsl/common/shader.vert"
sidebar_label: "renderer/postprocessing/materials/glsl/common/shader.vert"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/materials/glsl/common/shader.vert

## Properties

### default

• **default**: *varying vec2 vUv;

void main() {

	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);

}
*
