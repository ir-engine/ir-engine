# Reality Packs

Reality Packs are XREngine's implementation of plugins - a way to extend core functionality with complete and continuous integration right into the heart of everything you'd need as a developer. The engine, UI layout, networking, database, and more.

## Usage

Reality Packs are added per-scene via the editor. Here, various configurables can be specified, such as the point in the update loop the various system entry points are to be registered.

## Structure

The manifest.json of a Reality Pack is how it references it's assets, as well as the entry points to load modules from. Template reality packs are provided under the /templates folder, including a package.json and update-files.js to automate updating the file references. This will only update the files field, entry points, name, version and other data must be specified manually.

## Local Development Flow

Reality Packs exist in the /packs folder as folders themselves, which are .gitignored such that they are not added to the main repository. Instead, the intended flow is that each reality pack folder is a GitHub repository managed seperately by the developer. The @xrengine/projects package is linked in the monorepo such that it has complete access to every piece of code in the repository.

## Deployed Development Flow (still in progress)

Reality Packs will soon also be accessible via the editor. What this looks like is still uncertain.

## Production Flow

Reality Packs ready for production can be added to a deployment via the /admin/reality-packs route by providing the URL to a manifest.json. They must be added from their raw URL. For example, for the [Starter Template](https://github.com/XRFoundation/Starter-Reality-Pack) the URL https://raw.githubusercontent.com/XRFoundation/Starter-Reality-Pack/master/manifest.json must be provided.

# Future Work

Reality Packs are currently considered to still be a work in progress. More functionality, integration, tooling and design is necessary to make this a great experience.