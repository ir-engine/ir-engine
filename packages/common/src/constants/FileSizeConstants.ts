/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
Ethereal Engine. All Rights Reserved.
*/

//s3.putObject has an upper limit on file size before it starts erroring out. On paper the limit is around 5 GB, but
//in practice, errors were seen at around 2 GB. Setting the limit to 1 GB for safety; above this, files will be
//uploaded via multipart upload instead of a single putObject operation. Part size is set to 100 MB.
//nodejs has an upper limit of 1 or 2 GB on direct file reads and writes (32-bit and 64-bit systems, respectively).
//1 GB is the cutoff for using read/write streams for those as well for consistency
export const MULTIPART_CUTOFF_SIZE = 1000 * 1000 * 1000
export const MULTIPART_CHUNK_SIZE = 100 * 1000 * 1000
