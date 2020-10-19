import { Application as ExpressFeathers } from '@feathersjs/express';
import { Application as Feathers } from '@feathersjs/feathers';

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}
// The application instance type that will be used everywhere else
export type Application = Feathers<ServiceTypes> & ExpressFeathers<ServiceTypes>
