const bunyan       = require('bunyan');
const PrettyStream = require('bunyan-prettystream');

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

const config = {
  FRAMEWORK_NAME: 'burrow-sysdig-shuttle-tests',
  port:           8080,
  logLevel:       'debug',
  burrow:         {
    hostName:         'localhost',
    port:             8000,
    kafkaClusterName: 'local'
  }
};

const log = bunyan.createLogger({
  name:    config.FRAMEWORK_NAME,
  streams: [
    {
      level:  config.logLevel,
      type:   'raw',
      stream: prettyStdOut
    }
  ]
});

config.log = log;

module.exports = config;
