// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

contract VaultContract {
    uint id;

    struct benificiary {
        uint grant;
        uint maturityTime;
    }

    mapping (address => mapping (uint => benificiary)) beneficiaryGrant;

    function donateGrant(address _beneficiary, uint _maturityTime) external payable{
        require(msg.sender != address(0), "address Zero Detected");
        require(msg.value > 0, "Can't save 0 value");
        uint _id = id +1;
        payable(address(this)).transfer(msg.value);
        beneficiaryGrant[_beneficiary][_id].grant = beneficiaryGrant[_beneficiary][_id].grant + msg.value;
        beneficiaryGrant[_beneficiary][_id].maturityTime= block.timestamp + _maturityTime;
        id++;
    }

    function claimGrant(uint _id) external {
        require(msg.sender != address(0), "address Zero Detected");
        require(beneficiaryGrant[msg.sender][_id].grant > 0, "You don't have any grant");
        require(block.timestamp >  beneficiaryGrant[msg.sender][_id].maturityTime, "Your grant has not matured");
        uint _grant = beneficiaryGrant[msg.sender][_id].grant ;
        beneficiaryGrant[msg.sender][_id].grant = 0;
        payable(msg.sender).transfer(_grant);
    }

    receive() external payable {}

    fallback() external payable {}
}