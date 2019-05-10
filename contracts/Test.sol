pragma solidity ^0.5.7;

contract Test {
  uint256 public value;

  constructor() public {
    value = 5;
  }

  function test(uint256 newValue) public {
    value = newValue;
  }
}
