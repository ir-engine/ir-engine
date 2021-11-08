# Projects

## Usage

Projects are git repositories that act as containers for assets, scenes and scripts. They can be installed and managed from the /admin/projects route. For local development, they can be cloned in the file system, and the database will synchronise.

## Structure

Each project has a few filename conventions.

`<project_name>/routes.tsx`: a file for specifying custom routes
`<project_name>/thumbnail.png`: a thumbnail image
`<project_name>/public/`: a folder for for public assets

A project can also have a package.json to provide custom dependencies. @xrengine/* monorepo dependencies will be symlinked and not needed, but some package managers (such as pnpm) requrie these to be defined. If so, they should be defined in `peerDependencies`.


<!-- The project.json of a Project has a field "xrengine" which contains information such as the thumbnail, as well as the entry points to load modules from. The name field in the package.json should match the name of the repository. -->

## Local Development Flow

Projects exist in the /packages/projects/projects folder of the XREngine repo, which are .gitignored such that they are not added to the main repository. Instead, the intended flow is that each project folder is a repository managed seperately by the developer. The @xrengine/projects package is linked in the monorepo such that it has complete access to every piece of code in the XREngine stack.

# Future Work

Projects are currently considered to still be a work in progress. More functionality, integration, tooling and design is necessary to make this a great experience.
