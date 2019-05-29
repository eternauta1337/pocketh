pragma solidity ^0.5.7;

library Lib {
  function ret(uint256 value) internal pure returns(uint256) {
    return value;
  }
}

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
  using Lib for uint256;

  uint256 public value;
  uint256 public constant CONS = 42;

  modifier aModifier {
    _;
  }

  modifier anotherModifier(uint256) {
    _;
  }

  constructor() public {
    value = 5;
  }

  function test(uint256 newValue) public aModifier anotherModifier(42) {
    value = newValue;
  }
}
