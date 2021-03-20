import { Hook, HookContext } from '@feathersjs/feathers';

export const validateGet = async (context: HookContext): Promise<HookContext> => {
    const q = context.params.query;
    switch(q.type) {
      case 'user-thumbnail':
        if (q.fileSize < process.env.MIN_THUMBNAIL_FILE_SIZE || q.fileSize > process.env.MAX_THUMBNAIL_FILE_SIZE)
          throw new Error('Thumbnail file size is outside the desired range.');
        break;
      case 'avatar':
        if (q.fileSize < process.env.MIN_AVATAR_FILE_SIZE || q.fileSize > process.env.MAX_AVATAR_FILE_SIZE)
          throw new Error('Avatar file size is outside the desired range.');

        const allowedExtenstions = process.env.AVATAR_FILE_ALLOWED_EXTENSIONS.split(',');
        if (!allowedExtenstions.includes(q.fileName.substring(q.fileName.lastIndexOf('.'))))
          throw new Error('Avatar file type is not allowed.');
        break;
      default:
        break;
    }
    return context;
}

export const checkDefaultResources = async (context: HookContext): Promise<HookContext> => {
  const q = context.params.query.keys;

  const defaultResources = await context.app.service('static-resource').find({
    query: {
      key: {
        $in: q,
      },
      userId: null,
    }
  });

  if (defaultResources.total > 0) throw new Error("Default resources can't be deleted.");
  return context;
}