import {
    Connection,
    Keypair,
    SystemProgram,
    LAMPORTS_PER_SOL,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey,
} from "@solana/web3.js";

export const SolanaTransaction = async (moneyToSend: number, fromKeyPair?: Keypair, toPublicAddress?: string) => {
    const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
    );

    if (fromKeyPair && toPublicAddress) {
        const airdropSignature = await connection.requestAirdrop(
            fromKeyPair?.publicKey,
            LAMPORTS_PER_SOL
        );

        await connection.confirmTransaction(airdropSignature);

        const lamportsToSend = 1_000_000;

        const transferTransaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromKeyPair.publicKey,
                toPubkey: new PublicKey(toPublicAddress),
                lamports: lamportsToSend,
            })
        );

        await sendAndConfirmTransaction(connection, transferTransaction, [
            fromKeyPair,
        ]);
    }else{
        alert("Solana fromKeyPair and toPublicAddress should be present!");
        return;
    }
}