/*
Original Source: https://github.com/pmndrs/postprocessing
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/


import { Color, MeshNormalMaterial, NearestFilter, WebGLRenderTarget } from "three";
import { Resolution, RenderPass, Pass } from "postprocessing";
import { ObjectLayers } from "@etherealengine/spatial/src/renderer/constants/ObjectLayers";
/**
 * A pass that renders the normals of a given scene.
 */

export class CustomNormalPass extends Pass {

	/**
	 * Constructs a new normal pass.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 * @param {Object} [options] - The options.
	 * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
	 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
	 */

	constructor(scene, camera, {
		renderTarget,
		resolutionScale = 1.0,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE,
		resolutionX = width,
		resolutionY = height,
    ignore = []
	} = {}) {

		super("NormalPass");

		this.needsSwap = false;

		/**
		 * A render pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPass = new RenderPass(scene, camera, new MeshNormalMaterial());

		const renderPass = this.renderPass;
		renderPass.ignoreBackground = true;
		renderPass.skipShadowMapUpdate = true;

		const clearPass = renderPass.getClearPass();
		clearPass.overrideClearColor = new Color(0x7777ff);
		clearPass.overrideClearAlpha = 1.0;

		/**
		 * A render target for the scene normals.
		 *
		 * @type {WebGLRenderTarget}
		 * @readonly
		 */

		this.renderTarget = renderTarget;

		if(this.renderTarget === undefined) {

			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: NearestFilter,
				magFilter: NearestFilter
			});

			this.renderTarget.texture.name = "NormalPass.Target";

		}

		/**
		 * The resolution.
		 *
		 * @type {Resolution}
		 * @readonly
		 */

		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));

	}

	set mainScene(value) {

		this.renderPass.mainScene = value;

	}

	set mainCamera(value) {

		this.renderPass.mainCamera = value;

	}

	/**
	 * The normal texture.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * The normal texture.
	 *
	 * @deprecated Use texture instead.
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.renderTarget.texture;

	}

	/**
	 * Returns the resolution settings.
	 *
	 * @deprecated Use resolution instead.
	 * @return {Resolution} The resolution.
	 */

	getResolution() {

		return this.resolution;

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Use resolution.preferredWidth or resolution.preferredHeight instead.
	 */

	getResolutionScale() {

		return this.resolution.scale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Use resolution.preferredWidth or resolution.preferredHeight instead.
	 */

	setResolutionScale(scale) {

		this.resolution.scale = scale;

	}

	/**
	 * Renders the scene normals.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const renderTarget = this.renderToScreen ? null : this.renderTarget;
    this.renderPass.camera.layers.disable(ObjectLayers.UVOL)
		this.renderPass.render(renderer, renderTarget, renderTarget);
    this.renderPass.camera.layers.enable(ObjectLayers.UVOL)
	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		this.renderTarget.setSize(resolution.width, resolution.height);

	}

}