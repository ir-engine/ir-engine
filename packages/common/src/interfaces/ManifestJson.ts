export type ManifestJson = {
  name: string
  /**
   * The version of this project
   * @example "0.0.1"
   */
  version: string
  /**
   * The version of the engine this project version is compatible with.
   * @example "1.0.0"
   */
  engineVersion: string
  /**
   * A short description of the project
   * @example "A simple project"
   */
  description?: string
  /**
   * An optional thumbnail image
   * @example "https://example.com/thumbnail.jpg"
   */
  thumbnail?: string
  /**
   * project-relative path for scene GLTF files
   * @example ["public/scenes/default.gltf"]
   */
  scenes?: string[]
  /**
   * The dependencies of this project. Specify other projects that are to be installed alongside this one.
   * @todo
   * @example { "orgname/reponame": "0.1.2" }
   */
  // dependencies?: Record<string, string>
}
