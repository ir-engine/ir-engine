/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import {ExpoWebGLRenderingContext} from 'expo-gl';
import {EventListenerRegistry} from './CanvasEventHandler';

export type NativeWebGLRenderingContext = ExpoWebGLRenderingContext & {
  drawingBufferWidth: number;
  drawingBufferHeight: number;
};

export class NativeHTMLCanvasElement implements HTMLCanvasElement {
  public width: number;
  public height: number;
  public style: Record<string, string>;
  public addEventListener;
  public removeEventListener;
  public clientHeight: number;
  public clientWidth: number;

  private context: NativeWebGLRenderingContext;

  constructor(
    context: NativeWebGLRenderingContext,
    eventListenerRegistry: EventListenerRegistry,
  ) {
    this.width = context.drawingBufferWidth;
    this.height = context.drawingBufferHeight;
    this.style = {};
    this.clientHeight = context.drawingBufferHeight;
    this.clientWidth = context.drawingBufferWidth;
    this.context = context;
    this.addEventListener = eventListenerRegistry.addEventListener;
    this.removeEventListener = eventListenerRegistry.removeEventListener;
  }

  public getContext(glContext: 'webgl2') {
    if (glContext === 'webgl2') {
      return this.context;
    }
    throw new Error(`Unsupported context: ${glContext}`);
  }

  public getBoundingClientRect() {
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: this.width,
      bottom: this.height,
      width: this.width,
      height: this.height,
    };
  }
}
