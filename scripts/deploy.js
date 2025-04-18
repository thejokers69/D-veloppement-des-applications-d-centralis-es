const hardhat =  require("hardhat");
async function main(){
    const [deployer] = await hardhat.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const Voting = await hardhat.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.deployed();
    console.log("Voting contract deployed to:", voting.address);
}

main()
.then(()=> process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});