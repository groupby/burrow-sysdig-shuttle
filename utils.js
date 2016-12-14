const _ = require('lodash');

const normalizeHost = (host) => {
  const protocol = /:443($|[/])/.test(host) ? 'https' : 'http';
  const newHost  = _.startsWith(host, 'http') ? host : `${protocol}://${host}`;
  return _.endsWith(newHost, '/') ? newHost.slice(0, -1) : newHost;
};

module.exports = {
  normalizeHost
};
