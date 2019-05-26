const cli = require('../../src/utils/cli.js');

describe('inheritance command', () => {

  test('Should properly list the inheritance of Test.json', async () => {
    const result = await cli('inheritance', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`└─ Test
   ├─ Parent1
   │  └─ GrandParent
   └─ Parent2`);
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

  test('Should properly list the inheritance of KittyCore.json', async () => {
    const result = await cli('inheritance', './test/artifacts/KittyCore.json');
    expect(result.stdout).toContain(`└─ KittyCore
   └─ KittyMinting
      └─ KittyAuction
         └─ KittyBreeding
            └─ KittyOwnership
               ├─ KittyBase
               │  └─ KittyAccessControl
               └─ ERC721`);
  });

  test('Should properly list the inheritance of KittyCore.sol', async () => {
    const result = await cli('inheritance', './test/contracts/KittyCore.sol');
    expect(result.stdout).toContain(`└─ KittyCore
   └─ KittyMinting
      └─ KittyAuction
         └─ KittyBreeding
            └─ KittyOwnership
               ├─ KittyBase
               │  └─ KittyAccessControl
               └─ ERC721`);
  });
});
