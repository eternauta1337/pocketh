const cli = require('../utils/cli.js');

describe('inheritance command', () => {
  test('Should properly list the inheritance of Test.sol', async () => {
    const result = await cli('inheritance', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`└─ Test
   ├─ Parent1
   │  └─ GrandParent
   └─ Parent2`);
  });
});
