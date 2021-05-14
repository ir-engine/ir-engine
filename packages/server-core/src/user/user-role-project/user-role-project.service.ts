import { ServiceAddons } from "@feathersjs/feathers";
import { Application } from "../../../declarations";
import { UserRoleProject } from "./user-role-project.class";
import createModel from "./user-role-project.model";
import hooks from "./user-role-project.hook";

declare module '../../../declarations' {
    interface ServiceTypes {
        'user-role-project': UserRoleProject & ServiceAddons<any>;
    }
}

export default function (app: Application): void {
    const options = {
        Model: createModel(app),
        paginate: app.get('paginate')
    };

    const event = new UserRoleProject(options, app);
    app.use('/user-role-project', event);

    const service = app.service('user-role-project');

    service.hooks(hooks as any);
}