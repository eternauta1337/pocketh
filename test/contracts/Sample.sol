pragma solidity ^0.5.0;

import "./SampleDependency.sol";

contract Sample is SampleDependency {
  function testSample() public pure returns (string memory) {
    return "Sample";
  }
}
