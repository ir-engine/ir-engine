
/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

/* eslint-disable @typescript-eslint/no-var-requires */

const { ECRClient } = require('@aws-sdk/client-ecr')
const { BatchDeleteImageCommand, DescribeImagesCommand, ECRPUBLICClient } = require('@aws-sdk/client-ecr-public')
const k8s = require('@kubernetes/client-node')
const cli = require('cli')

cli.enable('status')

const options = cli.parse({
  repoName: [false, 'Name of repository', 'string'],
  service: [true, 'Name of service', 'string'],
  public: [false, 'Whether or not the ECR repo is public', 'boolean'],
  region: [false, 'Name of AWS region', 'string'],
  releaseName: [true, 'Name of release', 'string']
})

const K8S_PAGE_LIMIT = 1
const ECR_PAGE_LIMIT = 10

const getAllPods = async(k8Client, continueValue, labelSelector, pods = []) => {
  const matchingPods = await k8Client.listNamespacedPod(
      'default',
      'false',
      false,
      continueValue,
      undefined,
      labelSelector,
      K8S_PAGE_LIMIT
  )
  if (matchingPods?.body?.items) pods = pods.concat(matchingPods.body.items)
  if (matchingPods.body.metadata?._continue) return await getAllPods(k8Client, matchingPods.body.metadata._continue, labelSelector, pods)
  else return pods
}

const getAllImages = async(ecr, repoName, token, images=[]) => {
  const input = {
    repositoryName: repoName,
    maxResults: ECR_PAGE_LIMIT
  }
  if (token) input.nextToken = token
  const command = new DescribeImagesCommand(input)
  const response = await ecr.send(command)
  if (response.imageDetails) images = images.concat(response.imageDetails)
  if (response.nextToken) return await getAllImages(ecr, repoName, response.nextToken, images)
  else return images
}

const deleteImages = async(ecr, toBeDeleted) => {
  const thisDelete = toBeDeleted.length >= 100 ? toBeDeleted.slice(0, 100) : toBeDeleted
  const deleteCommand = new BatchDeleteImageCommand({
    imageIds: thisDelete.map((image) => {
      return { imageDigest: image.imageDigest }
    }),
    repositoryName: options.repoName || 'etherealengine'
  })
  await ecr.send(deleteCommand)
  if (toBeDeleted.length >= 100) return await deleteImages(ecr, toBeDeleted.slice(100))
  else return Promise.resolve()
}

cli.main(async () => {
  try {
    let matchingPods,
      excludedImageDigests = [],
      currentImages = []
    if (options.service !== 'builder') {
      const kc = new k8s.KubeConfig()
      kc.loadFromDefault()
      const k8DefaultClient = kc.makeApiClient(k8s.CoreV1Api)
      if (options.service === 'instanceserver') {
        matchingPods = await getAllPods(k8DefaultClient, undefined, `agones.dev/role=gameserver`, [])
        const releaseAnnotation = `${options.releaseName}-instanceserver`
        matchingPods = matchingPods.filter((item) => item.metadata.annotations['agones.dev/container'] === releaseAnnotation)

        currentImages = matchingPods.map(
          (item) =>
            item.spec.containers.find(
              (container) => container.name === `${options.releaseName}-instanceserver`
            ).image
        )
      } else if (options.repoName !== 'root') {
        matchingPods = await getAllPods(k8DefaultClient, undefined, `app.kubernetes.io/instance=${options.releaseName},app.kubernetes.io/component=${options.service}`, [])

        currentImages = matchingPods.map(
          (item) => item.spec.containers.find((container) => container.name === 'etherealengine').image.split(':')[1]
        )
      }
      currentImages = [...new Set(currentImages)]
    }
    const ecr = (
      options.public === true
        ? new ECRPUBLICClient({ region: 'us-east-1' })
        : new ECRClient({ region: options.region || 'us-east-1' })
    )
    const images = await getAllImages(ecr, options.repoName || 'etherealengine', undefined, [])
    if (!images) return
    const latestImage = images.find(
      (image) => image.imageTags && (image.imageTags.indexOf(`latest_${options.releaseName}`) >= 0 || image.imageTags.indexOf(`latest_${options.releaseName}_cache`) >= 0)
    )
    if (latestImage) {
      const latestImageTime = latestImage.imagePushedAt.getTime()
      // ECR automatically supports multi-architecture builds, which results in multiple images/image indexes. In order
      // to not accidentally delete related images, we need to keep all of them for a given tag. Ran into problems
      // trying to inspect the image (and pulling it would be time-consuming), so just checking for images that
      // were made within 10 seconds of the tagged manifest.
      excludedImageDigests.push(
        ...images
          .filter(
            (image) =>
              latestImageTime - image.imagePushedAt.getTime() <= 10000 &&
              latestImageTime - image.imagePushedAt.getTime() >= 0
          )
          .map((image) => image.imageDigest)
      )
    }
    const currentTaggedImages = images.filter(
      (image) => image.imageTags && image.imageTags.some((item) => currentImages.includes(item))
    )
    if (currentTaggedImages) {
      for (let currentTaggedImage of currentTaggedImages) {
        const currentTaggedImageTime = currentTaggedImage.imagePushedAt.getTime()
        excludedImageDigests.push(
          ...images
            .filter(
              (image) =>
                currentTaggedImageTime - image.imagePushedAt.getTime() <= 10000 &&
                currentTaggedImageTime - image.imagePushedAt.getTime() >= 0
            )
            .map((image) => image.imageDigest)
        )
      }
    }
    const withoutLatestOrCurrent = images.filter((image) => excludedImageDigests.indexOf(image.imageDigest) < 0)
    const sorted = withoutLatestOrCurrent.sort((a, b) => b.imagePushedAt.getTime() - a.imagePushedAt.getTime())
    let toBeDeleted = sorted.slice(9)
    if (toBeDeleted.length > 0) {
      await deleteImages(ecr, toBeDeleted)
      process.exit(0)
    } else process.exit(0)
  } catch (err) {
    console.log('Error in deleting old ECR images:')
    console.log(err)
  }
})
