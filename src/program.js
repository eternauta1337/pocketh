#!/usr/bin/env node

const program = require('commander');
const { version } = require('../package.json');

// Defined commands.
const commands = [
  require('./commands/inheritance.js'),
  require('./commands/members.js'),
  require('./commands/selectors.js'),
  require('./commands/calldata.js'),
  require('./commands/blockdate.js'),
  require('./commands/txs.js'),
  require('./commands/pastevents.js'),
  require('./commands/disassemble.js'),
  require('./commands/hex2str.js'),
  require('./commands/str2hex.js'),
  require('./commands/transaction.js'),
  require('./commands/block.js'),
  require('./commands/network.js'),
  require('./commands/hex2dec.js'),
  require('./commands/dec2hex.js'),
  require('./commands/convert.js'),
  require('./commands/pad.js'),
];

// Register each command in the program.
commands.forEach(command => command.register(program));

// Program definition.
program
  .name('pocketh')
  .usage('<command> [options]')
  .version(version, '-v, --version')
  .on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

// Parse program.
program.parse(process.argv);

// Show help if no command is entered.
if(process.argv.length === 2) program.help();
