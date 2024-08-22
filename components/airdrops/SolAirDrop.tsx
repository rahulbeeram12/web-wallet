import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export const SolAirDrop = async (keypair: Keypair) => {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const signature = await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);

    await connection.confirmTransaction(signature);
}