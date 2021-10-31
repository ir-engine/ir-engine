import { saveScene } from '../functions/sceneFunctions'
import { ProgressDialog } from './dialogs/ProgressDialog'
import PerformanceCheckDialog from './dialogs/PerformanceCheckDialog'
import PublishDialog from './dialogs/PublishDialog'
import PublishedSceneDialog from './dialogs/PublishedSceneDialog'
import i18n from 'i18next'
import { SceneManager } from '../managers/SceneManager'
import { client } from '@xrengine/client-core/src/feathers'
import { upload } from '@xrengine/client-core/src/util/upload'
import configs from './configs'

/**
 * getSceneUrl used to create url for the scene.
 *
 * @author Robert Long
 * @param  {any} sceneId
 * @return {string}         [url]
 */
export const getSceneUrl = (sceneId): string => `${configs.APP_URL}/scenes/${sceneId}`

const maxUploadSize = 25

/**
 * publishProject is used to publish project, firstly we save the project the publish.
 *
 * @author Robert Long
 * @param  {any}  project
 * @param  {any}  showDialog
 * @param  {any}  hideDialog
 * @return {Promise}            [returns published project data]
 */
export const publishProject = async (project, showDialog, hideDialog?): Promise<any> => {
  let screenshotUrl
  try {
    const scene = SceneManager.instance.scene

    const abortController = new AbortController()
    const signal = abortController.signal

    // Save the scene if it has been modified.
    if (SceneManager.instance.sceneModified) {
      showDialog(ProgressDialog, {
        title: i18n.t('editor:saving'),
        message: i18n.t('editor:savingMsg'),
        cancelable: true,
        onCancel: () => {
          abortController.abort()
        }
      })
      // saving project.
      project = await saveScene(project.scene_id, signal)

      if (signal.aborted) {
        const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
        error['aborted'] = true
        throw error
      }
    }

    showDialog(ProgressDialog, {
      title: i18n.t('editor:generateScreenshot'),
      message: i18n.t('editor:generateScreenshotMsg')
    })

    // Wait for 5ms so that the ProgressDialog shows up.
    await new Promise((resolve) => setTimeout(resolve, 5))

    // Take a screenshot of the scene from the current camera position to use as the thumbnail
    const screenshot = await SceneManager.instance.takeScreenshot()
    console.log('Screenshot is')
    console.log(screenshot)
    const { blob: screenshotBlob, cameraTransform: screenshotCameraTransform } = screenshot
    console.log('screenshotBlob is')
    console.log(screenshotBlob)

    screenshotUrl = URL.createObjectURL(screenshotBlob)

    console.log('Screenshot url is', screenshotUrl)

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    let { name } = scene.metadata

    name = (project.scene && project.scene.name) || name || SceneManager.instance.scene.name

    // Display the publish dialog and wait for the user to submit / cancel
    const publishParams: any = await new Promise((resolve) => {
      showDialog(PublishDialog, {
        screenshotUrl,
        initialSceneParams: {
          name
        },
        onCancel: () => resolve(null),
        onPublish: resolve
      })
    })

    // User clicked cancel
    if (!publishParams) {
      URL.revokeObjectURL(screenshotUrl)
      hideDialog()
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    // Update the scene with the metadata from the publishDialog
    scene.setMetadata({
      name: publishParams.name,
      previewCameraTransform: screenshotCameraTransform
    })

    showDialog(ProgressDialog, {
      title: i18n.t('editor:publishingScene'),
      message: i18n.t('editor:publishingSceneMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
      }
    })

    // Clone the existing scene, process it for exporting, and then export as a glb blob
    const { glbBlob, chunks } = await SceneManager.instance.exportScene({ scores: true })

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const performanceCheckResult = await new Promise((resolve) => {
      showDialog(PerformanceCheckDialog, {
        chunks,
        onCancel: () => resolve(false),
        onConfirm: () => resolve(true)
      })
    })

    if (!performanceCheckResult) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    // Serialize Editor scene
    const serializedScene = await SceneManager.instance.scene.serialize(project.scene_id)
    const sceneBlob = new Blob([JSON.stringify(serializedScene)], { type: 'application/json' })

    showDialog(ProgressDialog, {
      title: i18n.t('editor:publishingScene'),
      message: i18n.t('editor:publishingSceneMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
      }
    })

    const size = glbBlob.size / 1024 / 1024
    const maxSize = maxUploadSize
    if (size > maxSize) {
      throw new Error(i18n.t('editor:errors.sceneTooLarge', { size: size.toFixed(2), maxSize }))
    }

    showDialog(ProgressDialog, {
      title: i18n.t('editor:publishingScene'),
      message: i18n.t('editor:uploadingThumbnailMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
      }
    })

    // Upload the screenshot file
    const {
      file_id: screenshotId,
      meta: { access_token: screenshotToken }
    } = (await upload(screenshotBlob, undefined, abortController.signal)) as any

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const {
      file_id: glbId,
      meta: { access_token: glbToken }
    }: any = await upload(glbBlob, (uploadProgress) => {
      showDialog(
        ProgressDialog,
        {
          title: i18n.t('editor:publishingScene'),
          message: i18n.t('editor:uploadingSceneMsg', { percentage: Math.floor(uploadProgress * 100) }),
          onCancel: () => {
            abortController.abort()
          }
        },
        abortController.signal
      )
    })

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const {
      file_id: sceneFileId,
      meta: { access_token: sceneFileToken }
    } = (await upload(sceneBlob, undefined, abortController.signal)) as any

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const sceneParams = {
      screenshot_file_id: screenshotId,
      screenshot_file_token: screenshotToken,
      model_file_id: glbId,
      model_file_token: glbToken,
      scene_file_id: sceneFileId,
      scene_file_token: sceneFileToken,
      name: publishParams.name
    }

    try {
      project = await client.service(`/publish-scene/${project.scene_id}`).create({ scene: sceneParams })
    } catch (error) {
      throw new Error(error)
    }

    showDialog(PublishedSceneDialog, {
      sceneName: sceneParams.name,
      screenshotUrl,
      sceneUrl: getSceneUrl(project.scene.scene_id),
      onConfirm: () => {
        hideDialog()
      }
    })
  } finally {
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl)
    }
  }

  return project
}
