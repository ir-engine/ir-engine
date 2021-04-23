---
id: "renderer_postprocessing_glsl_shock_wave_shader_frag"
title: "Module: renderer/postprocessing/glsl/shock-wave/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/shock-wave/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/shock-wave/shader.frag

## Properties

### default

• **default**: *uniform bool active;
uniform vec2 center;
uniform float waveSize;
uniform float radius;
uniform float maxRadius;
uniform float amplitude;

varying float vSize;

void mainUv(inout vec2 uv) {

	if(active) {

		vec2 aspectCorrection = vec2(aspect, 1.0);
		vec2 difference = uv * aspectCorrection - center * aspectCorrection;
		float distance = sqrt(dot(difference, difference)) * vSize;

		if(distance > radius) {

			if(distance < radius + waveSize) {

				float angle = (distance - radius) * PI2 / waveSize;
				float cosSin = (1.0 - cos(angle)) * 0.5;

				float extent = maxRadius + waveSize;
				float decay = max(extent - distance * distance, 0.0) / extent;

				uv -= ((cosSin * amplitude * difference) / distance) * decay;

			}

		}

	}

}
*
