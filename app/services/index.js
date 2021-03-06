const SDC = require('statsd-client');

const Shuttle = require('./shuttle');

const Services = function (config) {

  const self = this;
  const sdc  = new SDC();

  self.shuttle = new Shuttle(sdc, config);

  return self;

};

module.exports = Services;
