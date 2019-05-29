const cli = require('../../src/utils/cli.js');

describe('members command', () => {

  test('Should properly identify the members of Test.sol', async () => {
    const result = await cli('members', './test/artifacts/Test.json', '--disable-colors');
    expect(result.stdout).toContain(`uint256 public value`);
    expect(result.stdout).toContain(`uint256 public constant CONS`);
    expect(result.stdout).toContain(`constructor() public {...}`);
    expect(result.stdout).toContain(`function test(uint256 newValue) public aModifier anotherModifier(42) {...}`);
  });

  test('Should properly identify the members of Test.sol and its ancestors', async () => {
    const result = await cli('members', '--inherited', './test/artifacts/Test.json', '--disable-colors');
    expect(result.stdout).toContain(`uint256 public granparent_value`);
    expect(result.stdout).toContain(`uint256 public parent1_value`);
    expect(result.stdout).toContain(`uint256 public parent2_value`);
    expect(result.stdout).toContain(`uint256 public value`);
    expect(result.stdout).toContain(`uint256 public constant CONS`);
    expect(result.stdout).toContain(`constructor() public {...}`);
    expect(result.stdout).toContain(`function test(uint256 newValue) public aModifier anotherModifier(42) {...}`);
  });
});
