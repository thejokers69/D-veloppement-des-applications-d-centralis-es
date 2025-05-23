const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    voting = await Voting.deploy();
    await voting.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });
  });

  describe("Adding Candidates", function () {
    it("Should add a candidate", async function () {
      await voting.addCandidate("Alice", "QmSuWZ3L6EyLr4uGiQX44vQ2NHwABEhxrAt5yTCxE6SoEN");
      const candidate = await voting.candidates(0);
      expect(candidate.name).to.equal("Alice");
      expect(candidate.imageCID).to.equal("QmSuWZ3L6EyLr4uGiQX44vQ2NHwABEhxrAt5yTCxE6SoEN");
      expect(candidate.voteCount).to.equal(0);
    });

    it("Should fail if not called by the owner", async function () {
      await expect(
        voting.connect(addr1).addCandidate("Bob", "QmaASbXRURpxgX96i34GFYXWUBqk7zptUTR4ozvA9xvPYA")
      ).to.be.revertedWith("only the owner can call this function.");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await voting.addCandidate("Alice", "QmSuWZ3L6EyLr4uGiQX44vQ2NHwABEhxrAt5yTCxE6SoEN");
      await voting.addCandidate("Bob", "QmaASbXRURpxgX96i34GFYXWUBqk7zptUTR4ozvA9xvPYA");
    });

    it("Should vote for a candidate", async function () {
      await voting.connect(addr1).vote(0);
      const candidate = await voting.candidates(0);
      expect(candidate.voteCount).to.equal(1);
    });

    it("Should fail if already voted", async function () {
      await voting.connect(addr1).vote(0);
      await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("You have already voted.");
    });

    it("Should fail if candidate does not exist", async function () {
      await expect(voting.connect(addr1).vote(2)).to.be.revertedWith("Invalide Candidate");
    });
  });
});
