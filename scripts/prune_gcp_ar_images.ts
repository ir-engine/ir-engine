/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

/* eslint-disable @typescript-eslint/no-var-requires */

import { v1 } from '@google-cloud/artifact-registry'
import config from '@ir-engine/server-core/src/appconfig'
import { CoreV1Api, KubeConfig } from '@kubernetes/client-node'
import cli from 'cli'

cli.enable('status')

const options = cli.parse({
  repoUrl: [false, 'Name of registry', 'string'],
  repoName: [false, 'Name of repository', 'string'],
  packageName: [false, 'Name of package', 'string'],
  service: [true, 'Name of service', 'string'],
  releaseName: [true, 'Name of release', 'string']
})

const ArtifactRegistryClient = v1.ArtifactRegistryClient

const K8S_PAGE_LIMIT = 50
const ARTIFACT_REGISTRY_BATCH_DELETE_PAGE_SIZE = 50

const getAllPods = async (k8Client, continueValue, labelSelector, pods = []) => {
  const matchingPods = await k8Client.listNamespacedPod({
    namespace: config.server.namespace,
    pretty: 'false',
    _continue: continueValue,
    labelSelector,
    limit: K8S_PAGE_LIMIT
  })
  if (matchingPods?.items) pods = pods.concat(matchingPods.items)
  if (matchingPods.metadata?._continue)
    return await getAllPods(k8Client, matchingPods.metadata._continue, labelSelector, pods)
  else return pods
}

const getParent = (includePackage = false) => {
  const urlSplit = options.repoUrl.split('/')
  const region = urlSplit[0].replace('-docker.pkg.dev', '')
  let returned = `projects/${urlSplit[1]}/locations/${region}/repositories/${options.repoName}`
  if (includePackage) returned += `/packages/${options.packageName}`
  return returned
}

const getAllImages = async (arClient: any, repoName: string, images = [] as any[]) => {
  const input = {
    parent: getParent(false)
  } as any
  const iterableResponse = arClient.listDockerImagesAsync(input)
  for await (const item of iterableResponse) images = images.concat(item)
  return images.filter((image) => new RegExp(repoName).test(image.uri))
}

const deleteImages = async (arClient, toBeDeleted, isCaches) => {
  const parent = isCaches ? getParent(true) + '%2Fcache' : getParent(true)
  const paginated = toBeDeleted.length > ARTIFACT_REGISTRY_BATCH_DELETE_PAGE_SIZE
  const deletePage = paginated ? toBeDeleted.slice(0, 50) : toBeDeleted
  const localOptions = {
    names: deletePage.map((image) => parent + '/versions/' + image.name.split('@')[1]),
    parent
  }
  const [operation] = await arClient.batchDeleteVersions(localOptions)
  if (paginated) return await deleteImages(arClient, toBeDeleted.slice(ARTIFACT_REGISTRY_BATCH_DELETE_PAGE_SIZE))
  return await operation.promise()
}

cli.main(async () => {
  try {
    let matchingPods,
      excludedImageUris = [] as string[],
      currentImages = [] as string[]
    if (options.service !== 'builder') {
      const kc = new KubeConfig()
      kc.loadFromDefault()
      const k8DefaultClient = kc.makeApiClient(CoreV1Api)
      if (options.service === 'instanceserver') {
        matchingPods = await getAllPods(k8DefaultClient, undefined, `agones.dev/role=gameserver`, [])
        const releaseAnnotation = `${options.releaseName}-instanceserver`
        matchingPods = matchingPods.filter(
          (item) => item.metadata.annotations['agones.dev/container'] === releaseAnnotation
        )

        currentImages = matchingPods.map(
          (item) =>
            item.spec.containers.find((container) => container.name === `${options.releaseName}-instanceserver`).image
        )
      } else if (options.repoName !== 'root') {
        matchingPods = await getAllPods(
          k8DefaultClient,
          undefined,
          `app.kubernetes.io/instance=${options.releaseName},app.kubernetes.io/component=${options.service}`,
          []
        )

        currentImages = matchingPods.map(
          (item) => item.spec.containers.find((container) => container.name === 'ir-engine').image.split(':')[1]
        )
      }
      currentImages = [...new Set(currentImages)]
    }

    const arClient = new ArtifactRegistryClient({})

    const images = await getAllImages(arClient, options.repoName || 'ir-engine', [])
    if (!images) return
    const latestImage = images.find(
      (image) =>
        image.tags &&
        (image.tags.indexOf(`latest_${options.releaseName}`) >= 0 ||
          image.tags.indexOf(`latest_${options.releaseName}_cache`) >= 0)
    )
    if (latestImage) {
      const latestImageTime = latestImage.uploadTime
      // ECR automatically supports multi-architecture builds, which results in multiple images/image indexes. In order
      // to not accidentally delete related images, we need to keep all of them for a given tag. Ran into problems
      // trying to inspect the image (and pulling it would be time-consuming), so just checking for images that
      // were made within 10 seconds of the tagged manifest.
      excludedImageUris.push(
        ...images
          .filter(
            (image) =>
              latestImageTime.seconds - image.uploadTime.seconds <= 10000 &&
              latestImageTime.seconds - image.uploadTime.seconds >= 0
          )
          .map((image) => image.uri)
      )
    }
    const currentTaggedImages = images.filter(
      (image) => image.tags && image.tags.some((item) => currentImages.includes(item))
    )
    if (currentTaggedImages) {
      for (let currentTaggedImage of currentTaggedImages) {
        const currentTaggedImageTime = currentTaggedImage.uploadTime
        excludedImageUris.push(
          ...images
            .filter(
              (image) =>
                currentTaggedImageTime.seconds - image.uploadTime.seconds <= 10000 &&
                currentTaggedImageTime.seconds - image.uploadTime.seconds >= 0
            )
            .map((image) => image.uri)
        )
      }
    }
    const withoutLatestOrCurrent = images.filter((image) => excludedImageUris.indexOf(image.uri) < 0)
    const sorted = withoutLatestOrCurrent.sort((a, b) => b.uploadTime.seconds - a.uploadTime.seconds)
    const toBeDeletedImages = sorted.filter((item) => !/%2Fcache@/.test(item.name)).slice(9)
    const toBeDeletedCaches = sorted.filter((item) => /%2Fcache@/.test(item.name)).slice(20)
    if (toBeDeletedImages.length > 0 || toBeDeletedCaches.length > 0) {
      await deleteImages(arClient, toBeDeletedImages, false)
      await deleteImages(arClient, toBeDeletedCaches, true)
    }
    console.log('Pruned GCP Artifact Registry images')
    process.exit(0)
  } catch (err) {
    console.log('Error in deleting old Artifact Registry images:')
    console.log(err)
  }
})
