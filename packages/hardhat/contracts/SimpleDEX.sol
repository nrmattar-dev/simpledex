// SPDX-License-Identifier: MIT
// Nahuel Ruiz Mattar
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
    * @dev defino un tokenA y un tokenB de tipo interface de IERC20.
    Por otro lado, determino los decimals para cuando tenga que hacer el getprice.
*/
contract SimpleDEX is Ownable {

    IERC20 private tokenA;
    IERC20 private tokenB;
    uint256 private decimals = 10**18;    
    event constructed(address owner, address tokenA, address tokenB);

    /**
        * @dev defino el owner como el msg.sender que crea el usuario.
        * @param _tokenA recibo el address del tokenA.
        * @param _tokenB recibo el address del tokenB.
    */
    constructor(address _tokenA, address _tokenB) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);

        emit constructed(msg.sender, address(tokenA), address(tokenB));
    }

    /**
        * @dev genero un evento cuando se agrega liquidez.
    */
    event LiquidityAdded(uint256 amountA, uint256 amountB);

    /**
        * @dev me aseguro de que ingrese la misma cantidad de tokens A que de tokens B.
    */
    modifier isAmountEquivalent(uint256 amountA, uint256 amountB)
    {
        uint256 tokenABalance;
        uint256 tokenBBalance;
        
        (tokenABalance, tokenBBalance) = getBalances();

        if (tokenBBalance > 0) //Es 0 cuando es la primera vez y en ese caso no realizo la validación.
        {
            /* Para que se mantenga la equivalencia, el cociente entre la cantidad de A y B del contrato, debe ser igual al del input. 
            Si tengo 500 TokenA y 1000 Token B y voy a ingresar 250 Token A, tengo que ingresar sí o sí 500 Token B */        

            require(((tokenABalance*decimals)/tokenBBalance) == ((amountA*decimals)/amountB), "The amount must be equivalent");
        }
        _;
    }

    /**
        * @dev addLiquidity: Transfiero desde el owner de los tokens (msg.sender) a este contrato (address(this)).
        Previo a esto, es preciso que el owner (msg.sender) autorice la transferencia.
    */
    function addLiquidity(uint256 amountA, uint256 amountB) external onlyOwner() isAmountEquivalent(amountA, amountB) {
        //Debo hacer un approve del owner al contrato este.
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        emit LiquidityAdded(amountA, amountB);
    }

    /**
        * @dev genero un evento cuando se quita liquidez.
    */
    event LiquidityRemoved(uint256 amountA, uint256 amountB);

    /**
        * @dev removeLiquidity: Transfiero los tokens de este contrato al owner (msg.sender).
    */
    function removeLiquidity(uint256 amountA, uint256 amountB) external onlyOwner() isAmountEquivalent(amountA, amountB) {
        //Debo hacer un approve del owner al contrato este.
        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);
        emit LiquidityRemoved(amountA, amountB);
    }

    /**
        * @dev en pos de encapsular código, swapAforB y swapBforA llaman a una misma funcion privada llamada swap.
    */    
    function swapAforB(uint256 amountAIn) external {
        swap(address(tokenA), address(tokenB), amountAIn);
    }

    function swapBforA(uint256 amountBIn) external {
        swap(address(tokenB), address(tokenA), amountBIn);
    }

    /**
        * @dev genero un evento cuando se realiza un swap.
    */
    event TokensSwapped(
        address spenderAddress,
        address tokenAddressIn,
        uint256 amountIn,
        address tokenAddressOut,
        uint256 amountOut
    );

    /**
        * @dev creo una función que me devuelva los balances de cada token.
    */
    function getBalances() private view returns(uint256, uint256)
    {
        uint256 tokenABalance = tokenA.balanceOf(address(this));
        uint256 tokenBBalance = tokenB.balanceOf(address(this));

        return (tokenABalance, tokenBBalance);
    }

    /**
        * @dev swap se utiliza para realizar los intercambios.
        * @param tokenInAddress indica qué token estoy recibiendo.
        * @param tokenOutAddress indica qué token voy a enviar.
        * @param amountIn indica la cantidad de tokens enviados por el usuario.
    */
    function swap(
        address tokenInAddress,
        address tokenOutAddress,
        uint256 amountIn
    ) private {
        IERC20 tokenIn;
        IERC20 tokenOut;
        uint256 amountOut;
        uint256 tokenABalance;
        uint256 tokenBBalance;

        tokenIn = IERC20(tokenInAddress);
        tokenOut = IERC20(tokenOutAddress);

        //Me aseguro que el sender que hace el swap tenga saldo suficiente de Tokens en su cuenta.
        require(
            tokenIn.balanceOf(msg.sender) >= amountIn,
            "Insufficient balance"
        );

        //Rescato los saldos de ambos tokens dentro de SimpleDEX.
        (tokenABalance, tokenBBalance) = getBalances();

        //Transfiero desde el sender que hace el swap la cantidad ingresada del Token.
        //Previo a esto, tengo que autorizar a este contrato para realizar la transferencia.
        tokenIn.transferFrom(msg.sender, address(this), amountIn);

        //Calculo lo que le corresponde del Token B
        if (tokenIn == tokenA) {
            amountOut =
                tokenBBalance - 
                (tokenABalance * tokenBBalance) / 
                (tokenABalance + amountIn);
        } else {
            amountOut =
                (tokenABalance * tokenBBalance) /
                (tokenBBalance - amountIn) - 
                tokenABalance;
        }

        //Le transfiero del Token B al spender
        tokenOut.transfer(msg.sender, amountOut);

        emit TokensSwapped(
            msg.sender,
            address(tokenIn),
            amountIn,
            address(tokenOut),
            amountOut
        );
    }

    modifier isTokenAddressValid(address _token) 
    { 
        require(((_token == address(tokenA)) || (_token == address(tokenB))), "The address is not valid.");
        _;
    }

    function getPrice(address _token) external view isTokenAddressValid(_token) returns(uint256)
    {
        uint256 price = 0;
        uint256 tokenABalance;
        uint256 tokenBBalance;
        (tokenABalance, tokenBBalance) = getBalances();

        if (tokenABalance > 0 && tokenBBalance > 0)
        {
            if (_token == address(tokenA))
            {
                price = (tokenBBalance * decimals) / tokenABalance;
            }
            else 
            {
                price = (tokenABalance * decimals) / tokenBBalance;
            }
        }

        return price;
    }
}
