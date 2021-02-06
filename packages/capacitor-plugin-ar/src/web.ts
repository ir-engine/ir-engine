import { WebPlugin } from '@capacitor/core';
import { ExamplePlugin } from './definitions';

export class ExampleWeb extends WebPlugin implements ExamplePlugin {
  constructor() {
    super({
      name: 'Example',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}

const Example = new ExampleWeb();

export { Example };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(Example);
