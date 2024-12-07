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
  const { deploy } = hre.deployments;

  await deploy("SimpleDEX", {
    from: deployer,
    // Contract constructor arguments
    args: ["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512","0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"],
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