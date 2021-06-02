# feathers-seeder

[![npm](https://img.shields.io/npm/v/feathers-seeder.svg)](https://www.npmjs.com/package/feathers-seeder)
[![build status](https://api.travis-ci.org/thosakwe/feathers-seeder.svg?branch=master)](https://travis-ci.org/thosakwe/feathers-seeder)

Straightforward data seeder for FeathersJS services.

- [feathers-seeder](#feathers-seeder)
- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Example](#example)
- [Thanks](#thanks)

# About
FeathersJS is a dynamic application framework that makes it easy to prototype secure real-time Node applications.

It has uniform support for a wide variety of database options, both persistent and in-memory. However, it can often be a pain to bootstrap databases, especially for secure backends where creation permissions are locked down tightly.

feathers-seeder attempts to solve that problem by allowing you to fill your database (specifically feathers-memory) with similar of identical data every time your application is launched.

This can really be useful for projects using feathers-memory, or feathers-nedb to test applications.

# Installation
These magic words will do the trick:
> npm install --save feathers-seeder

# Usage
1.  [Configure](#configuration) the seeder.
2.  Call `app.seed()`. This will return a Promise.

  Example:
  ```js
  const app = feathers().configure(hooks());
  app
    .configure(seeder(app.get('seeder')))
    .seed()
    .then(() => {
      app.listen(3000);
    });
  ```

# Configuration
feathers-seeder should be called as a function, with a single configuration object as a parameter.

To enable debug output logging, set the [`DEBUG`](https://github.com/visionmedia/debug#usage) env variable accordingly (e.g. `DEBUG=*`)

All data in the service will be wiped before seeding, unless `delete` is set to `false`. It is `true` by default.

To disable feathers-seeder (i.e. at production), you can simply set the value `disabled: true` on your configuration object. It is `false` by default.

You can pass service parameters to each service via a `params` object. This can be useful for projects that have services locked down via hooks.

This configuration object should contain an array called `services`. Each object in this array will have a key pointing to the path of a registered Feathers service, and its value will be a configuration detail as follows.

Example:

```js
{
  delete: true,
  disabled: false,
  params: { provider: 'rest' },
  services: [
    {
      path: 'users',
      template: {
        text: "Hello, world!  I am {{name.firstName}}."
      }
    }
  ]
}
```

**Configuration options:**
* count: `Number` - The number of times to generate objects. If you provide a `template` or `template(s)`, then `count` objects adhering to the template(s) will be generated. **Default = `1`**.

* delete: `Boolean` - If set to true, then existing data for this service will be deleted before seeding. *Overrides global `delete` setting*.

* disabled: `Boolean` - Disables seeding for this service.

* params: `Object` - Additional parameters to pass to service methods. This is merged with (and supersedes) the global `params` configuration via Object.assign.

* path: `String` - The path to the service to be seeded.

* randomize: `Boolean` - (default true) - The seeder will pick a random template to generate the item for the service.

* template: `Object` - A template object defining the structure of each object generated. For dynamic data, you can provide:
  - Template strings, as feathers-seeder uses **[@marak/Faker.js](https://github.com/marak/Faker.js/)** internally
  - Custom parameterless functions

  Example:
  ```js
  {
    template: {
      username: "{{internet.userName}}",
      password: "{{internet.password}}"
      name: "{{name.firstName}} {{name.lastName}}",
      email: "{{internet.email}}",
      lastLogin: () => moment().subtract(7, 'days').format()
    }
  }
  ```

* templates: `Object[]` - An array of templates. If the option `randomize` is true, each time an object is to be generated,
a random template will be chosen.  Otherwise, all templates will be generated for the service.

* callback: `Function(obj, cb)` - You can register a callback each time a database record is created. This allows you to seed
nested services. :) *Callbacks MUST return a `Promise`.*

```js
{
  services: [
    {
      count: 100,
      path: 'users',
      template: {
        name: '{{name.firstName}} {{name.lastName}}'
      },

      callback(user, seed) {
        console.info(`Happy birthday to ${user.name}!`);

        // Call `seed` with regular service configuration.
        // This will return a Promise.

        return seed({
          path: 'users/:userId/posts',
          params: {
            userId: user._id
          },
          template: {
            text: "It's my birthday! :)"
          }
        });
      }
    }
  ]
}
```

# Example
```js
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import memory from 'feathers-memory';
import seeder from 'feathers-seeder';

const options = {
  services: [
    {
      path: 'users',
      count: 10,
      template: {
        name: '{{name.firstName}} {{name.lastName}}'
      }
    }
  ]
};

const app = feathers()
              .use('/users', memory({ multi: true }))
              .configure(seeder(options));

app.seed().then(() => {
  app.service('users').find().then(users => console.log(users));
});

```

# Thanks
Thank you for using feathers-seeder. If you find any bugs, feel free to [report an issue]().

Follow me on Twitter: [@thosakwe](https://twitter.com/thosakwe)

Or check out [my blog](http://blog.thosakwe.com).
