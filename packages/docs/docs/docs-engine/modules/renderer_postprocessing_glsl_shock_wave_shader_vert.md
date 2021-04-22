---
id: "renderer_postprocessing_glsl_shock_wave_shader_vert"
title: "Module: renderer/postprocessing/glsl/shock-wave/shader.vert"
sidebar_label: "renderer/postprocessing/glsl/shock-wave/shader.vert"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/shock-wave/shader.vert

## Properties

### default

• **default**: *uniform float size;
uniform float cameraDistance;

varying float vSize;

void mainSupport() {

	vSize = (0.1 * cameraDistance) / size;

}
*
