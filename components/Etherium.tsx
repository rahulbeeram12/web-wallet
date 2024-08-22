import { useEffect, useState } from "react";
import { Card } from "./Card";

export const Etherium = (props: { Keypairs: { PrivateKey: string, PublicKey: string }[] }) => {
    const [keypairs, setKeypairs] = useState<{ PrivateKey: string, PublicKey: string }[]>([]);

    useEffect(() => {
        setKeypairs(() => [...props.Keypairs]);
    }, [props.Keypairs]);

    return <div className="w-full overflow-y-scroll hide-scrollbar">
        {
            keypairs.map((Keypair) => {
                return <Card key={Keypair.PublicKey} etheriumKeyPair={Keypair} Eth={true} />
            })
        }
    </div>
}