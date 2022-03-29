const _ = require('lodash');

const toCamel = (s: any) => {
  return s.replace(/([-_][a-z])/gi, ($1: any) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

const isArray = function (a: any) {
  return Array.isArray(a);
};

const isObject = function (o: any) {
  return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const keysToCamel = function (o: any) {
  if (isObject(o)) {
    const n: any = {};

    Object.keys(o).forEach((k) => {
      n[toCamel(k)] = o[k];
    });

    return n;
  } else if (isArray(o)) {
    return o.map((i: any) => {
      return keysToCamel(i);
    });
  }

  return o;
};
const keysToSnake = function (o: any) {
  if (isObject(o)) {
    const n: any = {};

    Object.keys(o).forEach((k) => {
      n[_.snakeCase(k)] = o[k];
    });

    return n;
  } else if (isArray(o)) {
    return o.map((i: any) => {
      return _.snakeCase(i);
    });
  }

  return o;
};

module.exports = {
  keysToCamel,
  keysToSnake,
};