#!/usr/bin/env node

const program = require('commander');
const { version } = require('../package.json');
const chalk = require('chalk');
const figlet = require('figlet');
const globals = require('./globals');

// Require all commands.
const commands = globals.commandPaths.map(commandPath => {
  return require(commandPath);
});

// Register each command in the program.
commands.forEach(command => command.register(program));

// Program definition.
program
  .name('pocketh')
  .usage('<command> [options]')
  .version(version, '-v, --version')
  .option('-d, --disable-colors', 'disable colored output')
  .on('--help', displayHelp) // Show custon help with the --help option.
  // Display an error when an unsupported command is entered.
  .on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  });

// Parse program.
program.parse(process.argv);

// Show custom help if no command is entered.
if(process.argv.length === 2) displayHelp();

// Custon main help.
function displayHelp() {
  program.help(() => {

    // Title.
    const str = figlet.textSync(`pocketh`, {font: 'Slant Relief'});
    console.log(chalk`{redBright ${str}}`);

    // Version.
    console.log(chalk`\n          {gray version ${version}}`);

    // Commands list with short description.
    console.log(chalk`\n{red.bold Commands:}`);
    commands.forEach(command => {
      if(command.signature) {
        console.log(chalk`- {blue.bold ${command.signature}} - {gray.italic ${command.description}}`);
      }
    });
    console.log(`\n`);
    process.exit(0);
  });
}
