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

// Program definition.
program
  .name('pocketh')
  .version(version, '--version')
  .usage('<command> [options]');

// Register each command in the program.
commands.forEach(command => command.register(program));

// Parse program.
if(!process.argv.slice(3).length) program.help();
else program.parse(process.argv);
