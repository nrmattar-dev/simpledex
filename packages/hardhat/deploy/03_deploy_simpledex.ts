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

  /*
  Creo una función para que levante los addreses de los token A y B (que se deployan en los pasos previos) y cuya información se guarda
  en /nextjs/contracts/deployedContracts para pasarselo como parámetro al contrato de SimpleDex y automatizar el proceso
  */
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
    //Si estoy haciendo el deploy en Hardhat (Local) va: 31337
    //Si estoy haciendo el deploy en Scroll Sepolia va: 534351
    const networkId = 31337;

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
