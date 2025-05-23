// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract Voting {
    struct Candidate {
        string name; // candidate's name
        string imageCID;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public hasVoted;

    uint public candidateCount = 0;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "only the owner can call this function.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCandidate(
        string memory _name,
        string memory _imageCID
    ) public onlyOwner {
        candidates[candidateCount] = Candidate(_name, _imageCID, 0);
        candidateCount++;
    }

    function vote(uint _candidateId) public {
        require(!hasVoted[msg.sender], "You have already voted.");
        require(_candidateId < candidateCount, "Invalide Candidate");
        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount += 1;
    }
}
