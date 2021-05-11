import faker from 'faker';

export default class Compiler {
  compile(template) {
    console.log('About to compile template: ', template);

    const result = {};
    Object.keys(template).forEach(key => {
      const value = template[key];
      result[key] = this._populate(key, value);
    });

    return result;
  }

  _populate(key, value) {
    console.log(`Populating key: ${key} from value: ${value}`);

    if (typeof value === 'number' || typeof value === 'boolean' || value instanceof Date ||
      value === null || value === undefined) {
      console.log('Value is a primitive.');

      return value;
    }
    else if (value instanceof String || typeof value === 'string') {
      console.log('Value is a string.');

      return faker.fake(value);
    }
    else if (Array.isArray(value)) {
      console.log('Value is an array.');

      return value.map(x => this._populate(key, x));
    }
    else if (typeof value === 'function') {
      return value();
    }
    // Otherwise, this is an object, and potentially a template itself
    else {
      console.log(`Value is a ${typeof value}`);

      return this.compile(value);
    }
  }
}
