import { EngineRenderer } from "../../src/renderer/WebGLRendererSystem";

export class MockEngineRenderer extends EngineRenderer
{
  static instance: EngineRenderer;

  constructor(options?: {})
  {
    super()
    if(options)
    {
      const jsdom = require('jsdom');
      const { JSDOM } = jsdom;
    }
    
    EngineRenderer.instance = this;
  }
}