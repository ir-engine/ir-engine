
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


import path from 'path'
import { readFileSync } from 'node:fs';
import { koa } from '@feathersjs/koa'
import serve from 'koa-static';
import send from 'koa-send';
import packageRoot from 'app-root-path'
import { createServer } from 'https';
import { createServer as _createServer } from 'http';
import dotenv from 'dotenv'
dotenv.config({ path: process.cwd() + '/../../.env.local' })



const app = new koa();
const HOST = process.env.VITE_APP_HOST || '0.0.0.0';
const PORT = parseInt(process.env.HOST_PORT) || 3000;
const HTTPS = process.env.VITE_LOCAL_BUILD ?? false;
const key = process.env.KEY || 'certs/key.pem'
const cert = process.env.CERT || 'certs/cert.pem'

app.use(serve(path.join(packageRoot.path, 'packages', 'client', 'dist'), {
  brotli: true,
  setHeaders: (ctx) => {
    ctx.setHeader('Origin-Agent-Cluster', '?1')
  }
}));

app.use(async (ctx) => {
  await send(ctx, path.join('dist', 'index.html'), {
    root: path.join(packageRoot.path, 'packages', 'client')
  });
});

app.listen = function () {
  let server;
  if (HTTPS) {
    const pathedkey = readFileSync(path.join(packageRoot.path, key))
    const pathedcert = readFileSync(path.join(packageRoot.path, cert))
    server = createServer({key: pathedkey, cert: pathedcert }, this.callback());
  } else {
    server = _createServer(this.callback());
  }
  return server.listen.apply(server, arguments);
};
app.listen(PORT, HOST, () => console.log(`Server listening on port: ${PORT}`));
