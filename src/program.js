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
  require('./commands/info.js'),
  require('./commands/hex2uint.js'),
  require('./commands/uint2hex.js'),
  require('./commands/convert.js'),
  require('./commands/pad.js'),
  require('./commands/compile.js'),
  require('./commands/storage.js'),
  require('./commands/liststorage.js'),
  require('./commands/checksum.js'),
  require('./commands/selector.js'),
  require('./commands/docyul.js'),
  require('./commands/int2hex.js'),
  require('./commands/hex2int.js'),
];

// Register each command in the program.
commands.forEach(command => command.register(program));

// Program definition.
program
  .name('pocketh')
  .usage('<command> [options]')
  .version(version, '-v, --version')
  .option('-d, --disable-colors', 'disable colored output')
  .on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

// Parse program.
program.parse(process.argv);

// Show help if no command is entered.
if(process.argv.length === 2) program.help();
