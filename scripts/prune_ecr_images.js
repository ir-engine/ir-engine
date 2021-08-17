/* eslint-disable @typescript-eslint/no-var-requires */
const cli = require('cli');
const AWS = require('aws-sdk');

cli.enable('status');

const options = cli.parse({
    repoName: [false, 'Name of repository', 'string']
});

cli.main(async () => {
    try {
        const ecrPublic = new AWS.ECRPUBLIC({region: 'us-east-1'});
        const result = await ecrPublic.describeImages({repositoryName: options.repoName || 'xrengine'}).promise();
        const images = result.imageDetails;
        const withoutLatest = images.filter(image => image.imageTags.indexOf('latest_dev') < 0 && image.imageTags.indexOf('latest_prod') < 0);
        const sorted = withoutLatest.sort((a, b) => b.imagePushedAt - a.imagePushedAt);
        const toBeDeleted = sorted.slice(10,);
        if (toBeDeleted.length > 0) {
            const deleteParams = {
                imageIds: toBeDeleted.map(image => { return { imageDigest: image.imageDigest } }),
                repositoryName: options.repoName || 'xrengine'
            };
            await ecrPublic.batchDeleteImage(deleteParams).promise();
        }
    } catch(err) {
        console.log('Error in deleting old ECR images:');
        console.log(err);
    }
});