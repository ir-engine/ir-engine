import { Service, SequelizeServiceOptions } from "feathers-sequelize";
import { Application } from "../../../declarations";
import { Params } from "@feathersjs/feathers";
export class Bot extends Service {
    app: Application
    docs: any

    constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
        super(options);
        this.app = app;
    }

    async find (params: Params): Promise<any> {
        const bots = await (this.app.service("bot") as any).Model.findAll({
            include: (this.app.service("bot-command") as any).Model,
               // required: false
               
            // raw: true,
            // nest: true
        });

       // console.log(JSON.stringify(bots, null, 2));  
        return {
            data: bots
        };
    }
}