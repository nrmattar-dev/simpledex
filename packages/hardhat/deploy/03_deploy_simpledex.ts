import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import deployedContracts from "../../nextjs/contracts/deployedContracts";

/**
 * Deploys a contract named "SimpleDEX" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deploySimpleDEX: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const addresses = getTokenAddresses();

  console.log("Se rescata el Token A: " + addresses?.TokenA);
  console.log("Se rescata el Token B: " + addresses?.TokenB);

  await deploy("SimpleDEX", {
    from: deployer,
    // Contract constructor arguments
    args: [addresses?.TokenA, addresses?.TokenB],
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

function getTokenAddresses(): { TokenA: string; TokenB: string } | null {
  try {
    //31337 > Local
    //534351 > Scroll Sepolia
    const networkId = 534351;

    const tokenAAddress = deployedContracts[networkId]?.TokenA?.address;
    const tokenBAddress = deployedContracts[networkId]?.TokenB?.address;

    if (!tokenAAddress || !tokenBAddress) {
      throw new Error("Las direcciones de TokenA o TokenB no están definidas.");
    }

    return {
      TokenA: tokenAAddress,
      TokenB: tokenBAddress,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching contract addresses:", error.message);
    } else {
      console.error("An unknown error occurred");
    }

    // Retornamos null en caso de error
    return null;
  }
}
