import EventEmitter from "eventemitter3";
import jwtDecode from "jwt-decode";
import { buildAbsoluteURL } from "url-toolkit";
import { RethrownError } from "@xr3ngine/engine/src/editor/functions/errors";
import { AudioFileTypes, matchesFileTypes } from "./assets/fileTypes";
import configs from "./configs";
import PerformanceCheckDialog from "./dialogs/PerformanceCheckDialog";
import { ProgressDialog } from "./dialogs/ProgressDialog";
import PublishDialog from "./dialogs/PublishDialog";
import PublishedSceneDialog from "./dialogs/PublishedSceneDialog";
const resolveUrlCache = new Map();
const resolveMediaCache = new Map();

const SERVER_URL = (configs as any).SERVER_URL;
const APP_URL = (configs as any).APP_URL;
const FEATHERS_STORE_KEY = (configs as any).FEATHERS_STORE_KEY;

function b64EncodeUnicode(str): string {
  // first we use encodeURIComponent to get percent-encoded UTF-8, then we convert the percent-encodings
  // into raw bytes which can be fed into btoa.
  const CHAR_RE = /%([0-9A-F]{2})/g;
  return btoa(encodeURIComponent(str).replace(CHAR_RE, (_, p1) => String.fromCharCode(("0x" + p1) as any)));
}

const serverEncodeURL = (url): string => {
  // farspark doesn't know how to read '=' base64 padding characters
  // translate base64 + to - and / to _ for URL safety
  return b64EncodeUnicode(url)
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const nonCorsProxyDomains = (SERVER_URL || "").split(",");
  nonCorsProxyDomains.push(SERVER_URL);

function shouldCorsProxy(url): boolean {
  // Skip known domains that do not require CORS proxying.
  try {
    const parsedUrl = new URL(url);
    if (nonCorsProxyDomains.find(domain => parsedUrl.hostname.endsWith(domain))) return false;
  } catch (e) {
    // Ignore
  }

  return true;
}

export const proxiedUrlFor = url => {
  // if (!(url.startsWith("http:") || url.startsWith("https:"))) return url;

  // if (!shouldCorsProxy(url)) {
  //   return url;
  // }

  // return `${SERVER_URL}/${url}`;
  return url;
};
/**
 * [scaledThumbnailUrlFor function component for providing url for scaled thumbnail]
 * @param  {[type]} url    [contains thumbnail url]
 * @param  {[type]} width
 * @param  {[type]} height
 * @return {[type]}        [returns url to get scaled image]
 */
export const scaledThumbnailUrlFor = (url, width, height) => {
  return `${SERVER_URL}/thumbnail/${serverEncodeURL(url)}?w=${width}&h=${height}`;
};

/**
 * CommonKnownContentTypes
 * Object containing common content types.
 * @type {Object}
 */
const CommonKnownContentTypes = {
  gltf: "model/gltf",
  glb: "model/gltf-binary",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mp3: "audio/mpeg"
};
/**
 * [guessContentType function to get contentType from url]
 * @param  {[type]} url
 * @return {[type]}     [contentType]
 */
function guessContentType(url): string {
  const extension = new URL(url).pathname.split(".").pop();
  return CommonKnownContentTypes[extension];
}


/**
 * [Api class contains functions to perform common functions. ]
 * @type {class}
 */
export default class Api extends EventEmitter {
  serverURL: string;
  apiURL: string;
  projectDirectoryPath: string;
  maxUploadSize: number;
  props: any;

  /**
   * [constructor ]
   */
  constructor() {
    super();
    if ((process as any).browser) {
      const { protocol, host } = new URL((window as any).location.href);
      this.serverURL = SERVER_URL;
    }

    this.apiURL = `${SERVER_URL}`;

    this.projectDirectoryPath = "/api/files/";

    // Max size in MB
    this.maxUploadSize = 128;

    // This will manage the not authorized users
    this.handleAuthorization();
  }

  /**
   * function component to check user is valid or not.
   * @param  {[type]}
   * @return {Boolean}   [return true if user is valid else return false]
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(FEATHERS_STORE_KEY);

    return token != null && token.length > 0;
  }

/**
 * [getToken used to get the token of logined user]
 * @return {[string]}        [returns token string]
 */
  getToken(): string {
    const token = localStorage.getItem(FEATHERS_STORE_KEY);

    if (token == null || token.length === 0) {
      throw new Error("Not authenticated");
    }

    return token;
  }
/**
 * [getAccountId used to get accountId using token]
 * @return {[string]}    [returns accountId]
 */
  getAccountId(): string {
    const token = this.getToken();
    return jwtDecode(token).sub;
  }

/**
 * [getProjects used to get list projects created by user]
 * @param  {[type]}  Promise       [description]
 * @param  {[type]}  authorization [description]
 * @return {Promise}               [description]
 */
  async getProjects(): Promise<any> {
    const token = this.getToken();

    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };

    const response = await this.fetchUrl(`${SERVER_URL}/project`, { headers });

    const json = await response.json().catch(err => {
      console.log("Error fetching JSON");
      console.log(err);
    });

    if (!Array.isArray(json.projects) || json.projects == null) {
      throw new Error(`Error fetching projects: ${json.error || "Unknown error."}`);
    }

    return json.projects;
  }

/**
 * [Function to get project data]
 * @type {[type]}
 */
  async getProject(projectId): Promise<JSON> {
    const token = this.getToken();

    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };

    const response = await this.fetchUrl(`${SERVER_URL}/project/${projectId}`, {
      headers
    });

    const json = await response.json();
    console.log("Response: " + Object.values(response));

    return json;
  }
