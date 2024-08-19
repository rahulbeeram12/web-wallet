import { useState } from 'react';

interface IGetBalEth {
    result: string,
    id: number,
    jsonrpc: string
}

interface IGetBalSol {
    "jsonrpc": string,
    "result": { 
        "context": { 
            "slot": number 
        }, 
        "value": number 
    },
    "id": number
}

export const Card = ({ PublicKey, Eth }: { PublicKey: string, Eth: Boolean }) => {
    const BASE_URL: string | undefined = (Eth ? process.env.NEXT_PUBLIC_ETHERIUM_API_BASE_URL : process.env.NEXT_PUBLIC_SOLANA_API_BASE_URL);
    const URL: string | undefined = (BASE_URL != undefined ? BASE_URL + process.env.NEXT_PUBLIC_ALCHEMY_API_KEY : undefined);

    const [loading, setLoading] = useState<Boolean>(false);
    const [balance, setBalance] = useState<number | null>(null);

    const copyContentToClipboard = async () => {
        await navigator.clipboard.writeText(PublicKey);
    }

    const getBalance = async () => {
        if (URL) {
            try {
                setLoading(true);
                const params = [`${PublicKey}`];
                if (Eth) params.push("latest");

                const response = await fetch(URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        id: 1,
                        jsonrpc: "2.0",
                        params: params,
                        method: Eth ? "eth_getBalance" : "getBalance"
                    })
                });

                if (response.ok) {
                    if (Eth) {
                        const data: IGetBalEth = await response.json();
                        setBalance((Number(data.result)) * (10 ^ (-18)));
                    } else {
                        const data: IGetBalSol = await response.json();
                        setBalance(data.result.value * (10 ^ (-9)));
                    }
                }
            } finally {
                setLoading(false);
            }
        }
    }

    return <div>
        <div className="w-full h-full">
            <div className="w-full items-start h-full justify-center gap-2 p-2 mb-5">
                <div className="flex flex-col gap-2 mx-5 mt-5 px-5 py-5 bg-red-100 rounded-2xl">
                    <span className="flex items-center justify-between">
                        <span>
                            Public Key : {PublicKey}
                        </span>
                        <span className="material-symbols-outlined cursor-pointer" onClick={() => copyContentToClipboard()}>
                            content_copy
                        </span>
                    </span>
                    <div>
                        <div className="flex justify-start items-center gap-10">
                            <button type="button" onClick={getBalance} className="text-white bg-green-500 focus:outline-none font-medium rounded-full text-sm px-5 py-2.5 text-center">Get Balance</button>
                            {
                                loading ?
                                    'Loading...' :
                                    <div className="">
                                        Balance: {balance} {balance != null ? (Eth ? 'ETH' : 'SOL') : null}
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}