const rp        = require('request-promise');
const _         = require('lodash');
const stringify = require('json-stringify-safe');
const utils     = require('../../utils');

const getGaugeName = (consumerGroupId, topicName) => `${consumerGroupId}_${topicName}_lag`;

const Shuttle = function (sdc, config) {
  const self = this;

  const log              = config.log;
  const {burrow, kafka}  = config;
  const burrowUrl        = utils.normalizeHost(`${burrow.hostName}:${burrow.port}`);

  let lagCheckInterval = null;

  self.checkConsumerGroupLag = (id) => rp({
    uri:  `${burrowUrl}/v2/kafka/${burrow.kafkaClusterName}/consumer/${id}/lag`,
    json: true
  })
    .then((res) => _.groupBy(res.status.partitions, 'topic'))
    .then((topics) => _.reduce(topics, (acc, parts, topic) => _.set(acc, topic, _.sumBy(parts, 'end.lag')), {}));

  self.getLagFromBurrow = () => rp({
    uri:  `${burrowUrl}/v2/kafka/${burrow.kafkaClusterName}/consumer`,
    json: true
  })
    .then((res) => res.consumers)
    .map((consumer) => [
      consumer,
      self.checkConsumerGroupLag(consumer)
    ], {concurrency: 10})
    .then(_.fromPairs)
    .props();

  self.sendLagStatusToSysdig = (results) => {
    log.info(`Lag status:\n${stringify(results, null, 2)}`);

    return Object.keys(results)
      .forEach((consumer) => Object.keys(results[consumer])
        .forEach((topic) => sdc.gauge(getGaugeName(consumer, topic), results[consumer][topic])));
  };

  self.shuttleLag = () => self.getLagFromBurrow()
    .then(self.sendLagStatusToSysdig)
    .catch((err) => log.error(`Error occurred while shuttling lag stats:\n${stringify(err, null, 2)}`));

  self.startLagShuttling = (intervalMs) => {
    self.stopLagShuttling();
    lagCheckInterval = setInterval(self.shuttleLag, intervalMs);
  };

  self.stopLagShuttling = () => {
    if (lagCheckInterval) {
      clearInterval(lagCheckInterval);
      lagCheckInterval = null;
    }
  };

  return self;

};

module.exports = Shuttle;
