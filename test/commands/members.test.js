const cli = require('../utils/cli.js');

describe('members command', () => {

  test('Should properly identify the members of Test.sol', async () => {
    const result = await cli('members', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`uint256 public value;
constructor() public {...}
function test(uint256 newValue) public {...}`);
  });

  test('Should properly identify the members of Test.sol and its ancestors', async () => {
    const result = await cli('members', '--inherited', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`(Test) uint256 public value;
(Test) constructor() public {...}
(Test) function test(uint256 newValue) public {...}
(Parent1) uint256 public parent1_value;
(GrandParent) uint256 public granparent_value;
(Parent2) uint256 public parent2_value;`);
  });
});
