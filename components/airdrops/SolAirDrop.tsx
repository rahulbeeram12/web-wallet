import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export const SolAirDrop = async (publicKey: string) => {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const address = new PublicKey(publicKey);
    const signature = await connection.requestAirdrop(address, LAMPORTS_PER_SOL);

    await connection.confirmTransaction(signature);
}