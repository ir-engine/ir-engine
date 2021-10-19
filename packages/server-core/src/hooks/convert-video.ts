export {}

// /* eslint-disable @typescript-eslint/restrict-plus-operands */
// import util from 'util';
// import { exec } from 'child_process';
// import * as path from 'path';
// import config from '../../appconfig';
// import youtubedl from 'youtube-dl';
// import AWS from 'aws-sdk';
// import S3BlobStore from 's3-blob-store';
// import { Application } from '../../../declarations';
// import { useStorageProvider } from '../storage/storageprovider';
// import createStaticResource from './create-static-resource';
//
// import fs from 'fs';
// import _ from 'lodash';
// import appRootPath from 'app-root-path';
// import uploadThumbnailLinkHook from './upload-thumbnail-link';
// import { BadRequest } from '@feathersjs/errors';
//
// const promiseExec = util.promisify(exec);
//
// const sourceRegexes = [
//   /youtu.be\/([a-zA-Z0-9_-]+)($|&)/,
//   /youtube.com\/watch\?v=([a-zA-Z0-9_-]+)($|&)/,
//   /vimeo.com\/([a-zA-Z0-9_-]+)($|&)/
// ];
// const extensionRegex = /.([a-z0-9]+)$/;
// const mimetypeDict = {
//   mpd: 'application/dash+xml',
//   m4s: 'video/iso.segment',
//   m3u8: 'application/x-mpegURL'
// };
// const dashManifestName = 'manifest.mpd';
// const createStaticResourceHook = createStaticResource();
//
// const s3 = new AWS.S3({ ...config.aws.keys });
//
// const s3BlobStore = new S3BlobStore({
//   client: s3,
//   bucket: config.aws.s3.staticResourceBucket,
//   acl: 'public-read'
// });
//
// const stereoConversion = '-vf "stereo3d=sbsl:ml,transpose=1,setdar=16/9" ';
//
//
// const uploadFile = async (localFilePath: string, fileId: string, context: any,
//   app: Application, resultId: number): Promise<void> => {
//   // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
//   return await new Promise(async (resolve, reject) => {
//     const promises = [];
//     try {
//       const files = await fs.promises.readdir(localFilePath);
//
//       for (const file of files) {
//         if (/.m/.test(file)) {
//           // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
//           promises.push(new Promise(async (resolve, reject) => {
//             const content = await fs.promises.readFile(localFilePath + '/' + file);
//             const extensionMatch = file.match(extensionRegex);
//             const extension = extensionMatch
//               ? extensionMatch[1]
//               : 'application';
//                         const mimetype = mimetypeDict[extension];
//
//             const localContext = _.cloneDeep(context);
//             localContext.params.file = {
//               fieldname: 'file',
//               originalname: file,
//               encoding: '7bit',
//               buffer: content,
//               mimetype: mimetype,
//               size: content.length
//             };
//
//             localContext.params.body = {
//               name: file,
//               metadata: localContext.data.metadata,
//               mimeType: mimetype
//             };
//
//             localContext.params.mimeType = mimetype;
//             localContext.params.storageProvider = useStorageProvider();
//             localContext.params.uploadPath = path.join('public',
//               localContext.params.videoSource, fileId, 'video');
//
//             if (/.mpd/.test(file)) {
//               localContext.params.skipResourceCreation = true;
//               localContext.params.patchId = resultId;
//               localContext.params.parentResourceId = null;
//               localContext.params.body.description = localContext.arguments[0].description;
//             } else {
//               localContext.params.skipResourceCreation = false;
//               localContext.params.patchId = null;
//               localContext.params.parentResourceId = resultId;
//               localContext.params.body.description = 'DASH chunk for video ' + fileId;
//             }
//
//             await app.service('upload').create(localContext.data, localContext.params);
//
//             resolve();
//           }));
//         } else {
//           promises.push(uploadFile(path.join(localFilePath, file), fileId,
//             context, app, resultId));
//         }
//       }
//
//       await Promise.all(promises);
//
//       resolve();
//     } catch (err) {
//       console.log('uploadFile error');
//       logger.error(err);
//       reject(err);
//     }
//   });
// };
//
// export default async (context: any): Promise<void> => {
//   const { result, app } = context;
//
//   context.params.provider = null; // Will get around upload's isProvider check
//
//   if (Array.isArray(result)) {
//     return;
//   }
//
//   const url = result.url;
//   let fileId = '';
//
//   for (const re of sourceRegexes) {
//     const match = url.match(re);
//
//     if (match != null) {
//       fileId = match[1];
//       if (/youtube.com/.test(url) || /youtu.be/.test(url)) {
//         context.params.videoSource = 'youtube';
//         context.data.metadata['360_format'] = context.data.metadata['360_format'] != null ? context.data.metadata['360_format'] : 'eac';
//       } else if (/vimeo.com/.test(url)) {
//         context.params.videoSource = 'vimeo';
//         context.data.metadata['360_format'] = context.data.metadata['360_format'] != null ? context.data.metadata['360_format'] : 'equirectangular';
//       }
//     }
//   }
//
//   if (fileId.length > 0) {
//     let thumbnailUploadResult: any;
//     const localContext = _.cloneDeep(context);
//
//     localContext.params.storageProvider = useStorageProvider();
//     localContext.params.uploadPath = path.join('public', localContext.params.videoSource, fileId, 'video');
//
//     if (localContext.data.metadata.thumbnailUrl != null && localContext.data.metadata.thumbnailUrl.length > 0) {
//       const localContextClone = _.cloneDeep(localContext);
//       localContextClone.params.parentResourceId = result.id;
//       thumbnailUploadResult = await uploadThumbnailLinkHook()(localContextClone);
//       localContext.params.thumbnailUrl = localContext.data.metadata.thumbnailUrl = thumbnailUploadResult.params.thumbnailUrl;
//     }
//
//     const s3Key = path.join('public', localContext.params.videoSource, fileId, 'video', dashManifestName);
//     s3BlobStore.exists({
//       key: (s3Key)
//     }, async (err: any, exists: any) => {
//       if (err) {
//         console.log('s3 error');
//         logger.error(err);
//         throw err;
//       }
//
//       if (exists !== true) {
//         try {
//           const localFilePath = path.join(appRootPath.path, 'temp_videos', fileId);
//           const rawVideoPath = path.join(localFilePath, fileId) + '_raw.mp4';
//           const outputdir = path.join(localFilePath, 'output');
//           const dashManifestPath = path.join(outputdir, dashManifestName);
//           await fs.promises.rmdir(localFilePath, { recursive: true });
//           await fs.promises.mkdir(localFilePath, { recursive: true });
//           await fs.promises.mkdir(path.join(localFilePath, 'output'), { recursive: true });
//
//           await new Promise((resolve, reject) => {
//             console.log('Starting to download ' + url);
//             youtubedl.exec(url,
//               ['--format=bestvideo[ext=mp4]+bestaudio[ext=m4a]', '--output=' + fileId + '_raw.mp4'],
//               { cwd: localFilePath },
//               (err: any, output: any) => {
//                 if (err) {
//                   logger.error(err);
//                   reject(err);
//                 }
//                 resolve();
//               });
//           });
//
//           if (!localContext.data.metadata.thumbnailUrl ||
//               localContext.data.metadata.thumbnailUrl.length === 0) {
//             console.log('Getting thumbnail from youtube-dl');
//
//             const thumbnailUrlResult = await new Promise((resolve, reject) => {
//               youtubedl.exec(url,
//                 ['--get-thumbnail'],
//                 { cwd: localFilePath },
//                 (err: any, output: any) => {
//                   if (err) {
//                     logger.error(err);
//                     reject(err);
//                   }
//                   resolve(output);
//                 });
//             });
//
//             localContext.data.metadata.thumbnailUrl = (thumbnailUrlResult as any)[0];
//             localContext.result.metadata.thumbnailUrl = localContext.data.metadata.thumbnailUrl;
//
//             const localContextClone = _.cloneDeep(localContext);
//             localContextClone.params.parentResourceId = result.id;
//             thumbnailUploadResult = await uploadThumbnailLinkHook()(localContextClone);
//
//             localContext.data.metadata.thumbnailUrl = thumbnailUploadResult.params.thumbnailUrl;
//           }
//
//           console.log('Finished downloading video ' + fileId + ', running through ffmpeg');
//
//           try {
//             // -hls_playlist 1 generates HLS playlist files as well. The master playlist is generated with the filename master.m3u8
//             let ffmpegCommand = 'ffmpeg -i ' + rawVideoPath + ' -f dash -hls_playlist 1 ';
//             const ffmpegCommandEnd = '-c:v libx264 -map 0:v:0 -map 0:a:0 -profile:v:0 main -use_timeline 1 -use_template 1 ' + dashManifestPath;
//             if (localContext.data.metadata.stereoscopic === true) { ffmpegCommand += stereoConversion; }
//             ffmpegCommand += ffmpegCommandEnd;
//             await promiseExec(ffmpegCommand);
//           } catch (err) {
//             console.log('ffmpeg error');
//             logger.error(err);
//             await fs.promises.rmdir(localFilePath, { recursive: true });
//             throw err;
//           }
//
//           console.log('Finished ffmpeg on ' + fileId + ', uploading!');
//
//           try {
//             await uploadFile(outputdir, fileId, localContext, app, result.id);
//           } catch (err) {
//             console.log('Error in totality of file upload');
//             logger.error(err);
//             throw err;
//           }
//
//           console.log('Uploaded all files for ' + fileId + ', deleting local copies');
//
//           await fs.promises.rmdir(localFilePath, { recursive: true });
//
//           return;
//         } catch (err) {
//           console.log('Transcoding process error');
//           logger.error(err);
//
//           throw err;
//         }
//       } else {
//         const localFilePath = path.join(appRootPath.path, 'temp_videos', fileId);
//         console.log('File already existed for ' + fileId + ', ' +
//           'just making DB entries and updating URL');
//         const s3Path = path.join('public', localContext.params.videoSource, fileId, 'video');
//         const bucketObjects = await new Promise((resolve, reject) => {
//           s3.listObjects({
//             Bucket: s3BlobStore.bucket,
//             Prefix: s3Path,
//             Marker: ''
//           }, (err, data) => {
//             if (err) {
//               console.log('S3 error');
//               logger.error(err);
//               reject(err);
//             }
//
//             resolve(data.Contents);
//           });
//         });
//
//         if (!localContext.data.metadata.thumbnailUrl ||
//             localContext.data.metadata.thumbnailUrl.length === 0) {
//           console.log('Getting thumbnail from youtube-dl');
//           localContext.params.storageProvider = useStorageProvider();
//           localContext.params.uploadPath = s3Path;
//           await fs.promises.rmdir(localFilePath, { recursive: true });
//           await fs.promises.mkdir(localFilePath, { recursive: true });
//
//           const thumbnailUrlResult = await new Promise((resolve, reject) => {
//             youtubedl.exec(url,
//               ['--get-thumbnail'],
//               { cwd: localFilePath },
//               (err: any, output: any) => {
//                 if (err) {
//                   logger.error(err);
//                   reject(err);
//                 }
//                 resolve(output);
//               });
//           });
//
//           localContext.data.metadata.thumbnailUrl = (thumbnailUrlResult as any)[0];
//           localContext.result.metadata.thumbnailUrl = localContext.data.metadata.thumbnailUrl;
//
//           const localContextClone = _.cloneDeep(localContext);
//           localContextClone.params.parentResourceId = result.id;
//           thumbnailUploadResult = await uploadThumbnailLinkHook()(localContextClone);
//
//           localContext.data.metadata.thumbnailUrl = thumbnailUploadResult.params.thumbnailUrl;
//         } else {
//           localContext.data.metadata.thumbnailUrl = localContext.params.thumbnailUrl;
//         }
//
//         const creationPromises = (bucketObjects as any).map(async (object: any) => {
//           const key = object.Key;
//
//                     const extension = (key.match(extensionRegex)
//             ? key.match(extensionRegex)[1]
//             : 'application') as string;
//                     const mimetype = mimetypeDict[extension];
//
//           localContext.data.url = 'https://' +
//             path.join(config.aws.cloudfront.domain, key);
//           localContext.data.mimeType = mimetype;
//
//           localContext.params.mimeType = mimetype;
//           localContext.params.uploadPath = s3Path;
//
//           if (extension === 'mpd') {
//             localContext.params.skipResourceCreation = true;
//             localContext.params.patchId = result.id;
//             localContext.params.parentResourceId = null;
//             localContext.data.description = localContext.arguments[0].description;
//           } else {
//             localContext.params.skipResourceCreation = false;
//             localContext.params.patchId = null;
//             localContext.params.parentResourceId = result.id;
//             localContext.data.description = 'DASH chunk for ' +
//               localContext.params.videoSource + ' video ' + fileId;
//             localContext.data.name = key.replace(s3Path + '/', '');
//           }
//
//           return await createStaticResourceHook(localContext);
//         });
//
//         await Promise.all(creationPromises);
//
//         await fs.promises.rmdir(localFilePath, { recursive: true });
//
//         console.log('All static-resources created');
//
//         return localContext;
//       }
//     });
//   } else {
//     console.log('Regex for ' + url + ' did not match anything known');
//
//     await app.service('static-resource').remove(result.id);
//
//     throw new BadRequest('Invalid URL');
//   }
// };
//
