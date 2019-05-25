const cli = require('../../src/utils/cli.js');

describe('inheritance command', () => {
  test('Should output help', async () => expect((await cli('inheritance', '--help')).code).toBe(0));
  test('Should properly list the inheritance of Test.sol', async () => {
    const result = await cli('inheritance', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`└─ Test
   ├─ Parent1
   │  └─ GrandParent
   └─ Parent2`);
  });
});
