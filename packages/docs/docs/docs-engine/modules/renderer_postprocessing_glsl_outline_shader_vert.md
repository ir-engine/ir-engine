---
id: "renderer_postprocessing_glsl_outline_shader_vert"
title: "Module: renderer/postprocessing/glsl/outline/shader.vert"
sidebar_label: "renderer/postprocessing/glsl/outline/shader.vert"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/outline/shader.vert

## Properties

### default

• **default**: *uniform float patternScale;

varying vec2 vUvPattern;

void mainSupport(const in vec2 uv) {

	vUvPattern = uv * vec2(aspect, 1.0) * patternScale;

}
*
