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
  require('./commands/txsfast.js'),
  require('./commands/pastevents.js'),
  require('./commands/disassemble.js'),
];

// Register each command in the program.
commands.forEach(command => command.register(program));

// Program definition.
program
  .name('pocketh')
  .usage('<command> [options]')
  .version(version, '-v, --version');

// Parse program.
program.parse(process.argv);
