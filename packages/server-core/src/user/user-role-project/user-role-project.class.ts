import { Service, SequelizeServiceOptions } from "feathers-sequelize";
import { Application } from "../../../declarations";


/**
 * A class for user role project 
 * 
 * @author KIMENYI Kevin
 */

export class UserRoleProject extends Service {
    
    constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
        super(options);
    }
}