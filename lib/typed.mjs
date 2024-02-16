export const isSymbol = (value) => {
  return !!value && value.constructor === Symbol;
};

export const isArray = Array.isArray;

export const isObject = (value) => {
  return !!value && value.constructor === Object;
};

export const isPrimitive = (value) => {
  return (
    value === void 0 || value === null || (typeof value !== "object" && typeof value !== "function")
  );
};

export const isFunction = (value) => {
  return !!(value && value.constructor && value.call && value.apply);
};

export const isString = (value) => {
  return typeof value === "string" || value instanceof String;
};

export const isInt = (value) => {
  return isNumber(value) && value % 1 === 0;
};

export const isFloat = (value) => {
  return isNumber(value) && value % 1 !== 0;
};

export const isNumber = (value) => {
  try {
    return Number(value) === value;
  } catch {
    return false;
  }
};

export const isDate = (value) => {
  return Object.prototype.toString.call(value) === "[object Date]";
};

export const isPromise = (value) => {
  if (!value) return false;
  if (!value.then) return false;
  if (!isFunction(value.then)) return false;
  return true;
};

export const isEmpty = (value) => {
  if (value === true || value === false) return true;
  if (value === null || value === void 0) return true;
  if (isNumber(value)) return value === 0;
  if (isDate(value)) return isNaN(value.getTime());
  if (isFunction(value)) return false;
  if (isSymbol(value)) return false;
  const length = value.length;
  if (isNumber(length)) return length === 0;
  const size = value.size;
  if (isNumber(size)) return size === 0;
  const keys = Object.keys(value).length;
  return keys === 0;
};

export const isEqual = (x, y) => {
  if (Object.is(x, y)) return true;
  if (x instanceof Date && y instanceof Date) {
    return x.getTime() === y.getTime();
  }
  if (x instanceof RegExp && y instanceof RegExp) {
    return x.toString() === y.toString();
  }
  if (typeof x !== "object" || x === null || typeof y !== "object" || y === null) {
    return false;
  }
  const keysX = Reflect.ownKeys(x);
  const keysY = Reflect.ownKeys(y);
  if (keysX.length !== keysY.length) return false;
  for (let i = 0; i < keysX.length; i++) {
    if (!Reflect.has(y, keysX[i])) return false;
    if (!isEqual(x[keysX[i]], y[keysX[i]])) return false;
  }
  return true;
};
