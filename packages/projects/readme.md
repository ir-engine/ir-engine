# Projects

## Usage

Projects are git repositories that act as containers for assets, scenes and scripts. They can be installed and managed from the /admin/projects route. For local development, they can be cloned in the file system, and the database will synchronise.

## Structure

The project.json of a Project has a field "xrengine" which contains information such as the thumbnail, as well as the entry points to load modules from.

## Local Development Flow

Projects exist in the /packages/projects/projects folder of the XREngine repo, which are .gitignored such that they are not added to the main repository. Instead, the intended flow is that each project folder is a repository managed seperately by the developer. The @xrengine/projects package is linked in the monorepo such that it has complete access to every piece of code in the XREngine stack.

# Future Work

Projects are currently considered to still be a work in progress. More functionality, integration, tooling and design is necessary to make this a great experience.