const program = require('commander');

const { version } = require('../package.json');

// Defined commands.
const inheritance = require('./commands/inheritance.js');
const members = require('./commands/members.js');
const commands = [
  inheritance,
  members
];

// Program definition.
program
  .name('pocketh')
  .usage('<command> [options]')

// Register each command in the program.
commands.forEach(command => command.register(program));

// Parse program.
if(!process.argv.slice(3).length) program.help();
else program.parse(process.argv);
