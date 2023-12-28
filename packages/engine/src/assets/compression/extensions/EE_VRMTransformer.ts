import { Extension, ReaderContext, WriterContext } from '@gltf-transform/core'

const EXTENSION_NAME = 'VRM'

export class VRMExtension extends Extension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  vrm: any | null = null

  public read(readerContext: ReaderContext): this {
    if (readerContext.jsonDoc.json.extensions?.[EXTENSION_NAME]) {
      this.vrm = readerContext.jsonDoc.json.extensions[EXTENSION_NAME]
    }
    return this
  }

  public write(writerContext: WriterContext): this {
    if (this.vrm !== null) {
      writerContext.jsonDoc.json.extensions ??= {} as Record<string, unknown>
      writerContext.jsonDoc.json.extensions[EXTENSION_NAME] = this.vrm
    }
    return this
  }
}
