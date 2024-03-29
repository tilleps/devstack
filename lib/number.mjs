export const toFloat = (value, defaultValue) => {
  const def = defaultValue === void 0 ? 0 : defaultValue;
  if (value === null || value === void 0) {
    return def;
  }
  const result = parseFloat(value);
  return isNaN(result) ? def : result;
};

export const toInt = (value, defaultValue) => {
  const def = defaultValue === void 0 ? 0 : defaultValue;
  if (value === null || value === void 0) {
    return def;
  }
  const result = parseInt(value);
  return isNaN(result) ? def : result;
};
