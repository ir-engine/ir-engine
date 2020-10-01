import dauria from 'dauria';
import { Hook, HookContext } from '@feathersjs/feathers';
import * as path from 'path';
import _ from 'lodash';
import { extension } from 'mime-types';

export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    if (!context.data.uri && context.params.file) {
      const file = context.params.file;
      const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
      context.data = { uri: uri };
    }

    if (!context.data.id && _.has(context, 'params.uploadPath')) {
      const uploadPath = _.get(context, 'params.uploadPath');
      if (context.params.file.originalname === 'blob') {
        const fileExtenstion = String(extension(context.params.file.mimetype));
        context.data.id = uploadPath
          ? `${uploadPath as string}.${fileExtenstion}`
          : `${(context.params.file.originalname as string)}.${fileExtenstion}`;
      } else {
        context.data.id = uploadPath
          ? path.join(uploadPath, context.params.file.originalname)
          : context.params.file.originalname;
      }
    }

    return context;
  };
};
