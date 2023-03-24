import "./chunk-TFWDKVI3.js";

// ../../node_modules/deep-object-diff/mjs/utils.js
var isDate = (d) => d instanceof Date;
var isEmpty = (o) => Object.keys(o).length === 0;
var isObject = (o) => o != null && typeof o === "object";
var hasOwnProperty = (o, ...args) => Object.prototype.hasOwnProperty.call(o, ...args);
var isEmptyObject = (o) => isObject(o) && isEmpty(o);
var makeObjectWithoutPrototype = () => /* @__PURE__ */ Object.create(null);

// ../../node_modules/deep-object-diff/mjs/diff.js
var diff = (lhs, rhs) => {
  if (lhs === rhs)
    return {};
  if (!isObject(lhs) || !isObject(rhs))
    return rhs;
  const deletedValues = Object.keys(lhs).reduce((acc, key) => {
    if (!hasOwnProperty(rhs, key)) {
      acc[key] = void 0;
    }
    return acc;
  }, makeObjectWithoutPrototype());
  if (isDate(lhs) || isDate(rhs)) {
    if (lhs.valueOf() == rhs.valueOf())
      return {};
    return rhs;
  }
  return Object.keys(rhs).reduce((acc, key) => {
    if (!hasOwnProperty(lhs, key)) {
      acc[key] = rhs[key];
      return acc;
    }
    const difference = diff(lhs[key], rhs[key]);
    if (isEmptyObject(difference) && !isDate(difference) && (isEmptyObject(lhs[key]) || !isEmptyObject(rhs[key])))
      return acc;
    acc[key] = difference;
    return acc;
  }, deletedValues);
};
var diff_default = diff;

// ../../node_modules/deep-object-diff/mjs/added.js
var addedDiff = (lhs, rhs) => {
  if (lhs === rhs || !isObject(lhs) || !isObject(rhs))
    return {};
  return Object.keys(rhs).reduce((acc, key) => {
    if (hasOwnProperty(lhs, key)) {
      const difference = addedDiff(lhs[key], rhs[key]);
      if (isObject(difference) && isEmpty(difference))
        return acc;
      acc[key] = difference;
      return acc;
    }
    acc[key] = rhs[key];
    return acc;
  }, makeObjectWithoutPrototype());
};
var added_default = addedDiff;

// ../../node_modules/deep-object-diff/mjs/deleted.js
var deletedDiff = (lhs, rhs) => {
  if (lhs === rhs || !isObject(lhs) || !isObject(rhs))
    return {};
  return Object.keys(lhs).reduce((acc, key) => {
    if (hasOwnProperty(rhs, key)) {
      const difference = deletedDiff(lhs[key], rhs[key]);
      if (isObject(difference) && isEmpty(difference))
        return acc;
      acc[key] = difference;
      return acc;
    }
    acc[key] = void 0;
    return acc;
  }, makeObjectWithoutPrototype());
};
var deleted_default = deletedDiff;

// ../../node_modules/deep-object-diff/mjs/updated.js
var updatedDiff = (lhs, rhs) => {
  if (lhs === rhs)
    return {};
  if (!isObject(lhs) || !isObject(rhs))
    return rhs;
  if (isDate(lhs) || isDate(rhs)) {
    if (lhs.valueOf() == rhs.valueOf())
      return {};
    return rhs;
  }
  return Object.keys(rhs).reduce((acc, key) => {
    if (hasOwnProperty(lhs, key)) {
      const difference = updatedDiff(lhs[key], rhs[key]);
      if (isEmptyObject(difference) && !isDate(difference) && (isEmptyObject(lhs[key]) || !isEmptyObject(rhs[key])))
        return acc;
      acc[key] = difference;
      return acc;
    }
    return acc;
  }, makeObjectWithoutPrototype());
};
var updated_default = updatedDiff;

// ../../node_modules/deep-object-diff/mjs/detailed.js
var detailedDiff = (lhs, rhs) => ({
  added: added_default(lhs, rhs),
  deleted: deleted_default(lhs, rhs),
  updated: updated_default(lhs, rhs)
});
var detailed_default = detailedDiff;
export {
  added_default as addedDiff,
  deleted_default as deletedDiff,
  detailed_default as detailedDiff,
  diff_default as diff,
  updated_default as updatedDiff
};
//# sourceMappingURL=deep-object-diff.js.map
