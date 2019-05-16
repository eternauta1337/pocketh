pragma solidity ^0.5.7;

contract GrandParent {
  uint256 public granparent_value;
}

contract Parent1 is GrandParent {
  uint256 public parent1_value;
}

contract Parent2 {
  uint256 public parent2_value;
}

contract Test is Parent1, Parent2 {
  uint256 public value;
  uint256 public constant CONS = 42;

  constructor() public {
    value = 5;
  }

  function test(uint256 newValue) public {
    value = newValue;
  }
}
