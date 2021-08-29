// (The MIT License)

// Copyright (c) 2009-2014 TJ Holowaychuk <tj@vision-media.ca>
// Copyright (c) 2013-2014 Roman Shtylman <shtylman+expressjs@gmail.com>
// Copyright (c) 2014-2015 Douglas Christopher Wilson <doug@somethingdoug.com>

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import ChildProcess from 'child_process'
import _ from 'lodash'
import request from 'request'
import Rx from 'rx'
import fs from 'fs'
import jsyaml from 'js-yaml'

class Kubectl {
  private type
  private binary
  private kubeconfig
  private namespace
  private endpoint
  private context

  constructor(type, conf) {
    this.type = type
    this.binary = conf.binary || 'kubectl'
    this.kubeconfig = conf.kubeconfig || ''
    this.namespace = conf.namespace || ''
    this.endpoint = conf.endpoint || ''
    this.context = conf.context || ''
  }

  private spawn(args, done) {
    const ops = []

    if (this.kubeconfig) {
      ops.push('--kubeconfig=' + this.kubeconfig)
    } else {
      ops.push('-s')
      ops.push(this.endpoint)
    }

    if (this.namespace) {
      ops.push('--namespace=' + this.namespace)
    }

    if (this.context) {
      ops.push('--context=' + this.context)
    }

    const kube = ChildProcess.spawn(this.binary, ops.concat(args)),
      stdout = [],
      stderr = []

    kube.stdout.on('data', (data) => {
      stdout.push(data.toString())
    })

    kube.stderr.on('data', (data) => {
      stderr.push(data.toString())
    })

    kube.on('close', (code) => {
      if (!stderr.length) return done(null, stdout.join(''))

      done(stderr.join(''))
    })
  }

  private callbackFunction(primise, callback) {
    if (_.isFunction(callback)) {
      primise
        .then((data) => {
          callback(null, data)
        })
        .catch((err) => {
          callback(err)
        })
    }
  }

  public command(cmd, callback): Promise<any> {
    if (_.isString(cmd)) cmd = cmd.split(' ')

    const promise = new Promise((resolve, reject) => {
      this.spawn(cmd, (err, data) => {
        if (err) return reject(err || data)

        resolve(cmd.join(' ').indexOf('--output=json') > -1 ? JSON.parse(data) : data)
      })
    })

    this.callbackFunction(promise, callback)

    return promise
  }

  public list(selector, flags?, done?) {
    if (!this.type) throw new Error('not a function')

    if (typeof selector === 'object') {
      var args = '--selector='

      for (var key in selector) args += key + '=' + selector[key]

      selector = args + ''
    } else {
      done = selector
      selector = '--output=json'
    }

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []

    const action = ['get', this.type, selector, '--output=json'].concat(flags)

    return this.command(action, done)
  }

  public get(name: string, flags?, done?: (err, data) => void) {
    if (!this.type) throw new Error('not a function')

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []

    const action = ['get', this.type, name, '--output=json'].concat(flags)

    return this.command(action, done)
  }

  public create(filepath: string, flags?, done?: (err, data) => void) {
    if (!this.type) throw new Error('not a function')

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []

    const action = ['create', '-f', filepath].concat(flags)

    return this.command(action, done)
  }

  public delete(id: string, flags, done?: (err, data) => void) {
    if (!this.type) throw new Error('not a function')

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []

    const action = ['delete', this.type, id].concat(flags)

    return this.command(action, done)
  }

  public update(filepath: string, flags?, done?: (err, data) => void) {
    if (!this.type) throw new Error('not a function')

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []

    const action = ['update', '-f', filepath].concat(flags)

    return this.command(action, done)
  }

  public apply(name: string, json: any, flags?, done?: (err, data) => void) {
    if (!this.type) throw new Error('not a function')

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []
    const action = ['update', this.type, name, '--patch=' + JSON.stringify(json)].concat(flags)

    return this.command(action, done)
  }

  public rollingUpdateByFile(name: string, filepath: string, flags?, done?: (err, data) => void) {
    if (this.type !== 'replicationcontrollers') throw new Error('not a function')

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []
    const action = ['rolling-update', name, '-f', filepath, '--update-period=0s'].concat(flags)

    return this.command(action, done)
  }

  public rollingUpdate(name: string, image: string, flags?, done?: (err, data) => void) {
    if (this.type !== 'replicationcontrollers') throw new Error('not a function')

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []

    const action = ['rolling-update', name, '--image=' + image, '--update-period=0s'].concat(flags)

    return this.command(action, done)
  }

  public scale(name: string, replicas: string, flags?, done?: (err, data) => void) {
    if (this.type !== 'replicationcontrollers' && this.type !== 'deployments') throw new Error('not a function')

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []
    const action = ['scale', '--replicas=' + replicas, 'replicationcontrollers', name].concat(flags)

    return this.command(action, done)
  }

  public logs(name: string, flags?, done?: (err, data) => void) {
    if (this.type !== 'pods') throw new Error('not a function')

    var action = new Array('logs')

    if (name.indexOf(' ') > -1) {
      var names = name.split(/ /)
      action.push(names[0])
      action.push(names[1])
    } else {
      action.push(name)
    }

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []

    return this.command(action.concat(flags), done)
  }

