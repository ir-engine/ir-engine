import '@feathersjs/transport-commons';
import { Application } from '@xrengine/server-core/declarations';

export default (app: Application): void => {
    if (typeof app.channel !== 'function') {
        // If no real-time functionality has been configured just return
        return;
    }

    app.on('login', (authResult: any, {connection}: any) => {
        if (connection) app.channel(`userIds/${connection['identity-provider']?.userId as string}`).join(connection);
    });

    app.on('logout', (authResult: any, {connection}: any) => {
        if (connection) app.channel(`userIds/${connection['identity-provider']?.userId as string}`).leave(connection);
    });
};
