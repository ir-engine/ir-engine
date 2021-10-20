import * as _ from 'lodash'

export function setDefaults(options: {}, defaults: {}): {} {
  return _.defaults({}, _.clone(options), defaults)
}
