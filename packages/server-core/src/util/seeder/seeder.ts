import Compiler from './compiler'

export default class Seeder {
  app: any
  opts: any
  compiler: Compiler
  constructor(app, opts) {
    this.app = app
    this.opts = opts

    this.compiler = new Compiler()
  }

  compileTemplate(template) {
    return this.compiler.compile(template)
  }

  seedApp() {
    console.log('Seeding app...')

    return new Promise((resolve, reject) => {
      const promises = []

      for (const cfg of this.opts.services) {
        promises.push(this.seed(cfg))
      }

      return Promise.all(promises)
        .then((seeded) => {
          return resolve(seeded)
        })
        .catch(reject)
    })
  }

  seed(cfg) {
    return new Promise((resolve, reject) => {
      // if (!cfg.path) {
      //   throw new Error('You must include the path of every service you want to seed.')
      // }
      console.log('\n\n\n', cfg, '\n\n\n')

      if (!cfg.template && !cfg.templates) {
        throw new Error('You must specify a template or array of templates for seeded objects.')
      }

      if (cfg.count && cfg.randomize === false) {
        throw new Error('You may not specify both randomize = false with count')
      }

      const service = cfg.path && this.app.service(cfg.path)
      const params = Object.assign({}, this.opts.params, cfg.params)
      const count = Number(cfg.count) || 1
      const randomize = typeof cfg.randomize === 'undefined' ? true : cfg.randomize

      // Delete from service, if necessary
      const shouldDelete = this.opts.delete !== false && cfg.delete !== false

      const deletePromise = shouldDelete && cfg.path ? service.remove(null, params) : Promise.resolve([])

      return deletePromise
        .then((deleted) => {
          const pushPromise = (template) => {
            return new Promise((resolve, reject) => {
              const compiled = this.compileTemplate(template)

              if (!cfg.path) resolve([])

              return service
                .create(compiled, params)
                .then((created) => {
                  if (typeof cfg.callback !== 'function') {
                    return resolve(created)
                  } else {
                    return cfg
                      .callback(created, this.seed.bind(this))
                      .then((result) => {
                        return resolve(created)
                      })
                      .catch(reject)
                  }
                })
                .catch(reject)
            })
          }

          // Now, let's seed the app.
          const promises = []

          if (cfg.template && cfg.disabled !== true) {
            // Single template
            for (let i = 0; i < count; i++) {
              promises.push(pushPromise(cfg.template))
            }
          } else if (cfg.templates && cfg.disabled !== true) {
            // Multiple random templates
            if (randomize) {
              for (let i = 0; i < count; i++) {
                const index = Math.floor(Math.random() * cfg.templates.length)
                const template = cfg.templates[index]
                promises.push(pushPromise(template))
              }
            }
            // All templates
            else {
              for (let i = 0; i < cfg.templates.length; i++) {
                const template = cfg.templates[i]
                promises.push(pushPromise(template))
              }
            }
          }

          if (!promises.length) {
            return resolve([])
          } else {
            return Promise.all(promises).then(resolve).catch(reject)
          }
        })
        .catch(reject)
    })
  }
}
