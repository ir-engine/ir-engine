
import Compiler from './compiler';

export default class Seeder {
  app: any;
  opts: any;
  compiler: Compiler;
  constructor(app, opts) {
    this.app = app;
    this.opts = opts;

    this.compiler = new Compiler();
  }

  compileTemplate(template) {
    return this.compiler.compile(template);
  }

  seedApp() {
    console.log('Seeding app...');

    return new Promise((resolve, reject) => {
      const promises = [];

      for (const cfg of this.opts.services) {
        promises.push(this.seed(cfg));
      }

      console.log(`Running ${promises.length} seeder(s)...`);

      return Promise.all(promises).then(seeded => {
        console.log(`Created ${seeded.length} total items:`, seeded);
        return resolve(seeded);
      }).catch(reject);
    });
  }

  seed(cfg) {
    return new Promise((resolve, reject) => {
      if (!cfg.path) {
        throw new Error('You must include the path of every service you want to seed.');
      }

      if (!cfg.template && !cfg.templates) {
        throw new Error('You must specify a template or array of templates for seeded objects.');
      }

      if (cfg.count && cfg.randomize === false) {
        throw new Error('You may not specify both randomize = false with count');
      }

      const service = this.app.service(cfg.path);
      const params = Object.assign({}, this.opts.params, cfg.params);
      const count = Number(cfg.count) || 1;
      const randomize = typeof cfg.randomize === 'undefined' ? true : cfg.randomize;
      console.log(`Params seeding '${cfg.path}':`, params);
      console.log(`Param randomize: ${randomize}`);
      console.log(`Creating ${count} instance(s)`);

      // Delete from service, if necessary
      const shouldDelete = this.opts.delete !== false &&
        cfg.delete !== false;

      if (!shouldDelete) {
        console.log(`Not deleting any items from ${cfg.path}.`);
      }

      const deletePromise = shouldDelete ?
        service.remove(null, params) :
        Promise.resolve([]);

      return deletePromise.then(deleted => {
        console.log(`Deleted from '${cfg.path}:'`, deleted);

        const pushPromise = template => {
          return new Promise((resolve, reject) => {
            const compiled = this.compileTemplate(template);
            console.log('Compiled template:', compiled);

            return service.create(compiled, params).then(created => {
              console.log('Created:', created);

              if (typeof cfg.callback !== 'function') {
                return resolve(created);
              } else {
                return cfg.callback(created, this.seed.bind(this)).then(result => {
                  console.log(`Result of callback on '${cfg.path}':`, result);
                  return resolve(created);
                }).catch(reject);
              }
            }).catch(reject);
          });
        };

        // Now, let's seed the app.
        const promises = [];

        if (cfg.template && cfg.disabled !== true) {
          // Single template
          for (let i = 0; i < count; i++) {
            promises.push(pushPromise(cfg.template));
          }
        } else if (cfg.templates && cfg.disabled !== true) {
          // Multiple random templates
          if (randomize) {
            for (let i = 0; i < count; i++) {
              const idx = Math.floor(Math.random() * cfg.templates.length);
              const template = cfg.templates[idx];
              console.log(`Picked random template index ${idx}`);
              promises.push(pushPromise(template));
            }
          }
          // All templates
          else {
            for (let i = 0; i < cfg.templates.length; i++) {
              const template = cfg.templates[i];
              promises.push(pushPromise(template));
            }
          }
        }

        if (!promises.length) {
          console.log(`Seeder disabled for ${cfg.path}, not modifying database.`);
          return resolve([]);
        } else {
          return Promise.all(promises).then(resolve).catch(reject);
        }
      }).catch(reject);
    });
  }
}
