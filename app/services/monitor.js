const rp        = require('request-promise');
const _         = require('lodash');
const stringify = require('json-stringify-safe');
const utils     = require('../../utils');
const fs        = require('fs');

const Monitor = function (sdc, config) {
  const self = this;

  const log = config.log;

  let lagCheckInterval = null;

  self.pingk8s = () => {
    rp({
      uri: 'https://35.184.77.83:443/api/v1/namespaces/default/pods/',
      headers: {
        "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJ3aXNkb20tdGVzdGluZyIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJkZWZhdWx0LXRva2VuLWM1eGNmIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImRlZmF1bHQiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI5YTA0NTRlZi0wOTlkLTExZTctODQxYy00MjAxMGE4MDBmYzciLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6d2lzZG9tLXRlc3Rpbmc6ZGVmYXVsdCJ9.pRczxTHgoOehF3sHFQKGytvvhWHDwE60WFCUufibIVSith7iRASIFdkowMeaEcX68nU7OzeGYlmHADjfcaMHJkXRxAOOXNTEz7-N9mGJyhGDK21cbMS7r8QdMidf6rgIMcrrekgwfW227xii9dUG_AQC9dHxvxgqQekfKBtChgUdr5OxeFIsDQ74MKLSPpSgYPew_7OkzVEdYISxwR5y_Svk--Jcto47ietrGwDy9qXFK_WX83tvH3H63u6SmAU3VCAd8y6JuHmcWmozKw2nv-6YskqSyy4dIG8-9yr2MVki6CrFzvl-r_cvWF5-N8lUJfAo9zt8r76CZpKXBllQ7A"
      },
      json: true,
      rejectUnauthorized: false
    })
      .then((res) => {
        res.items.forEach(function (val) {
          val.status.containerStatuses.forEach(function (val) {
            if (val.ready == false) {
              log.warn(`Container '${val.name}' is not ready: ${stringify(val, null, 2)}`);
            }
        });
      });
    });
  };

  self.startk8sMonitoring = (intervalMs) => {
    self.stopLagShuttling();
    lagCheckInterval = setInterval(self.pingk8s, intervalMs);
  };

  self.stopLagShuttling = () => {
    if (lagCheckInterval) {
      clearInterval(lagCheckInterval);
      lagCheckInterval = null;
    }
  };

  return self;
};

module.exports = Monitor;