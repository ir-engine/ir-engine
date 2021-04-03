import S3Provider from "../../storage/s3.storage";
import { Application } from '../../declarations';
import config from '../../config';

const s3 = new S3Provider();
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)$/;

const getAssetKey = (value: string, packName: string) => `content-pack/${packName}/assets/${value}`;
const replaceRelativePath = (value: string) => {
    const stripped = value.replace('/assets', '');
    return `https://${config.aws.cloudfront.domain}${stripped}`
}

export function assembleScene (scene: any, contentPack: string): any {
    const uploadPromises = [];
    const worldFile = {
        version: 4,
        root: scene.entities[0].entityId,
        metadata: JSON.parse(scene.metadata),
        entities: {}
    }
    for (const index in scene.entities) {
        const entity = (scene.entities[index] as any);
        const patchedComponents = [];
        for (const index in entity.components) {
            const component = entity.components[index];
            for (let [key,value] of Object.entries(component.props)) {
                if (typeof value === 'string' && key !== 'link') {
                    const regexExec = urlRegex.exec(value);
                    if (regexExec != null) {
                        const promise = new Promise(async (resolve, reject) => {
                            value = regexExec[2];
                            component.props[key] = `/assets${value}`;
                            if (value[0] === '/') value = value.slice(1);
                            const file = await new Promise((resolve, reject) => {
                                s3.provider.getObject({
                                    Bucket: s3.bucket,
                                    Key: value
                                }, (err, data) => {
                                    if (err) {
                                        console.error(err);
                                        reject(err);
                                    } else {
                                        resolve(data);
                                    }
                                });
                            });
                            const uploadToPack = await new Promise((resolve, reject) => {
                                s3.provider.putObject({
                                    ACL: "public-read",
                                    Body: file.Body,
                                    Bucket: s3.bucket,
                                    ContentType: file.ContentType,
                                    Key: getAssetKey(value as string, contentPack)
                                }, (err, data) => {
                                    if (err) {
                                        console.error(err);
                                        reject(err);
                                    } else {
                                        resolve(data);
                                    }
                                });
                            });

                            resolve();
                        });
                        uploadPromises.push(promise);
                    }
                }
            }
            const toBePushed = {
                name: component.name,
                props: component.props
            };
            patchedComponents.push(toBePushed);
        }
        worldFile.entities[entity.entityId] = {
            name: entity.name,
            parent: entity.parent,
            index: entity.index,
            components: patchedComponents
        }
    }
    return {
        worldFile,
        uploadPromises
    };
}

export async function populateScene (scene: any, app: Application): any {
    console.log('populateScene');
    console.log(scene);
    const promises = [];
    const collection = await app.service('collection').create({
        name: scene.metadata.name,
        metadata: scene.metadata,
        version: scene.version,
        isPublic: true,
        type: 'project'
    });
    for (let [key, value] of Object.entries(scene.entities)) {
        const entityResult = await app.service('entity').create({
            entityId: key,
            name: value.name,
            parent: value.parent,
            collectionId: collection.id,
            index: value.index
        });
        console.log('Components:');
        console.log(value.components);
        value.components.forEach(async component => {
            console.log(component);
            for (let [key, value] of Object.entries(component.props)) {
                if (typeof value === 'string' && /^\/assets/.test(value) === true) {
                    component.props[key] = replaceRelativePath(value);
                    // Insert Download/S3 upload
                }
            }
            await app.service('component').create({
                data: component.props,
                entityId: entityResult.id,
                type: component.name
            });
        });
    }
    return Promise.all(promises)
}