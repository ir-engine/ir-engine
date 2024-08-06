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


var jwt = require('jsonwebtoken');

const getAppleClientSecret = () => {
  const privateKey = fs.readFileSync('Path to Apple SSO Secret Key File.p8');
  const keyId = "XXXXXXXXXX"; // Key ID of the Secret Key generated in Apple Developer Account.
  const teamId = "XXXXXXXXXX"; // Team ID of the Apple Developer Account. It can be found in the app ID on the Apple Developer Account. 
  const clientId = "XXXXXXXXXX"; // The client ID of the service ID created in the Apple Developer Account.

  const headers = {
    kid: keyId,
    typ: "JWT",
  }
  const claims = {
    'iss': teamId,
    'aud': 'https://appleid.apple.com',
    'sub': clientId,
  }
  token = jwt.sign(claims, privateKey, {
    algorithm: 'ES256',
    header: headers,
    expiresIn: '180d' // The token will expire in 180 days. The token can be set to expire in a shorter time but not more than 6 months.
  });
  return token
}