/**
 * [resolveUrl used to request data from specific url
 * if there exist cacheKey cooresponding to request url then return cache key to access data.
 * ]
 * @param  {[string]}  url
 * @param  {[type]}  index
 * @return {Promise}       [returns response data ]
 */
  async resolveUrl(url, index?): Promise<any> {
      return { origin: url };

    const cacheKey = `${url}|${index}`;
    if (resolveUrlCache.has(cacheKey)) return resolveUrlCache.get(cacheKey);
    const request = this.fetchUrl(`${SERVER_URL}/resolve-media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media: { url, index } })
    })
    // client.service("resolve-media").create({ media: { url, index } })
    .then(async response => {
    if (!response.ok) {
        const message = `Error resolving url "${url}":\n  `;
        try {
          const body = await response.text();
          throw new Error(message + body.replace(/\n/g, "\n  "));
        } catch (e) {
          throw new Error(message + response.statusText.replace(/\n/g, "\n  "));
        }
      }
      console.log("Response: " + Object.values(response));

      return response.json();
    }).catch(e => {
      console.warn(e);
    });

    resolveUrlCache.set(cacheKey, request);

    return request;
  }
 /**
  * [fetchContentType is used to get the header content type of response using accessibleUrl]
  * @param  {[type]}  accessibleUrl [ url to make the request]
  * @return {Promise}               [wait for the response and return response]
  */
  async fetchContentType(accessibleUrl): Promise<any> {
    const f = await this.fetchUrl(accessibleUrl, { method: "HEAD" }).then(r => r.headers.get("content-type"));
    console.log("Response: " + Object.values(f));

    return f;
  }

/**
 * [
 *  getContentType is used to get content type url.
 *  we firstly call resolve url and get response.
 *  if result Contains meta property and if meta contains expected_content_type  then returns true.
 *  we get canonicalUrl url from response call guessContentType to check contentType.
 *  and if in both ways we unable to find contentType type then call a request for headers using fetchContentType.
 * ]
 * @param  {[string]}  url
 * @return {Promise}     [returns the contentType]
 */
  async getContentType(url): Promise<any> {
    const result = await this.resolveUrl(url);
    console.log("CONTEXT TYPE IS", result);
    const canonicalUrl = result.origin;
    const accessibleUrl = proxiedUrlFor(canonicalUrl);

    return (
      (result.meta && result.meta.expected_content_type) ||
      guessContentType(canonicalUrl) ||
      (await this.fetchContentType(accessibleUrl))
    );
  }

/**
 * [resolveMedia provides canonicalUrl absoluteUrl and contentType]
 * @param  {[string]}  url
 * @param  {[type]}  index
 * @return {Promise}
 */
  async resolveMedia(url, index): Promise<any> {
    const absoluteUrl = new URL(url, (window as any).location).href;

    if (absoluteUrl.startsWith(this.serverURL)) {
      return { accessibleUrl: absoluteUrl };
    }

    // createing cacheKey for absoluteUrl
    const cacheKey = `${absoluteUrl}|${index}`;
    // if cacheKey already exist in media cache then return the response from cache.
    if (resolveMediaCache.has(cacheKey)) return resolveMediaCache.get(cacheKey);


    const request = (async () => {
      let contentType, canonicalUrl, accessibleUrl;

      // getting contentType, canonicalUrl, accessibleUrl using absoluteUrl.
      try {
        const result = await this.resolveUrl(absoluteUrl);
        canonicalUrl = result.origin;
        accessibleUrl = proxiedUrlFor(canonicalUrl);

        contentType =
          (result.meta && result.meta.expected_content_type) ||
          guessContentType(canonicalUrl) ||
          (await this.fetchContentType(accessibleUrl));
      } catch (error) {
        throw new RethrownError(`Error resolving media "${absoluteUrl}"`, error);
      }

      return { canonicalUrl, accessibleUrl, contentType };
    })();
     // setting cache key for data containing canonicalUrl, accessibleUrl, contentType
    resolveMediaCache.set(cacheKey, request);

    return request;
  }
  /**
   * [proxyUrl used to create an accessibleUrl]
   * @param  {[string]} url [description]
   * @return {[string]}     url
   */
  proxyUrl(url): any {
    return proxiedUrlFor(url);
  }

/**
 * [unproxyUrl provides us absoluteUrl by removing corsProxyPrefix]
 * @param  {[string]} baseUrl
 * @param  {[string]} url
 * @return {[string]}         [absoluteUrl]
 */
  unproxyUrl(baseUrl, url): any {
      const corsProxyPrefix = `${SERVER_URL}/`;

      if (baseUrl.startsWith(corsProxyPrefix)) {
        baseUrl = baseUrl.substring(corsProxyPrefix.length);
      }

      if (url.startsWith(corsProxyPrefix)) {
        url = url.substring(corsProxyPrefix.length);
      }

    // HACK HLS.js resolves relative urls internally, but our CORS proxying screws it up. Resolve relative to the original unproxied url.
    // TODO extend HLS.js to allow overriding of its internal resolving instead
    if (!url.startsWith("http")) {
      url = buildAbsoluteURL(baseUrl, url.startsWith("/") ? url : `/${url}`);
    }

    return proxiedUrlFor(url);
  }

/**
 * [searchMedia function to search media on the basis of provided params.]
 * @param  {[type]}  source
 * @param  {[type]}  params
 * @param  {[type]}  cursor
 * @param  {[type]}  signal
 * @return {Promise}        [result , nextCursor, suggestions]
 */
  async searchMedia(source, params, cursor, signal): Promise<any> {
    const url = new URL(`${SERVER_URL}/media-search`);

    const headers: any = {
      "content-type": "application/json"
    };

    const searchParams = url.searchParams;

    searchParams.set("source", source);

    if (source === "assets") {
      searchParams.set("user", this.getAccountId());
      const token = this.getToken();
      headers.authorization = `Bearer ${token}`;
    }

    if (params.type) {
      searchParams.set("type", params.type);
    }

    if (params.query) {
      //checking BLOCK_SEARCH_TERMSsearchParams.set("q", params.query);
    }

    if (params.filter) {
      searchParams.set("filter", params.filter);
    }

    if (params.collection) {
      searchParams.set("collection", params.collection);
    }

    if (cursor) {
      searchParams.set("cursor", cursor);
    }

    console.log("Fetching...");
    const resp = await this.fetchUrl(url, { headers, signal });
    console.log("Response: " + Object.values(resp));

    if (signal.aborted) {
      const error = new Error("Media search aborted") as any;
      error["aborted"] = true;
      throw error;
    }

    const json = await resp.json();

    if (signal.aborted) {
      const error = new Error("Media search aborted") as any;
      error["aborted"] = true;
      throw error;
    }

    const thumbnailedEntries = json && json.entries && json.entries.length > 0 && json.entries.map(entry => {
      if (entry.images && entry.images.preview && entry.images.preview.url) {
        if (entry.images.preview.type === "mp4") {
          entry.images.preview.url = proxiedUrlFor(entry.images.preview.url);
        } else {
          entry.images.preview.url = scaledThumbnailUrlFor(entry.images.preview.url, 200, 200);
        }
      }
      return entry;
    });

    return {
      results: thumbnailedEntries ? thumbnailedEntries : [],
      suggestions: json.suggestions,
      nextCursor: json.meta?.next_cursor
    };
  }

  searchTermFilteringBlacklist(query: any): any {
    throw new Error("Method not implemented.");
  }

/**
 * [createProject used to create project]
 * @param  {[type]}  scene         [contains the data related to scene]
 * @param  {[type]}  parentSceneId
 * @param  {[type]}  thumbnailBlob [thumbnail data]
 * @param  {[type]}  signal        [used to check if signal is not aborted]
 * @param  {[type]}  showDialog    [shows the message dialog]
 * @param  {[type]}  hideDialog
 * @return {Promise}               [response as json]
 */
  async createProject(scene, parentSceneId, thumbnailBlob, signal, showDialog, hideDialog): Promise<any> {
    this.emit("project-saving");

    if (signal.aborted) {
      throw new Error("Save project aborted");
    }

   // uploading thumbnail providing file_id and meta
    const {
      file_id: thumbnailFileId,
      meta: { access_token: thumbnailFileToken }
    } = await this.upload(thumbnailBlob, undefined, signal) as any;

    if (signal.aborted) {
      throw new Error("Save project aborted");
    }

    const serializedScene = scene.serialize();
    const projectBlob = new Blob([JSON.stringify(serializedScene)], { type: "application/json" });
    const {
      file_id: projectFileId,
      meta: { access_token: projectFileToken }
    } = await this.upload(projectBlob, undefined, signal) as any;

    if (signal.aborted) {
      throw new Error("Save project aborted");
    }

    const token = this.getToken();

    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };

    const project = {
      name: scene.name,
      thumbnail_file_id: thumbnailFileId,
      thumbnail_file_token: thumbnailFileToken,
      project_file_id: projectFileId,
      project_file_token: projectFileToken
    };

    if (parentSceneId) {
      project["parent_scene_id"] = parentSceneId;
    }

    const body = JSON.stringify({ project });

    const projectEndpoint = `${SERVER_URL}/project`;

    const resp = await this.fetchUrl(projectEndpoint, { method: "POST", headers, body, signal });
    console.log("Response: " + Object.values(resp));

    if (signal.aborted) {
      throw new Error("Save project aborted");
    }

    if (resp.status !== 200) {
      throw new Error(`Project creation failed. ${await resp.text()}`);
    }

    const json = await resp.json();

    this.emit("project-saved");

    return json;
  }

/**
 * [deleteProject used to delete project using projectId]
 * @param  {[type]}  projectId
 * @return {Promise}
 */
  async deleteProject(projectId): Promise<any> {
    const token = this.getToken();

    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };

    const projectEndpoint = `${SERVER_URL}/project/${projectId}`;

    const resp = await this.fetchUrl(projectEndpoint, { method: "DELETE", headers });
    console.log("Response: " + Object.values(resp));

    if (resp.status === 401) {
      throw new Error("Not authenticated");
    }

    if (resp.status !== 200) {
      throw new Error(`Project deletion failed. ${await resp.text()}`);
    }

    return true;
  }

/**
 * [saveProject used to save changes in existing project]
 * @param  {[type]}  projectId
 * @param  {[type]}  editor
 * @param  {[type]}  signal
 * @param  {[type]}  showDialog [used to show the message dialog]
 * @param  {[type]}  hideDialog
 * @return {Promise}
 */
  async saveProject(projectId, editor, signal, showDialog, hideDialog): Promise<any> {
    this.emit("project-saving");

    if (signal.aborted) {
      throw new Error("Save project aborted");
    }

    const thumbnailBlob = await editor.takeScreenshot(512, 320); // Fixed blob undefined

    if (signal.aborted) {
      throw new Error("Save project aborted");
    }

    const {
      file_id: thumbnailFileId,
      meta: { access_token: thumbnailFileToken }
    } = await this.upload(thumbnailBlob, undefined, signal, projectId) as any;

    if (signal.aborted) {
      throw new Error("Save project aborted");
    }

    const serializedScene = editor.scene.serialize();
    const projectBlob = new Blob([JSON.stringify(serializedScene)], { type: "application/json" });
    const {
      file_id: projectFileId,
      meta: { access_token: projectFileToken }
    } = await this.upload(projectBlob, undefined, signal) as any;

    if (signal.aborted) {
      throw new Error("Save project aborted");
    }

    const token = this.getToken();

    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };

    const project = {
      name: editor.scene.name,
      thumbnail_file_id: thumbnailFileId,
      thumbnail_file_token: thumbnailFileToken,
      project_file_id: projectFileId,
      project_file_token: projectFileToken
    };

    const sceneId = editor.scene.metadata && editor.scene.metadata.sceneId ? editor.scene.metadata.sceneId : null;

    if (sceneId) {
      project["scene_id"] = sceneId;
    }

    const body = JSON.stringify({
      project
    });
    // console.log("EDITOR JSON IS");
    // console.log(project);

    const projectEndpoint = `${SERVER_URL}/project/${projectId}`;
    // Calling api to save project
    const resp = await this.fetchUrl(projectEndpoint, { method: "PATCH", headers, body, signal });
    console.log("Response: " + Object.values(resp));

    const json = await resp.json();

    if (signal.aborted) {
      throw new Error("Save project aborted");
    }

    if (resp.status !== 200) {
      throw new Error(`Saving project failed. ${await resp.text()}`);
    }

    this.emit("project-saved");

    return json;
  }

/**
 * [getProjectFile is used to open the scene using Id]
 */
  async getProjectFile(sceneId): Promise<any> {
    return await this.props.api.getScene(sceneId);
    // TODO: Make this a main branch thing
    // const scene = await this.props.api.getScene(sceneId);
    // return await this.props.api.fetch(scene.scene_project_url).then(response => response.json());
  }

/**
 * [getScene used to Calling api to get scene data using id]
 */
  async getScene(sceneId): Promise<JSON> {
    const headers = {
      "content-type": "application/json"
    };

    const response = await this.fetchUrl(`${SERVER_URL}/project/${sceneId}`, {
      headers
    });

    console.log("Response: " + Object.values(response));

    const json = await response.json();

    return json.scenes[0];
  }

/**
 * [getSceneUrl used to create url for the scene]
 * @param  {[String]} sceneId
 * @return {[String]}         [url]
 */
  getSceneUrl(sceneId): string {
      return `${APP_URL}/scenes/${sceneId}`;
  }

/**
 * [publishProject is used to publish project, firstly we save the project the publish]
 * @param  {[type]}  project
 * @param  {[type]}  editor
 * @param  {[type]}  showDialog
 * @param  {[type]}  hideDialog
 * @return {Promise}            [returns published project data]
 */
  async publishProject(project, editor, showDialog, hideDialog?): Promise<any> {
    let screenshotUrl;
    try {
      const scene = editor.scene;

      const abortController = new AbortController();
      const signal = abortController.signal;

      // Save the scene if it has been modified.
      if (editor.sceneModified) {
        showDialog(ProgressDialog, {
          title: "Saving Project",
          message: "Saving project...",
          cancelable: true,
          onCancel: () => {
            abortController.abort();
          }
        });
      // saving project.
        project = await this.saveProject(project.project_id, editor, signal, showDialog, hideDialog);

        if (signal.aborted) {
          const error = new Error("Publish project aborted");
          error["aborted"] = true;
          throw error;
        }
      }

      showDialog(ProgressDialog, {
        title: "Generating Project Screenshot",
        message: "Generating project screenshot..."
      });

      // Wait for 5ms so that the ProgressDialog shows up.
      await new Promise(resolve => setTimeout(resolve, 5));

      // Take a screenshot of the scene from the current camera position to use as the thumbnail
      const screenshot = await editor.takeScreenshot();
      console.log("Screenshot is");
      console.log(screenshot);
      const { blob: screenshotBlob, cameraTransform: screenshotCameraTransform } = screenshot;
      console.log("screenshotBlob is");
      console.log(screenshotBlob);

      screenshotUrl = URL.createObjectURL(screenshotBlob);

      console.log("Screenshot url is", screenshotUrl);

      if (signal.aborted) {
        const error = new Error("Publish project aborted");
        error["aborted"] = true;
        throw error;
      }

      const userInfo = this.getUserInfo() as any;

      // Gather all the info needed to display the publish dialog
      let { name, creatorAttribution, allowRemixing, allowPromotion } = scene.metadata;

      name = (project.scene && project.scene.name) || name || editor.scene.name;

      if (project.scene) {
        allowPromotion = project.scene.allow_promotion;
        allowRemixing = project.scene.allow_remixing;
        creatorAttribution = project.scene.attributions.creator || "";
      } else if ((!creatorAttribution || creatorAttribution.length === 0) && userInfo && userInfo.creatorAttribution) {
        creatorAttribution = userInfo.creatorAttribution;
      }

      const contentAttributions = scene.getContentAttributions();

      // Display the publish dialog and wait for the user to submit / cancel
      const publishParams: any = await new Promise(resolve => {
        showDialog(PublishDialog, {
          screenshotUrl,
          contentAttributions,
          initialSceneParams: {
            name,
            creatorAttribution: creatorAttribution || "",
            allowRemixing: typeof allowRemixing !== "undefined" ? allowRemixing : false,
            allowPromotion: typeof allowPromotion !== "undefined" ? allowPromotion : false
          },
          onCancel: () => resolve(null),
          onPublish: resolve
        });
      });

      // User clicked cancel
      if (!publishParams) {
        URL.revokeObjectURL(screenshotUrl);
        hideDialog();
        const error = new Error("Publish project aborted");
        error["aborted"] = true;
        throw error;
      }

      // Update the scene with the metadata from the publishDialog
      scene.setMetadata({
        name: publishParams.name,
        creatorAttribution: publishParams.creatorAttribution,
        allowRemixing: publishParams.allowRemixing,
        allowPromotion: publishParams.allowPromotion,
        previewCameraTransform: screenshotCameraTransform
      });

      // Save the creatorAttribution to localStorage so that the user doesn't have to input it again
      this.setUserInfo({ creatorAttribution: publishParams.creatorAttribution });

      showDialog(ProgressDialog, {
        title: "Publishing Scene",
        message: "Exporting scene...",
        cancelable: true,
        onCancel: () => {
          abortController.abort();
        }
      });

      // Clone the existing scene, process it for exporting, and then export as a glb blob
      const { glbBlob, scores } = await editor.exportScene(abortController.signal, { scores: true });

      if (signal.aborted) {
        const error = new Error("Publish project aborted");
        error["aborted"] = true;
        throw error;
      }

      const performanceCheckResult = await new Promise(resolve => {
        showDialog(PerformanceCheckDialog, {
          scores,
          onCancel: () => resolve(false),
          onConfirm: () => resolve(true)
        });
      });

      if (!performanceCheckResult) {
        const error = new Error("Publish project canceled");
        error["aborted"] = true;
        throw error;
      }

      // Serialize Editor scene
      const serializedScene = editor.scene.serialize();
      const sceneBlob = new Blob([JSON.stringify(serializedScene)], { type: "application/json" });

      showDialog(ProgressDialog, {
        title: "Publishing Scene",
        message: `Publishing scene`,
        cancelable: true,
        onCancel: () => {
          abortController.abort();
        }
      });

      const size = glbBlob.size / 1024 / 1024;
      const maxSize = this.maxUploadSize;
      if (size > maxSize) {
        throw new Error(`Scene is too large (${size.toFixed(2)}MB) to publish. Maximum size is ${maxSize}MB.`);
      }

      showDialog(ProgressDialog, {
        title: "Publishing Scene",
        message: "Uploading thumbnail...",
        cancelable: true,
        onCancel: () => {
          abortController.abort();
        }
      });

      // Upload the screenshot file
      const {
        file_id: screenshotId,
        meta: { access_token: screenshotToken }
      } = await this.upload(screenshotBlob, undefined, abortController.signal) as any;

      if (signal.aborted) {
        const error = new Error("Publish project aborted");
        error["aborted"] = true;
        throw error;
      }

      const {
        file_id: glbId,
        meta: { access_token: glbToken }
      }: any = await this.upload(glbBlob, uploadProgress => {
        showDialog(
          ProgressDialog,
          {
            title: "Publishing Scene",
            message: `Uploading scene: ${Math.floor(uploadProgress * 100)}%`,
            onCancel: () => {
              abortController.abort();
            }
          },
          abortController.signal
        );
      });

      if (signal.aborted) {
        const error = new Error("Publish project aborted");
        error["aborted"] = true;
        throw error;
      }

      const {
        file_id: sceneFileId,
        meta: { access_token: sceneFileToken }
      } = await this.upload(sceneBlob, undefined, abortController.signal) as any;

      if (signal.aborted) {
        const error = new Error("Publish project aborted");
        error["aborted"] = true;
        throw error;
      }

      const sceneParams = {
        screenshot_file_id: screenshotId,
        screenshot_file_token: screenshotToken,
        model_file_id: glbId,
        model_file_token: glbToken,
        scene_file_id: sceneFileId,
        scene_file_token: sceneFileToken,
        allow_remixing: publishParams.allowRemixing,
        allow_promotion: publishParams.allowPromotion,
        name: publishParams.name,
        attributions: {
          creator: publishParams.creatorAttribution,
          content: publishParams.contentAttributions
        }
      };

      const token = this.getToken();

      const headers = {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      };
      const body = JSON.stringify({ scene: sceneParams });

      const resp = await this.fetchUrl(
        `${SERVER_URL}/publish-project/${project.project_id}`,
        {
          method: "POST",
          headers,
          body
        }
      );

      console.log("Response: " + Object.values(resp));

      if (signal.aborted) {
        const error = new Error("Publish project aborted");
        error["aborted"] = true;
        throw error;
      }

      if (resp.status !== 200) {
        throw new Error(`Scene creation failed. ${await resp.text()}`);
      }

      project = await resp.json();

      showDialog(PublishedSceneDialog, {
        sceneName: sceneParams.name,
        screenshotUrl,
        sceneUrl: this.getSceneUrl(project.scene.scene_id),
        onConfirm: () => {
          this.emit("project-published");
          hideDialog();
        }
      });
    } finally {
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl);
      }
    }

    return project;
  }

/**
 * [upload used to upload image as blob data]
 * @param  {[type]}  blob
 * @param  {[type]}  onUploadProgress
 * @param  {[type]}  signal
 * @param  {[type]}  projectId
 * @param  {[type]}  port
 * @return {Promise}
 */
  async upload(blob, onUploadProgress, signal?, projectId?): Promise<void> {
    let host, port;
    const token = this.getToken();

    return await new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      const onAbort = () => {
        request.abort();
        const error = new Error("Upload aborted");
        error.name = "AbortError";
        error["aborted"] = true;
        reject(error);
      };

      if (signal) {
        signal.addEventListener("abort", onAbort);
      }
      console.log("Posting to: ", `${SERVER_URL}/media`);

      request.open("post", `${SERVER_URL}/media`, true);

      request.upload.addEventListener("progress", e => {
        if (onUploadProgress) {
          onUploadProgress(e.loaded / e.total);
        }
      });

      request.addEventListener("error", error => {
        if (signal) {
          signal.removeEventListener("abort", onAbort);
        }
        reject(new RethrownError("Upload failed", error));
      });

      request.addEventListener("load", () => {
        if (signal) {
          signal.removeEventListener("abort", onAbort);
        }

        if (request.status < 300) {
          const response = JSON.parse(request.responseText);
          resolve(response);
        } else {
          reject(new Error(`Upload failed ${request.statusText}`));
        }
      });

      const formData = new FormData();
      if (projectId) {
        formData.set("projectId", projectId);
      }
      formData.set("media", blob);

      request.setRequestHeader('Authorization', `Bearer ${token}`);

      request.send(formData);
    });
  }
 /**
  * [uploadAssets used to upload asset files ]
  * @param  {[type]} editor     [contains editor data]
  * @param  {[type]} files      [files for upload]
  * @param  {[type]} onProgress
  * @param  {[type]} signal
  * @return {[type]}            [uploaded file assets]
  */
  uploadAssets(editor, files, onProgress, signal): any {
    return this._uploadAssets(`${SERVER_URL}/static-resource`, editor, files, onProgress, signal);
  }

/**
 * [_uploadAssets used as api handler for uploadAsset]
 * @param  {[type]}  endpoint
 * @param  {[type]}  editor
 * @param  {[type]}  files
 * @param  {[type]}  onProgress
 * @param  {[type]}  signal
 * @return {Promise}            [assets file data]
 */
  async _uploadAssets(endpoint, editor, files, onProgress, signal): Promise<any> {
    const assets = [];

    for (const file of Array.from(files)) {
      if (signal.aborted) {
        break;
      }

      const abortController = new AbortController();
      const onAbort = () => abortController.abort();
      signal.addEventListener("abort", onAbort);

      const asset = await this._uploadAsset(
        endpoint,
        editor,
        file,
        progress => onProgress(assets.length + 1, files.length, progress),
        abortController.signal
      );

      assets.push(asset);
      signal.removeEventListener("abort", onAbort);

      if (signal.aborted) {
        break;
      }
    }

    return assets;
  }

/**
 * [uploadAsset used to upload single file as asset]
 * @param {[type]} editor
 * @param {[type]} file
 * @param {[type]} onProgress
 * @param {[type]} signal
 */
  uploadAsset(editor, file, onProgress, signal): any {
    return this._uploadAsset(`${SERVER_URL}/static-resource`, editor, file, onProgress, signal);
  }

/**
 * [uploadProjectAsset used to call _uploadAsset directly]
 * @param {[type]} editor
 * @param {[type]} projectId
 * @param {[type]} file
 * @param {[type]} onProgress
 * @param {[type]} signal
 */
  uploadProjectAsset(editor, projectId, file, onProgress, signal): any {
    return this._uploadAsset(
      `${SERVER_URL}/project/${projectId}/assets`,
      editor,
      file,
      onProgress,
      signal
    );
  }

  lastUploadAssetRequest = 0;
/**
 * [_uploadAsset used as api handler for the uploadAsset]
 * @param  {[type]}  endpoint
 * @param  {[type]}  editor
 * @param  {[type]}  file
 * @param  {[type]}  onProgress
 * @param  {[type]}  signal
 * @return {Promise}            [uploaded asset file data]
 */
  async _uploadAsset(endpoint, editor, file, onProgress, signal): Promise<any> {
    let thumbnailFileId = null;
    let thumbnailAccessToken = null;

    if (!matchesFileTypes(file, AudioFileTypes)) {
      const thumbnailBlob = await editor.generateFileThumbnail(file);

      const response = await this.upload(thumbnailBlob, undefined, signal) as any;

      thumbnailFileId = response.file_id;
      thumbnailAccessToken = response.meta.access_token;
    }

    const {
      file_id: assetFileId,
      meta: { access_token: assetAccessToken, expected_content_type: expectedContentType },
      origin: origin
    } = await this.upload(file, onProgress, signal) as any;

    const delta = Date.now() - this.lastUploadAssetRequest;

    if (delta < 1100) {
      await new Promise(resolve => setTimeout(resolve, 1100 - delta));
    }

    const token = this.getToken();

    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };

    const body = JSON.stringify({
      asset: {
        name: file.name,
        file_id: assetFileId,
        access_token: assetAccessToken,
        thumbnail_file_id: thumbnailFileId,
        thumbnail_access_token: thumbnailAccessToken
      }
    });

    // const resp = await this.fetchUrl(endpoint, { method: "POST", headers, body, signal });
    // console.log("Response: " + Object.values(resp));
    //
    // const json = await resp.json();
    //
    // const asset = json.assets[0];
    //
    this.lastUploadAssetRequest = Date.now();

    return {
      id: assetFileId,
      name: file.name,
      url: origin,
      type: 'application/octet-stream',
      attributions: {},
      images: {
        preview: { url: file.thumbnail_url }
      }
    };
  }

/**
 * [deleteAsset used to delete existing asset using assetId]
 * @param  {[type]}  assetId
 * @param  {[type]}  authorization
 * @return {Promise}               [true if deleted successfully else throw error]
 */
  async deleteAsset(assetId): Promise<any> {
    const token = this.getToken();

    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };

    const assetEndpoint = `${SERVER_URL}/static-resource/${assetId}`;

    const resp = await this.fetchUrl(assetEndpoint, { method: "DELETE", headers });
    console.log("Response: " + Object.values(resp));

    if (resp.status === 401) {
      throw new Error("Not authenticated");
    }

    if (resp.status !== 200) {
      throw new Error(`Asset deletion failed. ${await resp.text()}`);
    }

    return true;
  }

/**
 * [deleteProjectAsset used to delete asset for specific project]
 * @param  {[type]}  projectId
 * @param  {[type]}  assetId
 * @param  {[type]}  authorization
 * @return {Promise}               [true if deleted successfully else throw error]
 */
  async deleteProjectAsset(projectId, assetId): Promise<any> {
    const token = this.getToken();

    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };

    const projectAssetEndpoint = `${SERVER_URL}/project/${projectId}/assets/${assetId}`;

    const resp = await this.fetchUrl(projectAssetEndpoint, { method: "DELETE", headers });
    console.log("Response: " + Object.values(resp));

    if (resp.status === 401) {
      throw new Error("Not authenticated");
    }

    if (resp.status !== 200) {
      throw new Error(`Project Asset deletion failed. ${await resp.text()}`);
    }

    return true;
  }

/**
 * [setUserInfo used to save userInfo as localStorage]
 * @param userInfo [Object contains user data]
 */
  setUserInfo(userInfo): void {
    localStorage.setItem("editor-user-info", JSON.stringify(userInfo));
  }

/**
 * [getUserInfo used to provide logined user info from localStorage]
 * @return {[Object]}      [User data]
 */
  getUserInfo(): JSON {
    return JSON.parse(localStorage.getItem("editor-user-info"));
  }

  saveCredentials(email, token): void {
    // localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify({ credentials: { email, token } }));
  }

/**
 * [fetchUrl used as common api handler]
 * @param  {[String]}  url
 * @param  {[type]}  options [contains request options]
 * @return {Promise}         [response from api]
 */
  async fetchUrl(url, options: any = {}): Promise<any> {
      const token = this.getToken();
      if (options.headers == null) {
        options.headers = {};
      }
      options.headers.authorization = `Bearer ${token}`;
      console.log("Post to: ", url);
      console.log("Options");
      console.log(options);
      const res = await fetch(url, options).catch((error) => {
        console.log(error);
        if (error.message === "Failed to fetch") {
          error.message += " (Possibly a CORS error)";
        }
        throw new RethrownError(`Failed to fetch "${url}"`, error);
      });
      console.log(res);
      if (res.ok) {
        return res;
      }

      const err = new Error(
        `Network Error: ${res.status || "Unknown Status."} ${res.statusText || "Unknown Error. Possibly a CORS error."}`
      );
      err["response"] = res;
      throw err;
  }

/**
 * [handleAuthorization used to save credentials in local storage]
 */
  handleAuthorization(): void {
    if ((process as any).browser) {
      const accessToken = localStorage.getItem(FEATHERS_STORE_KEY);
      const email = 'test@test.com';
      if((accessToken && email) || this.isAuthenticated()){
        this.saveCredentials(email, accessToken);
      }
    }
  }
}
