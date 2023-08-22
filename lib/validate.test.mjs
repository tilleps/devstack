import validate from "./validate.mjs";

validate.validators.password = function (value, options, key, attributes) {
  const field = options.field || "username";

  const username = attributes[field];
  const password = value;

  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (username === "derp" && value === "valid") {
        resolve();
      } else {
        resolve("is incorrect");
      }
    }, 500);
  });
};

validate.validators.throw = function (value, options, key, attributes) {
  return new Promise(function (resolve, reject) {
    reject(new Error("Intentional error"));
  });
};

const input = {
  username: "test",
  password: "valid"
};

const constraints = {
  username: {
    presence: true
  },
  password: {
    length: {
      minimum: 2
    },
    password: {}
  }
};

try {
  const validValues = await validate.multiple(input, constraints);
  console.log("validValues", validValues);
} catch (err) {
  console.log("ERR", err);
}

const multipleConstraints = [
  {
    username: {
      presence: true
    },
    password: {
      presence: true,
      password: {}
    }
  },
  {
    password: {
      length: {
        //minimum: 10
      },
      password: {}
    }
  }
];

try {
  const validValues = await validate.multiple(input, multipleConstraints);
  console.log("validValues", validValues);
} catch (err) {
  console.log("ERR2", err);

  //throw err;
}

//
//  Throw
//
(async function () {
  const constraints = {
    username: {
      throw: true
    }
  };

  try {
    const validValues = await validate.multiple(input, constraints);
    console.log("validValues", validValues);
  } catch (err) {
    console.log("ERR", err);
  }
})();
