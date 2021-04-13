---
id: "renderer_postprocessing_glsl_pixelation_shader_frag"
title: "Module: renderer/postprocessing/glsl/pixelation/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/pixelation/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/pixelation/shader.frag

## Properties

### default

• **default**: *uniform bool active;
uniform vec2 d;

void mainUv(inout vec2 uv) {

	if(active) {

		uv = vec2(
			d.x * (floor(uv.x / d.x) + 0.5),
			d.y * (floor(uv.y / d.y) + 0.5)
		);

	}

}
*
