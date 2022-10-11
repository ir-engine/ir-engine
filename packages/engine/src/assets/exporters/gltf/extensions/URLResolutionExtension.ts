import { Object3D } from 'three'

import { Engine } from '../../../../ecs/classes/Engine'
import { pathResolver } from '../../../functions/pathResolver'
import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class URLResolutionExtension extends ExporterExtension {
  cacheRe: RegExp

  constructor(writer: GLTFWriter) {
    super(writer)
    this.cacheRe = pathResolver()
  }

  afterParse(input: Object3D | Object3D[]) {
    const writer = this.writer
    const frontier = [writer.json]
    const cacheRe = this.cacheRe
    while (frontier.length > 0) {
      const obj = frontier.pop()
      if (obj)
        Object.entries(obj).map(([k, v]) => {
          switch (typeof v) {
            case 'object':
              frontier.push(v)
              break
            case 'string':
              if (cacheRe.test(v)) {
                //obj[k] = v.replace(cacheRe, '')
                obj[k] = cacheRe.exec(v)![1]
              }
          }
        })
    }
  }
}
