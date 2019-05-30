const cli = require('../../src/utils/cli.js');

describe('inheritance command', () => {

  test('Should properly list the inheritance of Test.json', async () => {
    const result = await cli('inheritance', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`└─ Test
   ├─ Parent1
   │  └─ GrandParent
   └─ Parent2`);
  });

  test('Should properly list the inheritance of Test.json with linearized option', async () => {
    const result = await cli('inheritance', './test/artifacts/Test.json', '--linearized');
    expect(result.stdout).toContain(`├─ Test
├─ Parent2
├─ Parent1
└─ GrandParent`);
  });

  test('Should properly list inheritance of Test.sol', async () => {
    const result = await cli('inheritance', './test/contracts/Test.sol');
    expect(result.stdout).toContain(`└─ Test
   ├─ Parent1
   │  └─ GrandParent
   └─ Parent2`);
  });

  test('Should properly list the inheritance of Sample.json', async () => {
    const result = await cli('inheritance', './test/artifacts/Sample.json');
    expect(result.stdout).toContain(`└─ Sample
   └─ SampleDependency
      └─ SampleAbstract`);
  });

  test('Should properly list the inheritance of Sample.sol', async () => {
    const result = await cli('inheritance', './test/contracts/Sample.sol');
    expect(result.stdout).toContain(`└─ Sample
   └─ SampleDependency
      └─ SampleAbstract`);
  });
});
