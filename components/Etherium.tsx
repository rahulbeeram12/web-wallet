import { useEffect, useState } from "react";
import { Card } from "./Card";

export const Etherium = (props: { Keys: string[] }) => {
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        setKeys(() => [...props.Keys]);
    }, [props.Keys]);
    
    return <div className="w-full overflow-y-scroll hide-scrollbar">
        {
            keys.map((publicKey) => {
                return <Card key={publicKey} publicKey={publicKey} Eth={true} />
            })
        }
    </div>
}