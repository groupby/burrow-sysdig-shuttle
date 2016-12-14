/*eslint no-console: "off" */
const checker = require('gb-license-check');

const PACKAGE_WHITELIST = {};

checker.run(PACKAGE_WHITELIST, (err) => {
  if (err) {
    console.error('ERROR: Unknown licenses found');
    process.exit(1);
  }

  console.log('License check successful');
});