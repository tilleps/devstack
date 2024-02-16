import { toInt } from "./number.mjs";
import { isPrimitive } from "./typed.mjs";

/**
 * Sets a hidden (non-enumerable) property on the `target` object, copying it
 * from `source`.
 *
 * This is useful when we want to protect certain data from being accidentally
 * leaked through logs, also when the property is non-enumerable on the `source`
 * object and we want to ensure that it is properly copied.
 *
 * Object.defineProperty(config, "secret", { enumerable: false });
 *
 * @see https://blog.coderspirit.xyz/blog/2023/06/05/knex-credentials-leak/
 * @param {object} target
 * @param {object} source - default: target
 * @param {string} propertyName - default: 'password'
 */
export function setHiddenProperty(target, source, propertyName = "password") {
  if (!source) {
    source = target;
  }

  // THIS IS THE IMPORTANT PART
  Object.defineProperty(target, propertyName, {
    enumerable: false,
    value: source[propertyName]
  });
}

export const clone = (obj) => {
  if (isPrimitive(obj)) {
    return obj;
  }
  if (typeof obj === "function") {
    return obj.bind({});
  }
  const newObj = new obj.constructor();
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    newObj[prop] = obj[prop];
  });
  return newObj;
};

export const get = (value, path, defaultValue) => {
  const segments = path.split(/[\.\[\]]/g);
  let current = value;
  for (const key of segments) {
    if (current === null) return defaultValue;
    if (current === void 0) return defaultValue;
    if (key.trim() === "") continue;
    current = current[key];
  }
  if (current === void 0) return defaultValue;
  return current;
};

export const set = (initial, path, value) => {
  if (!initial) return {};
  if (!path || value === void 0) return initial;
  const segments = path.split(/[\.\[\]]/g).filter((x) => !!x.trim());
  const _set = (node) => {
    if (segments.length > 1) {
      const key = segments.shift();
      const nextIsNum = toInt(segments[0], null) === null ? false : true;
      node[key] = node[key] === void 0 ? (nextIsNum ? [] : {}) : node[key];
      _set(node[key]);
    } else {
      node[segments[0]] = value;
    }
  };
  const cloned = clone(initial);
  _set(cloned);
  return cloned;
};
