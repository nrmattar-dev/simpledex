// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
// Nahuel Ruiz Mattar
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
 
/**
    * @dev Utilizo el Wizard de OpenZeppelin para crear el TokenB y le asigno 12 mil TokenB al owner.
*/
contract TokenB is ERC20, Ownable {
    constructor()
        ERC20("TokenB", "TKB")
        Ownable(msg.sender) //Defino que el owner es el que deploya el contrato.
    {
        _mint(msg.sender, 12000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
