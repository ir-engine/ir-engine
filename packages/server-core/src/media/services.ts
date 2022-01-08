import FileBrowser from './file-browser/file-browser.service'
import StaticResourceType from './static-resource-type/static-resource-type.service'
import StaticResource from './static-resource/static-resource.service'
import Upload from './upload-media/upload-asset.service'
import UploadMedia from './upload-media/upload-media.service'
import UploadPresigned from './upload-presigned/upload-presigned.service'

export default [FileBrowser, StaticResourceType, StaticResource, UploadPresigned, UploadMedia, Upload]
