"use client";

import { useAccount } from "wagmi"; // Usamos useAccount para obtener la cuenta conectada
import { NextPage } from "next";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth"; // Usamos el hook adecuado
import { parseUnits } from "viem/utils";
import { useState } from "react";

const Home: NextPage = () => {

  // Levanto la informacion de los contratos, por ejemplo, para obtener sus addresses.
  const { data: deployedContractDataTokenA } = useDeployedContractInfo("TokenA");
  const { data: deployedContractDataTokenB } = useDeployedContractInfo("TokenB");
  const { data: deployedContractDataSimpleDEX } = useDeployedContractInfo("SimpleDEX");

  const { address: connectedAddress } = useAccount();  // Obtener la dirección de la cuenta conectada

  // Leo el saldo del token A que tiene el usuario que está conectado.
  const { data: userBalanceA, isLoading: isLoadingA, isError: isErrorA } = useScaffoldReadContract({
    contractName: "TokenA",  
    functionName: "balanceOf",
    args: [connectedAddress], 
  });

  // Leo el saldo del token B que tiene el usuario que está conectado.
  const { data: userBalanceB, isLoading: isLoadingB, isError: isErrorB } = useScaffoldReadContract({
    contractName: "TokenB",  
    functionName: "balanceOf",
    args: [connectedAddress], 
  });

  // Genero unas constantes para poder escribir en los contratos.
  const { writeContractAsync: TokenAsync } = useScaffoldWriteContract("TokenA");
  const { writeContractAsync: TokenBsync } = useScaffoldWriteContract("TokenB");
  const { writeContractAsync: SimpleDEXsync } = useScaffoldWriteContract("SimpleDEX");

  // Formateo los balances
  const formattedBalanceA = userBalanceA ? userBalanceA.toString() : "0";
  const formattedBalanceB = userBalanceB ? userBalanceB.toString() : "0";

  const [receiverAddressA, setReceiverAddressA] = useState("");
  const [receiverAmountA, setReceiverAmountA] = useState("");
  const [receiverAddressB, setReceiverAddressB] = useState("");
  const [receiverAmountB, setReceiverAmountB] = useState("");

  const [swapAmountA, setSwapAmountA] = useState("");
  const [swapAmountB, setSwapAmountB] = useState("");

  const [spenderAddressA, setSpenderAddressA] = useState("");
  const [spenderAmountA, setSpenderAmountA] = useState("");
  const [spenderAddressB, setSpenderAddressB] = useState("");
  const [spenderAmountB, setSpenderAmountB] = useState("");

  const [liquidityAmountA, setLiquidityAmountA] = useState("");
  const [liquidityAmountB, setLiquidityAmountB] = useState("");

  /*********************************************************************************/

  // Realizo un handle para poder mintear los tokens A
  const handleMintA = async () => {
    if (!receiverAddressA || !receiverAmountA) {
      alert("Por favor, ingresa una dirección y una cantidad.");
      return;
    }

    try {
      await TokenAsync({
        functionName: "mint",
        args: [receiverAddressA, parseUnits(receiverAmountA, 0)], /*parseUnits(amount, 18)*/
      });
      alert("Tokens acuñados exitosamente.");
    } catch (e) {
      console.error("Error minting tokens A:", e);
    }
  };
  /**********************************************************************/
  // Realizo un handle para poder mintear los tokens B
  const handleMintB = async () => {
    if (!receiverAddressB || !receiverAmountB) {
      alert("Por favor, ingresa una dirección y una cantidad.");
      return;
    }

    try {
      await TokenBsync({
        functionName: "mint",
        args: [receiverAddressB, parseUnits(receiverAmountB, 0)], /*parseUnits(amount, 18)*/
      });
      alert("Tokens acuñados exitosamente.");
    } catch (e) {
      console.error("Error minting tokens B:", e);
    }
  };
  /**************************************************** */
  // Realizo un handle para poder aprobar una cantidad de tokens a un contrato, 
  //en este caso, para que simpleDex pueda transferirse fondos del TokenA.
  const handleApproveA = async () => {
    if (!spenderAddressA || !spenderAmountA) {
      alert("Por favor, ingresa una dirección y una cantidad.");
      return;
    }

    try {
      await TokenAsync({
        functionName: "approve",
        args: [spenderAddressA, parseUnits(spenderAmountA, 0)], // 18 es la cantidad de decimales del token (ajustar según el token)
      });
      alert("Aprobación exitosa.");
    } catch (e) {
      console.error("Error aprobando tokens:", e);
      alert("Error al aprobar los tokens.");
    }
  };
  /**************************************************** */
  // Realizo un handle para poder aprobar una cantidad de tokens a un contrato, 
  //en este caso, para que simpleDex pueda transferirse fondos del TokenB.  
  const handleApproveB = async () => {
    if (!spenderAddressB || !spenderAmountB) {
      alert("Por favor, ingresa una dirección y una cantidad.");
      return;
    }

    try {
      await TokenBsync({
        functionName: "approve",
        args: [spenderAddressB, parseUnits(spenderAmountB, 0)], // 18 es la cantidad de decimales del token (ajustar según el token)
      });
      alert("Aprobación exitosa.");
    } catch (e) {
      console.error("Error aprobando tokens:", e);
      alert("Error al aprobar los tokens.");
    }
  };
  /**************************************************** */
  //Realizo un handle para agregar liquidez a la pool.

  const handleAddLiquidity = async () => {
    if (!liquidityAmountA || !liquidityAmountB) {
      alert("Por favor, ingresa una cantidad válida de Tokens A y Tokens B.");
      return;
    }

    try {
      await SimpleDEXsync({
        functionName: "addLiquidity",
        args: [parseUnits(liquidityAmountA, 0), parseUnits(liquidityAmountB, 0)], // 18 es la cantidad de decimales del token (ajustar según el token)
      });
      alert("Adición de Liquidez exitosa.");
    } catch (e) {
      console.error("Error agregando liquidez:", e);
      alert("Error agregando liquidez.");
    }
  };
  /**************************************************** */
  //Realizo un handle para remover liquidez a la pool.
  const handleRemoveLiquidity = async () => {
    if (!liquidityAmountA || !liquidityAmountB) {
      alert("Por favor, ingresa una cantidad válida de Tokens A y Tokens B.");
      return;
    }

    try {
      await SimpleDEXsync({
        functionName: "removeLiquidity",
        args: [parseUnits(liquidityAmountA, 0), parseUnits(liquidityAmountB, 0)], // 18 es la cantidad de decimales del token (ajustar según el token)
      });
      alert("Sustracción de Liquidez exitosa.");
    } catch (e) {
      console.error("Error removiendo liquidez:", e);
      alert("Error removiendo liquidez.");
    }
  };
  /**************************************************** */
  //Realizo un handle para poder hacer el swap de A por B.
  const handleSwapAforB = async () => {
    if (!swapAmountA) {
      alert("Por favor, ingresa una cantidad válida de Tokens A.");
      return;
    }

    try {
      await SimpleDEXsync({
        functionName: "swapAforB",
        args: [parseUnits(swapAmountA, 0)], // 18 es la cantidad de decimales del token (ajustar según el token)
      });
      alert("Swap de A por B exitoso.");
    } catch (e) {
      console.error("Error en Swap de A por B:", e);
      alert("Error en Swap de A por B.");
    }
  };
  /**************************************************** */
  //Realizo un handle para poder hacer el swap de B por A.
  const handleSwapBforA = async () => {
    if (!swapAmountB) {
      alert("Por favor, ingresa una cantidad válida de Tokens B.");
      return;
    }

    try {
      await SimpleDEXsync({
        functionName: "swapBforA",
        args: [parseUnits(swapAmountB, 0)], // 18 es la cantidad de decimales del token (ajustar según el token)
      });
      alert("Swap de B por A exitoso.");
    } catch (e) {
      console.error("Error en Swap de B por A:", e);
      alert("Error en Swap de B por A.");
    }
  };
  /****************************************************** */

  //Obtengo los addresses de los contratos.
  const addressTokenA = deployedContractDataTokenA?.address;
  const addressTokenB = deployedContractDataTokenB?.address;
  const addressSimpleDEX = deployedContractDataSimpleDEX?.address;

  // Obtengo el valor del token A en funcion de B.
  const { data: tokenAPrice, isLoading: isLoadingSimpleDEXA, isError: isErrorSimpleDEXA } = useScaffoldReadContract({
    contractName: "SimpleDEX",  
    functionName: "getPrice",  
    args: [addressTokenA],  
  });

  // Obtengo el valor del token B en funcion de A.
  const { data: tokenBPrice, isLoading: isLoadingSimpleDEXB, isError: isErrorSimpleDEXB } = useScaffoldReadContract({
    contractName: "SimpleDEX",  
    functionName: "getPrice",  
    args: [addressTokenB],  
  });

  const formattedTokenAPrice = tokenAPrice ? tokenAPrice.toString() : "0";
  const formattedTokenBPrice = tokenBPrice ? tokenBPrice.toString() : "0";

  return (
    <div className="container">

<h1 className="panel-title">Nahuel Ruiz Mattar - Trabajo Práctico Módulo 4</h1>
     {/* Panel para gestionar Token A */}
    <div className="panel">
      <h3 className="panel-title">Gestión Token A</h3>
      <div className="panel-content">
        {/* Información de Tokens */}
        <div className="token-info">
          <p><strong>TokenA:</strong> {addressTokenA}</p>
        </div>
  
        <section className="token-management">

          <div>
            {isLoadingA ? (
              <p className="loading-message">Cargando saldo...</p>
            ) : isErrorA ? (
              <p className="error-message">Error al cargar el saldo.</p>
            ) : (
              <p><strong>Tu saldo de Token A es:</strong> {formattedBalanceA}</p>
            )}
          </div>
  
          <div className="form-group">
          <p><strong>Mintear Tokens:</strong></p>
            <input
              type="text"
              className="input-field"
              placeholder="Dirección de recepción"
              value={receiverAddressA}
              onChange={(e) => setReceiverAddressA(e.target.value)}
            />
            <input
              type="number"
              className="input-field"
              placeholder="Cantidad de tokens"
              value={receiverAmountA}
              onChange={(e) => setReceiverAmountA(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleMintA}>Mint Tokens A</button>
          </div>
  
          <div className="form-group">
          <p><strong>Aprobar Tokens:</strong></p>
            <input
              type="text"
              className="input-field"
              placeholder="Dirección del Spender"
              value={spenderAddressA}
              onChange={(e) => setSpenderAddressA(e.target.value)}
            />
            <input
              type="number"
              className="input-field"
              placeholder="Cantidad de tokens a aprobar"
              value={spenderAmountA}
              onChange={(e) => setSpenderAmountA(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleApproveA}>Aprobar Tokens A</button>
          </div>
        </section>
  
      </div>
    </div>
  {/* Panel para gestionar Token B */}
    <div className="panel">
      <h3 className="panel-title">Gestión Token B</h3>
      <div className="panel-content">
        
        <div className="token-info">
          <p><strong>TokenB:</strong> {addressTokenB}</p>
        </div>
                
                <section className="token-management">
          <div>
            {isLoadingB ? (
              <p className="loading-message">Cargando saldo...</p>
            ) : isErrorB ? (
              <p className="error-message">Error al cargar el saldo.</p>
            ) : (
              <p><strong>Tu saldo de Token B es:</strong> {formattedBalanceB}</p>
            )}
          </div>
  
          <div className="form-group">
          <p><strong>Mintear Tokens:</strong></p>
            <input
              type="text"
              className="input-field"
              placeholder="Dirección de recepción"
              value={receiverAddressB}
              onChange={(e) => setReceiverAddressB(e.target.value)}
            />
            <input
              type="number"
              className="input-field"
              placeholder="Cantidad de tokens"
              value={receiverAmountB}
              onChange={(e) => setReceiverAmountB(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleMintB}>Mint Tokens B</button>
          </div>
  
          <div className="form-group">
          <p><strong>Aprobar Tokens:</strong></p>
            <input
              type="text"
              className="input-field"
              placeholder="Dirección del Spender"
              value={spenderAddressB}
              onChange={(e) => setSpenderAddressB(e.target.value)}
            />
            <input
              type="number"
              className="input-field"
              placeholder="Cantidad de tokens a aprobar"
              value={spenderAmountB}
              onChange={(e) => setSpenderAmountB(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleApproveB}>Aprobar Tokens B</button>
          </div>
        </section>
      </div>
    </div>
    {/* Panel para gestionar SimpleDEX */}
    <div className="panel">
      <h3 className="panel-title">Gestión SimpleDEX</h3>
      <div className="panel-content">
      <div className="token-info">
          <p><strong>SimpleDEX:</strong> {addressSimpleDEX}</p>
        </div>

        
        <div className="form-group">
        <p><strong>Tu saldo de Token A es:</strong> {formattedBalanceA}</p>
        <p><strong>Tu saldo de Token B es:</strong> {formattedBalanceB}</p>
        </div>
        <div className="form-group">
          {isLoadingSimpleDEXA ? (
            <p className="loading-message">Cargando precio del token A...</p>
          ) : isErrorSimpleDEXA ? (
            <p className="error-message">Error al cargar el precio del Token A.</p>
          ) : (
            <p><strong>Precio de Token A | 1000000000000000000 TKA es igual a </strong> {formattedTokenAPrice}<strong> TKB </strong> </p>
          )}
   </div>
  
        <div >
          {isLoadingSimpleDEXB ? (
            <p className="loading-message">Cargando precio del token B...</p>
          ) : isErrorSimpleDEXB ? (
            <p className="error-message">Error al cargar el precio del Token B.</p>
          ) : (
            <p><strong>Precio de Token B | 1000000000000000000 TKB es igual a </strong> {formattedTokenBPrice}<strong> TKA </strong> </p>
          )}
        </div>
  
        
        <div className="form-group">
        <p><strong>Agregar y Remover Liquidez:</strong></p>
          <input
            type="number"
            className="input-field"
            placeholder="Cantidad Token A"
            value={liquidityAmountA}
            onChange={(e) => setLiquidityAmountA(e.target.value)}
          />
          <input
            type="number"
            className="input-field"
            placeholder="Cantidad Token B"
            value={liquidityAmountB}
            onChange={(e) => setLiquidityAmountB(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddLiquidity}>Agregar Liquidez</button>
          <button className="btn btn-danger" onClick={handleRemoveLiquidity}>Remover Liquidez</button>
        </div>
  
        <div className="form-group">
        <p><strong>Swap A por B:</strong></p>
          <input
            type="number"
            className="input-field"
            placeholder="Cantidad Token A"
            value={swapAmountA}
            onChange={(e) => setSwapAmountA(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSwapAforB}>Swap A por B</button>
        </div>
  
        <div className="form-group">
        <p><strong>Swap B por A:</strong></p>
          <input
            type="number"
            className="input-field"
            placeholder="Cantidad Token B"
            value={swapAmountB}
            onChange={(e) => setSwapAmountB(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSwapBforA}>Swap B por A</button>
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default Home;
