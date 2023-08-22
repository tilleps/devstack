import validateJS from "validate.js";
import ValidateFailedException from "devstack/exception/validate-failed";

const validate = Object.assign({}, validateJS);

validate.multiple = async function (attributes, constraintsSet, options) {
  if (!Array.isArray(constraintsSet)) {
    constraintsSet = [constraintsSet];
  }

  options = Object.assign(
    {
      wrapErrors: ErrorWrapper
    },
    options
  );

  let results = {};

  for (const constraints of constraintsSet) {
    let result = await this.async.call(this, attributes, constraints, options);

    // @todo deep merge
    Object.assign(results, result);
  }

  return results;
};

export default validate;

function ErrorWrapper(errors, options, attributes, constraints) {
  return new ValidateFailedException(undefined, errors);
}
