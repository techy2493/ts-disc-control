import nconf from 'nconf';

// Command-line arguments
nconf.argv();

// Environment variables
nconf.env();

// Default configuration file
nconf.file('./config.json');

export default nconf.get();