/* eslint-disable @typescript-eslint/no-var-requires */
const cli = require('cli')
const { ECRClient } = require('@aws-sdk/client-ecr')
const { BatchDeleteImageCommand, DescribeImagesCommand, ECRPUBLICClient } = require('@aws-sdk/client-ecr-public')

cli.enable('status')

const options = cli.parse({
  repoName: [false, 'Name of repository', 'string'],
  public: [false, 'Whether or not the ECR repo is public', 'boolean'],
  region: [false, 'Name of AWS region', 'string']
})

cli.main(async () => {
  try {
    const ecr =
      options.public === true
        ? new ECRPUBLICClient({ region: 'us-east-1' })
        : new ECRClient({ region: options.region || 'us-east-1' })
    const input = { repositoryName: options.repoName || 'etherealengine' }
    const command = new DescribeImagesCommand(input)
    const response = await ecr.send(command)
    const images = response.imageDetails
    const withoutLatest = images.filter(
      (image) =>
        image.imageTags == null ||
        (image.imageTags && image.imageTags.indexOf('latest_dev') < 0 && image.imageTags.indexOf('latest_prod') < 0)
    )
    const sorted = withoutLatest.sort((a, b) => b.imagePushedAt - a.imagePushedAt)
    const toBeDeleted = sorted.slice(10)
    if (toBeDeleted.length > 0) {
      const deleteCommand = new BatchDeleteImageCommand({
        imageIds: toBeDeleted.map((image) => {
          return { imageDigest: image.imageDigest }
        }),
        repositoryName: options.repoName || 'etherealengine'
      })
      await ecr.send(deleteCommand)
      process.exit(0)
    }
  } catch (err) {
    console.log('Error in deleting old ECR images:')
    console.log(err)
  }
})
