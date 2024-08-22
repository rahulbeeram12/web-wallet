import { useEffect, useState } from "react";
import { Card } from "./Card";
import { Keypair } from "@solana/web3.js";

export const Solana = (props: { Keypairs: Keypair[] }) => {
    const [keypairs, setKeypairs] = useState<Keypair[]>([]);

    useEffect(() => {
        setKeypairs(() => [...props.Keypairs]);
    }, [props.Keypairs]);

    return <div className="w-full overflow-y-scroll hide-scrollbar">
        {
            keypairs.map((keypair) => {
                return <Card key={keypair.publicKey.toBase58()} solanaKeyPair={keypair} Eth={false} />
            })
        }
    </div>
}