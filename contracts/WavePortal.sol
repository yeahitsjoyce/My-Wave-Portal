// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
contract WavePortal {
    uint totalWaves;
    uint private seed;

    event NewWave(address indexed from, uint256 timestamp, string message);


    struct Wave{
        address sender;
        string message;
        uint256 timestamp;
    }
    Wave[] waves;
    mapping (address => uint256) public lastWavedAt;
    constructor() payable{
        console.log("Hello my name is Joycelyne");
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function wave(string memory _message) public{
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            "Please wait 15m between waves"
        );

        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves+= 1;
        console.log("%s has waved!", msg.sender);

        waves.push(Wave(msg.sender, _message, block.timestamp));
        console.log("Recieved a new wave message: %s" , _message);

        emit NewWave(msg.sender, block.timestamp, _message);


        uint256 prizeAmount = 0.01 ether; 
        seed = (block.timestamp + block.difficulty +seed) % 100;

        if (seed<= 2){
            console.log("%s has won!", msg.sender);
            require(
                prizeAmount <= address(this).balance, 
                "Trying to widthdraw more money than the contract has"
            );

            (bool success, )=  (msg.sender).call{value: prizeAmount}("");
            require(success," Failed, widthdraw more money than the contract");
        }
    }

    function getAllWaves () public view returns(Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256){
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }
}