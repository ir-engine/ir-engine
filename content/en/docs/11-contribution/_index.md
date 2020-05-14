---
title: "Contribution Guidelines"
linkTitle: "Contribution Guidelines"
weight: 11
description: >
  How to contribute to XRChat
---

{{% pageinfo %}}

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

{{% /pageinfo %}}

Pull Request Process:
* Ensure any install or build dependencies are removed before the end of the layer when doing a build.
* Please develop on your own branch and submit PRs for review
* Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
* Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](https://semver.org/).
* Core leadership will accept your Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you * may request the second reviewer to merge it for you.

PR Template:

1. What is the purpose of this PR?
2. What does issue #s are solved by this PR?
3. What unit tests have been put in place?
4. How does our QA team test this PR?
5. What files or features are including in this PR that are not related to the main feature?

Var, func, const, braces, 

https://www.youtube.com/watch?v=Cla1WwguArA

Code Standards
Use linting engine (Standard.js + TypeScript config)
Use automatic code formatter (prettier)
120 char line limit, whenever possible (in code, READMEs)

ES6 Tutorials

Linting - TypeScript, JS and React (JSX)

https://github.com/nvm-sh/nvm

Which engine, tslint or eslint?
A: eslint, see VSCode blog post.

Which config?
A: TypeScript + Standard.js
	https://www.npmjs.com/package/eslint-config-standard-with-typescript 

VisualStudio Code TS linting plugins: 
https://marketplace.visualstudio.com/items?itemName=chenxsan.vscode-standardjs 

Intellij WebStorm linting plugins:

Linting - Markdown

READMEs
https://github.com/RichardLitt/standard-readme
Dev Setup
You will need yarn, npm and Docker at a minimum
Deploy Instructions
Deployment instructions are covered per-repo, however, to deploy the whole develop cluster, please look at github.com/xrchat/xrchat-ops 
Notes & Tools
Kubernetes
https://learnk8s.io/nodejs-kubernetes-guide
https://github.com/learnk8s/knote-js/tree/master/04-05
https://k8slens.dev/
Visual Studio Code

VS Remote WSL & Containers
https://code.visualstudio.com/docs/remote/remote-overview

IntelliCode
https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode 

AWS Toolkit
https://marketplace.visualstudio.com/items?itemName=AmazonWebServices.aws-toolkit-vscode

classdiagram-ts
https://marketplace.visualstudio.com/items?itemName=AlexShen.classdiagram-ts 

JSON to TS
https://marketplace.visualstudio.com/items?itemName=MariusAlchimavicius.json-to-ts

LiveShare https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare

Move TS - Move TypeScript files and update relative imports  https://marketplace.visualstudio.com/items?itemName=stringham.move-ts 

npm Intellisense
https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense

Prettier - Code formatter
https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode 

Docker
https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker

Kubernetes
https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools 

3D Viewer for VSCode
https://marketplace.visualstudio.com/items?itemName=slevesque.vscode-3dviewer

markdownlint
https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint
Reading List
Mozilla Hubs concept/tech comparison
ECS Enabling MMOs
Entity Systems Wiki 
gltf Overview
ECS JS Example
