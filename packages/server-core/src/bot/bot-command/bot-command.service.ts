import { ServiceAddons } from "@feathersjs/feathers";
import hooks from "./Bot-command.hooks"; 
import { Application } from "../../../declarations";
import { BotCommand } from "./bot-command.class";
import createModel from "./bot-command.model";

declare module "../../../declarations" {

    interface ServiceTypes {
        "botCommand": BotCommand & ServiceAddons<any>
    }
}

export default (app: Application): void => {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        multi: true
    };

    const event = new BotCommand(options, app);
    app.use("/bot-command", event);

    const service = app.service("botCommand");

    service.hooks(hooks as any);
    
}