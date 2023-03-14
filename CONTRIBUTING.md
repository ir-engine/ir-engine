## Contribution Rules

When contributing to this repository, please first discuss the change you wish to make via issue or on our discord at https://discord.gg/xrf.

Please note we have a code of conduct, please follow it in all your interactions with the project.

### Code Standards

We have strict formatting rules for all `.ts` and `.tsx` files. Please use the `npm run format` hook before making a commit to ensure the rules are adhered to. The commit hook will fail if the formatter has not been run and there are formatting issues.

### Pull Request Process

Develop on your own branch and submit PRs for review.

If you are part of the Ethereal Engine development team, please create branches on ths repository, otherwise create a fork and branches to PR.

Ensure any extraneous local project files, installs or build dependencies are removed before making a PR. You may make a seperate PR for adding to the .gitignore.

Before merging in any Pull Request, ensure that all checks pass, particularly the workflow/compile-codebase check. This ensures that the codebase will continue to build and deploy successfully.

You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

### Building new versions

Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is SemVer. (https://semver.org/)



## Pull Request Template

## Summary

* Dot point description of what this PR changes

## Checklist
- [ ] CI/CD checks pass `npm run check`
  - [ ] Linter passing via `npm run lint`
  - [ ] Typescript passing via `npm run check-errors`
  - [ ] Unit & Integration tests passing via `npm run test`
  - [ ] Docker build process passing via `npm run build-client`
- [ ] If this PR is still a WIP, convert to a draft 
- [ ] When this PR is ready, mark it as "Ready for review"
- [ ] Changes have been manually QA'd
- [ ] Changes reviewed by at least 2 approved reviewers

## References

References to relevant issue(s)

closes #_insert number here_

## QA Steps

List any additional steps required to QA the changes of this PR, as well as any supplemental images or videos.

## Reviewers

Reviewers for this PR
@[github id]