  public describe(name: string, flags?, done?: (err, data) => void) {
    if (!this.type) throw new Error('not a function')

    var action = ['describe', this.type]

    if (name === null) {
      action.push(name)
    }

    if (_.isFunction(flags)) {
      done = flags
      flags = null
    }

    flags = flags || []

    return this.command(action.concat(flags), done)
  }

  public portForward(name: string, portString: string, done?: (err, data) => void) {
    if (this.type !== 'pods') throw new Error('not a function')

    var action = ['port-forward', name, portString]

    return this.command(action, done)
  }

  public useContext(context: string, done?: (err, data) => void) {
    var action = ['config', 'use-context', context]

    return this.command(action, done)
  }

  public viewContext(done?: (err, data) => void) {
    var action = ['config', '--output=json', 'view']

    this.command(action, done)
  }
}

declare function require(name: string)

export const kubectl = (conf): any => {
  return {
    // short names are just aliases to longer names
    pod: new Kubectl('pods', conf),
    po: new Kubectl('pods', conf),
    replicationcontroller: new Kubectl('replicationcontrollers', conf),
    rc: new Kubectl('replicationcontrollers', conf),
    service: new Kubectl('services', conf),
    svc: new Kubectl('services', conf),
    node: new Kubectl('nodes', conf),
    no: new Kubectl('nodes', conf),
    namespace: new Kubectl('namespaces', conf),
    ns: new Kubectl('namespaces', conf),
    deployment: new Kubectl('deployments', conf),
    daemonset: new Kubectl('daemonsets', conf),
    ds: new Kubectl('daemonsets', conf),
    secrets: new Kubectl('secrets', conf),
    endpoint: new Kubectl('endpoints', conf),
    ep: new Kubectl('endpoints', conf),
    ingress: new Kubectl('ingress', conf),
    ing: new Kubectl('ingress', conf),
    job: new Kubectl('job', conf),
    context: new Kubectl('context', conf),
    command: function (action, ...args) {
      args[0] = args[0].split(' ')
      return action.apply(this.pod, args)
    }
  }
}

declare var Buffer

export class Request {
  private strictSSL
  private domain
  private auth

  constructor(conf: any) {
    if (conf.kubeconfig) {
      var kubeconfig = jsyaml.safeLoad(fs.readFileSync(conf.kubeconfig))
      var context = conf.context || this.readContext(kubeconfig)
      var cluster = this.readCluster(kubeconfig, context)
      var user = this.readUser(kubeconfig, context)
    }

    this.auth = conf.auth || {}

    this.auth.caCert = this.auth.caCert || this.readCaCert(cluster)
    this.auth.clientKey = this.auth.clientKey || this.readClientKey(user)
    this.auth.clientCert = this.auth.clientCert || this.readClientCert(user)
    this.auth.token = this.auth.token || this.readUserToken(user)
    this.auth.username = this.auth.username || this.readUsername(user)
    this.auth.password = this.auth.password || this.readPassword(user)

    // only set to false if explictly false in the config
    this.strictSSL = conf.strictSSL !== false

    var endpoint = conf.endpoint || this.readEndpoint(cluster)
    this.domain = `${endpoint}${conf.version}/`
  }

  // Returns Context JSON from kubeconfig
  private readContext(kubeconfig) {
    if (!kubeconfig) return
    return kubeconfig.contexts.find((x) => x.name === kubeconfig['current-context'])
  }

  // Returns Cluster JSON from context at kubeconfig
  private readCluster(kubeconfig, context) {
    if (!kubeconfig || !context) return
    return kubeconfig.clusters.find((x) => x.name === context.context.cluster)
  }

  // Returns Cluster JSON from context at kubeconfig
  private readUser(kubeconfig, context) {
    if (!kubeconfig) return
    return kubeconfig.users.find((x) => x.name === context.context.user)
  }

  // Returns CaCert from kubeconfig
  private readCaCert(cluster) {
    if (!cluster) return
    var certificate_authority = cluster.cluster['certificate-authority']
    if (certificate_authority) {
      return fs.readFileSync(certificate_authority).toString()
    }
    var certificate_authority_data = cluster.cluster['certificate-authority-data']
    if (certificate_authority_data) {
      return Buffer.from(certificate_authority_data, 'base64').toString('ascii')
    }
  }

  // Returns CaCert from kubeconfig
  private readClientKey(user) {
    if (!user) return
    var client_key = user.user['client-key']
    if (client_key) {
      return fs.readFileSync(client_key).toString()
    }
    var client_key_data = user.user['client-key-data']
    if (client_key_data) {
      return Buffer.from(client_key_data, 'base64').toString('ascii')
    }
  }

  // Returns CaCert from kubeconfig
  private readClientCert(user) {
    if (!user) return
    var client_certificate = user.user['client-certificate']
    if (client_certificate) {
      return fs.readFileSync(client_certificate).toString()
    }
    var client_certificate_data = user.user['client-certificate-data']
    if (client_certificate_data) {
      return Buffer.from(client_certificate_data, 'base64').toString('ascii')
    }
  }

