/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// Add unit tests for new patterns in packages/common/tests/regex.test.ts

/*
A filename is valid if:
  - it has 4 to 64 characters
  - its first and last character are alphanumeric
  - any other characters are either alphanumeric, '_', '-', or '.'
*/

// eslint-disable-next-line no-control-regex
export const VALID_FILENAME_REGEX = /^([^_\W])([\w\-\.]{2,62})([^_\W])$/
// eslint-disable-next-line no-control-regex
export const WINDOWS_RESERVED_NAME_REGEX = /^(con|prn|aux|nul|com\d|lpt\d)$/i
export const VALID_SCENE_NAME_REGEX = VALID_FILENAME_REGEX
export const VALID_HEIRARCHY_SEARCH_REGEX = /[.*+?^${}()|[\]\\]/g

// =====================================================================
// ========================= ID Regex Patterns =========================
// =====================================================================

/**
 * This regex is used to validate a string that conforms to the UUID version 4 format. It ensures that the string consists of exactly 32 hexadecimal digits arranged in the 8-4-4-4-12 pattern, separated by hyphens.
 */
export const USER_ID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/

/**
 * Email regex. Source: https://fightingforalostcause.net/content/misc/2006/compare-email-regex.php
 */
export const EMAIL_REGEX =
  /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i

/**
 * This regex is useful for validating input that must be exactly 10 digits long, such as a phone number (without any separators or formatting).
 */
export const PHONE_REGEX = /^[0-9]{10}$/

/**
 * This regex is used to validate strings that should consist of exactly 8 hexadecimal digits.
 */
export const INVITE_CODE_REGEX = /^[0-9a-fA-F]{8}$/

// =========================================================================
// ========================= GitHub Regex Patterns =========================
// =========================================================================

/**
 * This regular expression is designed to match GitHub repository URLs in both SSH and HTTPS formats. Group 2 captures the owner and repository name.
 * - For eg: `git@github.com:user/repo.git`
 * - `user/repo` => Group 1
 */
export const GITHUB_URL_REGEX = /(?:git@github.com:|https:\/\/github.com\/)([a-zA-Z0-9_\-]+\/[a-zA-Z0-9_\-]+)(\.git)?$/

/**
 * This regex is useful for extracting the owner and repository name from GitHub HTTPS URLs that contain authentication credentials in the URL itself. Group 1 captures the owner and Group 2 captures the repository name.
 * - For eg: `https://username:password@github.com/owner/repository-name.git`
 * - `owner` => Group 1
 * - `repository-name` => Group 2
 */
export const PUBLIC_SIGNED_REGEX = /https:\/\/[\w\d\s\-_]+:[\w\d\s\-_]+@github.com\/([\w\d\s\-_]+)\/([\w\d\s\-_]+).git$/

/**
 * This regex is useful for extracting the owner and repository name from GitHub HTTPS URLs that contain OAuth2 token or credentials in the URL itself. Group 1 captures the owner and Group 2 captures the repository name.
 * - For eg: `https://oauth2:token123@github.com/owner/repository-name.git`
 * - `owner` => Group 1
 * - `repository-name` => Group 2
 */
export const INSTALLATION_SIGNED_REGEX = /https:\/\/oauth2:[\w\d\s\-_]+@github.com\/([\w\d\s\-_]+)\/([\w\d\s\-_]+).git$/

// ==============================================================================
// ========================= Project Key Regex Patterns =========================
// ==============================================================================

/**
 * This regex is used to match specific file paths or directory structures that start with `projects/`, followed by one or more valid characters (letters, digits, hyphens, underscores, or forward slashes), and end with `/assets/`
 */
export const ASSETS_REGEX = /projects\/+[a-zA-Z0-9-_@]+\/[a-zA-Z0-9-_]+\/assets\//

/**
 * This regex matches strings that start with `projects/`, followed by one or more characters that can be letters, digits, hyphens, underscores, or forward slashes.
 */
export const PROJECT_REGEX = /projects\/+[a-zA-Z0-9-_@]+\/[a-zA-Z0-9-_]/

/**
 * This regex matches strings that start with `projects/`, followed by one or more characters that can be letters, digits, hyphens, underscores, or forward slashes, and then `/public/`.
 */
export const PROJECT_PUBLIC_REGEX = /projects\/+[a-zA-Z0-9-_@]+\/[a-zA-Z0-9-_]+\/public\//

/**
 * This regex matches strings that start with `projects/`, followed by one or more characters that can be letters, digits, hyphens, underscores, or forward slashes, and then `/thumbnails/`.
 */
export const PROJECT_THUMBNAIL_REGEX = /projects\/+[a-zA-Z0-9-_@]+\/[a-zA-Z0-9-_]+\/thumbnails\//

export const VALID_PROJECT_NAME = /^(?!\s)[\w\-\s]+$/

// =======================================================================
// ========================= Helm Regex Patterns =========================
// =======================================================================

export const MAIN_CHART_REGEX = /ir-engine-([0-9]+\.[0-9]+\.[0-9]+)/g
export const BUILDER_CHART_REGEX = /ir-engine-builder-([0-9]+\.[0-9]+\.[0-9]+)/g
