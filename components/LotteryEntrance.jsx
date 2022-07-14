import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { contractAddresses, LotteryAbi } from "../contracts";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";
import { MdCelebration } from "react-icons/md";

const LotteryEntrance = () => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayer, setNumberOfPlayer] = useState("0");
  const [recentWinner, setRecentWinner] = useState("");

  const dispatch = useNotification();

  const chainId = parseInt(chainIdHex);
  const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const {
    runContractFunction: enterLottery,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: LotteryAbi.abi,
    functionName: "enterLottery",
    contractAddress: lotteryAddress,
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: LotteryAbi.abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: LotteryAbi.abi,
    contractAddress: lotteryAddress,
    functionName: "getNumberOfPlayers",
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: LotteryAbi.abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner",
  });

  const updateUI = async () => {
    const fee = await getEntranceFee({
      onError: handleError,
    });

    const players = await getNumberOfPlayers({
      onError: handleError,
    });

    const winner = await getRecentWinner({
      onError: handleError,
    });
    console.log("⚡️ ~ file: LotteryEntrance.jsx ~ line 78 ~ winner", winner);
    console.log("⚡️ ~ file: LotteryEntrance.jsx ~ line 67 ~ players", players);
    console.log("⚡️ ~ file: LotteryEntrance.jsx ~ line 28 ~ useEffect ~ fee", fee);

    if (parseInt(winner) === 0) {
      setRecentWinner("");
    } else {
      setRecentWinner(winner);
    }

    setNumberOfPlayer(players.toString());
    setEntranceFee(fee);
  };

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNotifications(tx);
    updateUI();
  };

  const handleError = (err) => console.log(err.message);

  function handleNotifications(tx) {
    dispatch({
      type: "info",
      title: "Transaction Complete 🚀",
      message: "entered lottery successfully",
      icon: "bell",
      position: "topR",
    });
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const addEventListeners = async () => {
        const filter = {
          address: lotteryAddress,
          topics: [ethers.utils.id("WinnerPicked(address)")],
        };

        provider.on(filter, () => {
          dispatch({
            type: "success",
            title: "Winner Found",
            message: "Winner picked for the lottery",
            icon: "exclamation",
            position: "topR",
          });
          updateUI();
        });
      };

      addEventListeners();

      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <div className="p-5">
      <h1 className="py-4 font-bold text-3xl">Lottery</h1>
      {lotteryAddress ? (
        <>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={async () => {
              await enterLottery({
                onSuccess: handleSuccess,
                onError: (err) => console.log(err),
              });
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              "Enter Lottery"
            )}
          </button>
          <div className="mt-2">Entrance Fee: {ethers.utils.formatEther(entranceFee)} ETH</div>
          <div className="mt-2">The current number of players is: {numberOfPlayer}</div>
          {recentWinner ? <p>The most previous winner was: {recentWinner}</p> : null}
        </>
      ) : (
        <div>Please connect to a supported chain </div>
      )}
    </div>
  );
};

export default LotteryEntrance;