  // Returns User token from kubeconfig
  private readUserToken(user) {
    if (!user) return
    return user.user['token']
  }

  // Returns User token from kubeconfig
  private readUsername(user) {
    if (!user) return
    return user.user['username']
  }

  private readPassword(user) {
    if (!user) return
    return user.user['password']
  }

  private readEndpoint(cluster) {
    if (!cluster) return
    return cluster.cluster['server']
  }

  private callbackFunction(primise, callback) {
    if (_.isFunction(callback)) {
      primise
        .then((data) => {
          callback(null, data)
        })
        .catch((err) => {
          callback(err)
        })
    }
  }

  private getRequestOptions(path: string, opts?: any) {
    const options = opts || {}

    options.url = this.domain + path

    options.headers = {
      'Content-Type': 'application/json'
    }

    options.strictSSL = this.strictSSL

    if (this.auth) {
      if (this.auth.caCert) {
        options.ca = this.auth.caCert
      }

      if (this.auth.username && this.auth.password) {
        const authstr = new Buffer(this.auth.username + ':' + this.auth.password).toString('base64')
        options.headers.Authorization = `Basic ${authstr}`
      } else if (this.auth.token) {
        options.headers.Authorization = `Bearer ${this.auth.token}`
      } else if (this.auth.clientCert && this.auth.clientKey) {
        options.cert = this.auth.clientCert
        options.key = this.auth.clientKey
      }
    }

    return options
  }

  public async get(url: string, done?): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      request.get(this.getRequestOptions(url), (err, res, data) => {
        if (err || res.statusCode < 200 || res.statusCode >= 300) return reject(err || data)

        resolve(JSON.parse(data))
      })
    })

    this.callbackFunction(promise, done)

    return promise
  }

  public async log(url: string, done?): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      request.get(this.getRequestOptions(url), (err, res, data) => {
        if (err || res.statusCode < 200 || res.statusCode >= 300) return reject(err || data)

        resolve(data)
      })
    })

    this.callbackFunction(promise, done)

    return promise
  }

  public post(url, body, done?): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      request.post(this.getRequestOptions(url, { json: body }), (err, res, data) => {
        if (err || res.statusCode < 200 || res.statusCode >= 300) return reject(err || data)

        resolve(data)
      })
    })

    this.callbackFunction(promise, done)

    return promise
  }

  public put(url, body, done?): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      request.put(this.getRequestOptions(url, { json: body }), (err, res, data) => {
        if (err || res.statusCode < 200 || res.statusCode >= 300) return reject(err || data)

        resolve(data)
      })
    })

    this.callbackFunction(promise, done)

    return promise
  }

  public patch(url, body, _options?, done?): Promise<any> {
    if (typeof _options === 'function') {
      done = _options
      _options = undefined
    }

    const promise = new Promise((resolve, reject) => {
      const options = this.getRequestOptions(url, { json: body })

      options.headers['Content-Type'] = 'application/json-patch+json'

      if (_options && _options.headers) {
        for (const key in _options.headers) {
          options.headers[key] = _options.headers[key]
        }
      }

      request.patch(options, (err, res, data) => {
        if (err || res.statusCode < 200 || res.statusCode >= 300) return reject(err || data)

        resolve(data)
      })
    })

    this.callbackFunction(promise, done)

    return promise
  }

  public delete(url, json?, done?): Promise<any> {
    if (_.isFunction(json)) {
      done = json
      json = undefined
    }

    const promise = new Promise((resolve, reject) => {
      request.del(this.getRequestOptions(url, json), (err, res, data) => {
        if (err || res.statusCode < 200 || res.statusCode >= 300) return reject(err || data)

        resolve(data)
      })
    })

    this.callbackFunction(promise, done)

    return promise
  }

  public watch(url, message?, exit?, timeout?) {
    if (_.isNumber(message)) {
      timeout = message
      message = undefined
    }
    var res

    const source = Rx.Observable.create((observer) => {
      var jsonStr = ''
      res = request
        .get(this.getRequestOptions(url, { timeout: timeout }), (e) => {})
        .on('data', (data) => {
          if (res.response.headers['content-type'] === 'text/plain') {
            observer.onNext(data.toString())
          } else {
            jsonStr += data.toString()

            if (!/\n$/.test(jsonStr)) return
            jsonStr = jsonStr.replace('\n$', '')
            try {
              jsonStr.split('\n').forEach((jsonStr) => {
                if (!jsonStr) return
                const json = JSON.parse(jsonStr)
                observer.onNext(json)
              })
              jsonStr = ''
            } catch (err) {
              observer.onError(err)
            }
          }
        })
        .on('error', (err) => {
          observer.onError(err)
        })
        .on('close', () => {
          observer.onError()
        })
    })

    if (_.isFunction(message)) {
      source.subscribe(
        (data) => {
          message(data)
        },
        (err) => {
          if (_.isFunction(exit)) exit(err)
        }
      )

      return res
    }

    return source
  }
}

export type K8sRequest = Request

export const api = (conf) => {
  return new Request(conf)
}
