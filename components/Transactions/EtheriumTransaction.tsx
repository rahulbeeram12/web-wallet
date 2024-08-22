import { Alchemy, Network, Wallet, Utils } from 'alchemy-sdk';

const settings = {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(settings);

export const EtheriumTransaction = async (moneyToSend: number, toPublicAddress: string, PrivateKey: string) => {
    let wallet = new Wallet(PrivateKey);
    const nonce = await alchemy.core.getTransactionCount(
        wallet.address,
        "latest"
    );

    let transaction = {
        to: toPublicAddress,
        value: Utils.parseEther("0.001"),
        gasLimit: "21000",
        maxPriorityFeePerGas: Utils.parseUnits("5", "gwei"),
        maxFeePerGas: Utils.parseUnits("20", "gwei"),
        nonce: nonce,
        type: 2,
        chainId: 11155111,
    };

    let rawTransaction = await wallet.signTransaction(transaction);
    let tx = await alchemy.core.sendTransaction(rawTransaction);
    console.log("Sent transaction", tx);
}