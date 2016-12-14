const chai   = require('chai');
const expect = chai.expect;
const spies  = require('chai-spies');
chai.use(spies);

const nock      = require('nock');
const stringify = require('json-stringify-safe');
const utils     = require('../../../utils');

const config = require('../../testConfig');

const Shuttle = require('../../../app/services/shuttle');

describe('shuttle service', () => {

  afterEach(() => nock.cleanAll());

  it('gets lag from burrow and reports to sysdig through statsd', (done) => {
    nock(utils.normalizeHost(`${config.burrow.hostName}:${config.burrow.port}`))
      .get(`/v2/kafka/${config.burrow.kafkaClusterName}/consumer`)
      .reply(200, {
        consumers: [
          'consumerGroupId1',
          'consumerGroupId2'
        ]
      });

    nock(utils.normalizeHost(`${config.burrow.hostName}:${config.burrow.port}`))
      .get(`/v2/kafka/${config.burrow.kafkaClusterName}/consumer/consumerGroupId1/lag`)
      .reply(200, {
        status: {
          partitions: [
            {
              topic: "topicA",
              end:   {
                lag: 25
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 10
              }
            },
            {
              topic: "topicA",
              end:   {
                lag: 30
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 20
              }
            }
          ]
        }
      });

    nock(utils.normalizeHost(`${config.burrow.hostName}:${config.burrow.port}`))
      .get(`/v2/kafka/${config.burrow.kafkaClusterName}/consumer/consumerGroupId2/lag`)
      .reply(200, {
        status: {
          partitions: [
            {
              topic: "topicA",
              end:   {
                lag: 2
              }
            },
            {
              topic: "topicA",
              end:   {
                lag: 3
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 10
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 10
              }
            }
          ]
        }
      });

    const sdc = {
      gauge: () => true
    };
    chai.spy.on(sdc, 'gauge');

    const shuttle = new Shuttle(sdc, config);
    shuttle.shuttleLag()
      .then(() => {
        expect(sdc.gauge).to.have.been.called.exactly(4);
        expect(sdc.gauge).to.have.been.with.exactly('consumerGroupId1_topicA_lag', 55);
        expect(sdc.gauge).to.have.been.with.exactly('consumerGroupId1_topicB_lag', 30);
        expect(sdc.gauge).to.have.been.with.exactly('consumerGroupId2_topicA_lag', 5);
        expect(sdc.gauge).to.have.been.with.exactly('consumerGroupId2_topicB_lag', 20);
        done()
      })
      .catch((err) => done(err || 'fail'));
  });

  it('returns the sum of consumer lag across all topic partitions for a given consumer', (done) => {
    nock(utils.normalizeHost(`${config.burrow.hostName}:${config.burrow.port}`))
      .get(`/v2/kafka/${config.burrow.kafkaClusterName}/consumer/consumerGroupId/lag`)
      .reply(200, {
        status: {
          partitions: [
            {
              topic: "topicA",
              end:   {
                lag: 25
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 10
              }
            },
            {
              topic: "topicA",
              end:   {
                lag: 30
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 20
              }
            }
          ]
        }
      });

    const shuttle = new Shuttle(null, config);
    shuttle.checkConsumerGroupLag('consumerGroupId')
      .then((res) => {
        expect(res).to.eql({
          topicA: 55,
          topicB: 30
        });
        done();
      })
      .catch((err) => done(err || 'fail'));

  });

  it('returns the sum of consumer lag across all topic partitions in all consumer groups', (done) => {
    nock(utils.normalizeHost(`${config.burrow.hostName}:${config.burrow.port}`))
      .get(`/v2/kafka/${config.burrow.kafkaClusterName}/consumer`)
      .reply(200, {
        consumers: [
          'consumerGroupId1',
          'consumerGroupId2'
        ]
      });

    nock(utils.normalizeHost(`${config.burrow.hostName}:${config.burrow.port}`))
      .get(`/v2/kafka/${config.burrow.kafkaClusterName}/consumer/consumerGroupId1/lag`)
      .reply(200, {
        status: {
          partitions: [
            {
              topic: "topicA",
              end:   {
                lag: 25
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 10
              }
            },
            {
              topic: "topicA",
              end:   {
                lag: 30
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 20
              }
            }
          ]
        }
      });

    nock(utils.normalizeHost(`${config.burrow.hostName}:${config.burrow.port}`))
      .get(`/v2/kafka/${config.burrow.kafkaClusterName}/consumer/consumerGroupId2/lag`)
      .reply(200, {
        status: {
          partitions: [
            {
              topic: "topicA",
              end:   {
                lag: 2
              }
            },
            {
              topic: "topicA",
              end:   {
                lag: 3
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 10
              }
            },
            {
              topic: "topicB",
              end:   {
                lag: 10
              }
            }
          ]
        }
      });

    const shuttle = new Shuttle(null, config);
    shuttle.getLagFromBurrow()
      .then((res) => {
        expect(res).to.eql({
          consumerGroupId1: {
            topicA: 55,
            topicB: 30
          },
          consumerGroupId2: {
            topicA: 5,
            topicB: 20
          }
        });
        done();
      })
      .catch((err) => done(err || 'fail'));
  });

  it('sends expected consumer_topic_lag gauges through statsd', () => {
    const burrowResults = {
      consumerGroupId1: {
        topicA: 55,
        topicB: 30
      },
      consumerGroupId2: {
        topicA: 5,
        topicB: 20
      }
    };

    const sdc = {
      gauge: () => true
    };
    chai.spy.on(sdc, 'gauge');

    const shuttle = new Shuttle(sdc, config);
    shuttle.sendLagStatusToSysdig(burrowResults);
    expect(sdc.gauge).to.have.been.called.exactly(4);
    expect(sdc.gauge).to.have.been.with.exactly('consumerGroupId1_topicA_lag', 55);
    expect(sdc.gauge).to.have.been.with.exactly('consumerGroupId1_topicB_lag', 30);
    expect(sdc.gauge).to.have.been.with.exactly('consumerGroupId2_topicA_lag', 5);
    expect(sdc.gauge).to.have.been.with.exactly('consumerGroupId2_topicB_lag', 20);
  });

  it('stops shuttling if an interval exists before starting shuttling', () => {
    const shuttle = new Shuttle(null, config);
    chai.spy.on(shuttle, 'stopLagShuttling');
    shuttle.startLagShuttling(Infinity);
    expect(shuttle.stopLagShuttling).to.have.been.called.once;
    shuttle.stopLagShuttling();
  });

});
