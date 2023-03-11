import FileBrowser from './file-browser/file-browser.service'
import OEmbed from './oembed/oembed.service'
import Archiver from './recursive-archiver/archiver.service'
import StaticResourceType from './static-resource-type/static-resource-type.service'
import StaticResource from './static-resource/static-resource.service'
import Upload from './upload-asset/upload-asset.service'

export default [FileBrowser, Archiver, OEmbed, StaticResourceType, StaticResource, Upload]
