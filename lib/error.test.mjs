/* eslint-disable no-console */

import { simplifyStack } from "./error.mjs";

const subjects = [];

subjects.push(`
ReferenceError: id_token is not defined
 at destroy (/opt/htdocs/development/example/node_modules/express-session/session/session.js:110:15)
              at node:internal/util:375:7
              at new Promise (<anonymous>)
              at destroy (node:internal/util:361:12)
              at file:///opt/htdocs/development/example/lib/router.mjs:107:13
`);

subjects.push(`
InternalError: Manual error
    at file:///opt/htdocs/development/example/lib/router/debug.mjs:21:11
    at Layer.handle [as handle_request] (/opt/htdocs/development/example/node_modules/express/lib/router/layer.js:95:5)
    at next (/opt/htdocs/development/example/node_modules/express/lib/router/route.js:144:13)
    at Route.dispatch (/opt/htdocs/development/example/node_modules/express/lib/router/route.js:114:3)
    at Layer.handle [as handle_request] (/opt/htdocs/development/example/node_modules/express/lib/router/layer.js:95:5)
    at /opt/htdocs/development/example/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/opt/htdocs/development/example/node_modules/express/lib/router/index.js:346:12)
    at next (/opt/htdocs/development/example/node_modules/express/lib/router/index.js:280:10)
    at Function.handle (/opt/htdocs/development/example/node_modules/express/lib/router/index.js:175:3)
    at router (/opt/htdocs/development/example/node_modules/express/lib/router/index.js:47:12)
`);

subjects.push(`
Error: did not find expected authorization request details in session, req.session["oidc:localhost"] is undefined
    at /opt/htdocs/development/orca/node_modules/openid-client/lib/passport_strategy.js:132:13
    at OpenIDConnectStrategy.authenticate (/opt/htdocs/development/orca/node_modules/openid-client/lib/passport_strategy.js:191:5)
    at attempt (/opt/htdocs/development/orca/node_modules/passport/lib/middleware/authenticate.js:369:16)
    at authenticate (/opt/htdocs/development/orca/node_modules/passport/lib/middleware/authenticate.js:370:7)
    at Layer.handle [as handle_request] (/opt/htdocs/development/orca/node_modules/express/lib/router/layer.js:95:5)
    at next (/opt/htdocs/development/orca/node_modules/express/lib/router/route.js:144:13)
    at Route.dispatch (/opt/htdocs/development/orca/node_modules/express/lib/router/route.js:114:3)
    at Layer.handle [as handle_request] (/opt/htdocs/development/orca/node_modules/express/lib/router/layer.js:95:5)
    at /opt/htdocs/development/orca/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/opt/htdocs/development/orca/node_modules/express/lib/router/index.js:346:12)
`);

subjects.push(`
Error: test
    at file:///opt/htdocs/development/devstack/tmp/untitled%20folder/error.test.mjs:1:7
    at ModuleJob.run (node:internal/modules/esm/module_job:194:25)
`);

for (const subject of subjects) {
  let result = simplifyStack(subject, { nodeModules: true });
  console.log(result.trim());
}
