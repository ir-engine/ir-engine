const resolveObject = (obj: any): any => {
  if (obj?.dataValues) {
    return { ...obj.dataValues };
  }
  return obj;
};

export const resolveModelData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(obj => resolveObject(obj));
  }

  return resolveObject(data);
};
