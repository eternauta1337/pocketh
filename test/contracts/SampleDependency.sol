pragma solidity ^0.5.0;

import "./SampleAbstract.sol";

contract SampleDependency is SampleAbstract {

  function testSampleDependency() public pure returns (string memory) {
    return "SampleDependency";
  }

  function test() public pure returns(string memory) {
    return "Implemented";
  }
}
