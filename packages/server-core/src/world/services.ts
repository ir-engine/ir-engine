import PublishProject from './publish-project/publish-project.service'
import ProjectAsset from './project-asset/project-asset.service'

import MediaSearch from './media-search/media-search.service'
import Project from './project/project.service'
import Meta from './meta/meta.service'
import ResolveMedia from './resolve-media/resolve-media.service'
import Scene from './scene/scene.service'
import SceneListing from './scene-listing/scene-listing.service'

export default [ProjectAsset, PublishProject, MediaSearch, ResolveMedia, Project, Meta, Scene, SceneListing]
