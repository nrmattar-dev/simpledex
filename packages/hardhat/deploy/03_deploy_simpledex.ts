import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "SimpleDEX" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deploySimpleDEX: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;
  const tokenA = await get("TokenA");
  const tokenB = await get("TokenB");

  console.log("Address del Token A: " + tokenA.address);
  console.log("Address del Token B: " + tokenB.address);

  await deploy("SimpleDEX", {
    from: deployer,
    // Contract constructor arguments
    args: [tokenA.address, tokenB.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  console.log("Simple DEX OK");
};

export default deploySimpleDEX;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags SimpleDEX
deploySimpleDEX.tags = ["SimpleDEX"];
