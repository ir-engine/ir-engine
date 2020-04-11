import config from 'config'
import youtubedl from 'youtube-dl'
import AWS from 'aws-sdk';
//@ts-ignore
import S3BlobStore from 's3-blob-store';
import {Application} from '../declarations';

let re = /v=([a-zA-Z0-9]+)$/

const s3 = new AWS.S3({
    accessKeyId: config.get('aws.keys.access_key_id') || '',
    secretAccessKey: config.get('aws.keys.secret_access_key') || '',
});

const s3BlobStore = new S3BlobStore({
    client: s3,
    bucket: config.get('aws.s3.public_video_bucket') || ''
});

export default async function (data: any) {
    let results = data.result;
    let app = data.app;

    results.map(function (result: any) {
        return uploadVideo(result, app)
    })

    return
}


async function uploadVideo(result: any, app: Application) {
    return new Promise(function (resolve, reject) {
        let link = result.link
        let fileId = link.match(re)[1]

        let options = {
            key: fileId + '.webm'
        }

        s3BlobStore.exists(options, async function (err: any, exists: any) {
            if (err) {
                throw err
            }

            if (exists !== true) {
                try {
                    let video = youtubedl(link,
                        ['--format=(webm)[abr<=3000,height<=1080]'],
                        {cwd: __dirname});

                    video.on('error', function(err:any) {
                        throw err
                    })

                    video.on('info', async function (info: any) {
                        let stream = s3BlobStore.createWriteStream(options);

                        video.pipe(stream)

                        stream.on('finish', async function () {
                            await app.service('public-video').patch(result.id, {
                                link: 'https://' + config.get('aws.s3.public_video_bucket') + '.s3.amazonaws.com/' + options.key
                            })

                            resolve()
                        })
                    })
                } catch (err) {
                    console.log(err)

                    reject(err)
                }
            } else {
                await app.service('public-video').patch(result.id, {
                    link: 'https://' + config.get('aws.s3.public_video_bucket') + '.s3.amazonaws.com/' + options.key
                })

                resolve()
            }
        })
    })
}