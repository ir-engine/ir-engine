import FileBrowser from './file-browser/file-browser.service'
import OEmbed from './oembed/oembed.service'
import Archiver from './recursive-archiver/archiver.service'
import StaticResourceType from './static-resource-type/static-resource-type.service'
import StaticResourceVariant from './static-resource-variant/static-resource-variant.service'
import StaticResource from './static-resource/static-resource.service'
import Upload from './upload-asset/upload-asset.service'

export default [StaticResourceVariant, StaticResourceType, StaticResource, FileBrowser, OEmbed, Upload, Archiver]
