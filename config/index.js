const bunyan       = require('bunyan');
const PrettyStream = require('bunyan-prettystream');

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

const config = {
  FRAMEWORK_NAME:       'burrow-sysdig-shuttle',
  port:                 8080,
  logLevel:             'debug',
  lagShuttleIntervalMs: 5 * 1000,
  burrow:               {
    hostName:         (process.env.BURROW_HOST || 'localhost'),
    port:             (process.env.BURROW_PORT || 8000),
    kafkaClusterName: (process.env.BURROW_KAFKA_CLUSTER_NAME || 'local')
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
