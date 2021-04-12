---
id: "renderer_postprocessing_glsl_god_rays_shader_frag"
title: "Module: renderer/postprocessing/glsl/god-rays/shader.frag"
sidebar_label: "renderer/postprocessing/glsl/god-rays/shader.frag"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/glsl/god-rays/shader.frag

## Properties

### default

• **default**: *uniform sampler2D texture;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = texture2D(texture, uv);

}
*
