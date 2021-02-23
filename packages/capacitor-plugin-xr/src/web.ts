import { WebPlugin } from '@capacitor/core';
import { ExamplePlugin } from './definitions';

export class ExampleWeb extends WebPlugin implements ExamplePlugin {
  constructor() {
    super({
      name: 'XRPlugin',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}

const XRPlugin = new ExampleWeb();

export { XRPlugin };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(XRPlugin);
