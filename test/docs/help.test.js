const globals = require('../../src/globals.js');
const cli = require('../../src/utils/cli.js');
const path = require('path');
jest.setTimeout(60000);

describe('help', () => {

  test('Main program should output help, and the help should be custom', async () => {
    const result = await cli('--help');
    expect(result.code).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
    expect(result.stdout).toContain('_/\\\\\\_'); // Part of the figlet output.
  });

  test('Main program should output help when no command is specified', async () => {
    const result = await cli();
    expect(result.code).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
  });

  test('All commands should output help', async () => {
  
    // Get all command files.
    const commands = globals.commandPaths;

    // Trigger help on all commands.
    const promises = commands.map((command) => {
      const commandName = path.basename(command).split('.')[0];
      return cli(commandName, '--help');
    });

    // Verify all promises.
    const results = await Promise.all(promises);
    results.map(result => {
      expect(result.code).toBe(0);
      expect(result.stdout.length).toBeGreaterThan(0);
    });
  });
});
