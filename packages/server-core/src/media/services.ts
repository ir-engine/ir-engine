import StaticResourceType from './static-resource-type/static-resource-type.service'
import StaticResource from './static-resource/static-resource.service'
import UploadPresigned from './upload-presigned/upload-presigned.service'
import UploadMedia from './upload-media/upload-media.service'
import StaticResourceURL from './static-resource-url/static-resource-url.service'

export default [StaticResourceType, StaticResource, UploadPresigned, UploadMedia, StaticResourceURL]
