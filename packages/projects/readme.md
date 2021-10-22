# Projects

## Usage

Projects are git git repositories that  added per-scene via the editor. Here, various configurables can be specified, such as the point in the update loop the various system entry points are to be registered.

## Structure

The manifest.json of a Project is how it references it's assets, as well as the entry points to load modules from. Template projects are provided under the /templates folder, including a package.json and update-files.js to automate updating the file references. This will only update the files field, entry points, name, version and other data must be specified manually.

## Local Development Flow

Projects exist in the /packs folder as folders themselves, which are .gitignored such that they are not added to the main repository. Instead, the intended flow is that each project folder is a GitHub repository managed seperately by the developer. The @xrengine/projects package is linked in the monorepo such that it has complete access to every piece of code in the repository.

## Deployed Development Flow (still in progress)

Projects will soon also be accessible via the editor. What this looks like is still uncertain.

## Production Flow

Projects ready for production can be added to a deployment via the /admin/projects route by providing the URL to a manifest.json. They must be added from their raw URL. For example, for the [Starter Template](https://github.com/XRFoundation/Starter-Project) the URL https://raw.githubusercontent.com/XRFoundation/Starter-Project/master/manifest.json must be provided.

# Future Work

Projects are currently considered to still be a work in progress. More functionality, integration, tooling and design is necessary to make this a great experience.