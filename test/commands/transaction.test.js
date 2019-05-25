const cli = require('../../src/utils/cli.js');
jest.setTimeout(60000);

describe('transaction command', () => {
  test('Should output help', async () => expect((await cli('transaction', '--help')).code).toBe(0));
  test('Should properly retrieve a known transaction from mainnet', async () => {
    const result = await cli(
      'transaction', 
      'mainnet',
      '0x95ecb5317de43d2c682e93350f160c10d3a816002ad43f2b67fb631062c1484b'
    );
    expect(result.stdout).toContain(`0x95ecb5317de43d2c682e93350f160c10d3a816002ad43f2b67fb631062c1484b => {
  "blockHash": "0xcabafc45ffe90a54faac651195a5100029d398c08ef81d7b556e412d03f16002",
  "blockNumber": 7729790,
  "from": "0x992E68379eFC08A1c7B8C1E3bD335E87BF9A4b7B",
  "gas": 104068,
  "gasPrice": "1100000000",
  "hash": "0x95ecb5317de43d2c682e93350f160c10d3a816002ad43f2b67fb631062c1484b",
  "input": "0xa9059cbb000000000000000000000000eeff3793df0685d54805b8807d1fd63cc66f9c2f000000000000000000000000000000000000000000000000000000000015011d",
  "nonce": 1664,
  "r": "0xf924c5771646d973657a7cdf3dd58a41eb6956c8a855fc32362d37490070244a",
  "s": "0x6b0d1df736e24e16b52763e95fdd1d0f64571d172b426888202bb6cb09440b20",
  "to": "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d",
  "transactionIndex": 8,
  "v": "0x26",
  "value": "0"
}`);
  });
});
