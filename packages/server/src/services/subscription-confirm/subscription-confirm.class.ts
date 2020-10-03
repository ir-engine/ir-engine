import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BadRequest } from '@feathersjs/errors';
import chargebee from 'chargebee';

interface Data {}

interface ServiceOptions {}

export class SubscriptionConfirm implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  async get (id: Id, params?: Params): Promise<Data> {
    let chargebeeSubscription;
    const userId = (params as any).query.customer_id;

    try {
      chargebeeSubscription = await chargebee.subscription.retrieve(id).request();
    } catch (err) {
      throw new BadRequest('Invalid Subscription ID');
    }

    if (chargebeeSubscription.customer.id !== userId) {
      throw new BadRequest('Mismatched Customer ID');
    }

    const subscriptionResult = await this.app.service('subscription').find({
      query: {
        id: id,
        userId: userId,
        status: 0
      }
    });
    if ((subscriptionResult as any).total > 0) {
      const subscription = (subscriptionResult as any).data[0];
      const subscriptionType = await this.app.service('subscription-type').get((subscription).plan);
      await this.app.service('subscription').patch(id, {
        status: 1,
        totalSeats: subscriptionType.seats,
        filledSeats: 0,
        unusedSeats: subscriptionType.seats,
        pendingSeats: 0
      });

      try {
        await this.app.service('seat').create({
          subscriptionId: (subscription).id
        }, {
          self: true,
          userId: userId
        });
        return await Promise.resolve({});
      } catch (err) {
        console.log(err);
      }
    } else {
      throw new BadRequest('Invalid subscription information');
    }
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
