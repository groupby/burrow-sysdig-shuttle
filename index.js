const express   = require('express');
const http      = require('http');
const stringify = require('json-stringify-safe');

const Services = require('./app/services');
const config   = require('./config');
const log      = config.log;

log.info(`Starting ${config.FRAMEWORK_NAME} with config:\n${stringify(config, null, 2)}`);

const app    = express();
app.services = new Services(config);
app.services.shuttle.startLagShuttling(config.lagShuttleIntervalMs);
app.services.monitor.startk8sMonitoring(config.k8sIntervalMs);

log.info(`Started lag shuttle for every ${config.lagShuttleIntervalMs} ms.`);

const server = http.createServer(app);

// Graceful shutdown from SIGTERM
process.on('SIGTERM', () => {
  log.warn('SIGTERM received stopping server...');
  server.close(() => {
    log.warn('Server stopped, exiting ...');
    process.exit(0);
  });
});

server.listen(config.port, () => {
  log.info(`${config.FRAMEWORK_NAME} listening on port ${config.port}.`);
});

module.exports = app;
