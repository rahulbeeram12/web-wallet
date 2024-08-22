import { useState } from 'react';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { SolAirDrop } from '../components/airdrops/SolAirDrop';
import { SolanaTransaction } from './Transactions/SolanaTransaction';
import { EtheriumTransaction } from './Transactions/EtheriumTransaction';
import { Keypair } from '@solana/web3.js';

interface IGetBalEth {
    result: string,
    id: number,
    jsonrpc: string
}

interface IGetBalSol {
    jsonrpc: string,
    result: {
        context: {
            slot: number
        },
        value: number
    },
    id: number
}

export const Card = ({ etheriumKeyPair, Eth, solanaKeyPair }: {
    etheriumKeyPair?:
    { PrivateKey: string, PublicKey: string }, Eth: Boolean, solanaKeyPair?: Keypair
}) => {
    const BASE_URL: string | undefined = (Eth ? process.env.NEXT_PUBLIC_ETHERIUM_API_BASE_URL : process.env.NEXT_PUBLIC_SOLANA_API_BASE_URL);
    const URL: string | undefined = (BASE_URL != undefined ? BASE_URL + process.env.NEXT_PUBLIC_ALCHEMY_API_KEY : undefined);

    const [loading, setLoading] = useState<Boolean>(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [airdropLoading, setAirdropLoading] = useState<Boolean>(false);
    const [sendMoneyLoading, setSendMoneyLoading] = useState<Boolean>(false);
    const [sendMoney, setSendMoney] = useState<string>("");
    const [toPublicAddress, setToPublicAddress] = useState<string>("");

    const copyContentToClipboard = async () => {
        if (solanaKeyPair) await navigator.clipboard.writeText(solanaKeyPair.publicKey.toBase58());
        else if (etheriumKeyPair) await navigator.clipboard.writeText(etheriumKeyPair.PublicKey);
    }

    const handleSendMoney = async () => {
        if (sendMoney == "") {
            alert(`${Eth ? 'ETH' : 'SOL'} shouldn't be empty!`);
            return;
        } else if (toPublicAddress == "") {
            alert(`Public address shouldn't be empty!`);
            return;
        }

        const response = await fetchBalance();
        if (response?.ok) {
            if (Eth) {
                const data: IGetBalEth = await response.json();
                if (Number(data.result) < Number(sendMoney)) {
                    alert("Insufficient ETH");
                    return;
                }
            } else {
                const data: IGetBalSol = await response.json();
                setBalance(data.result.value / (Math.pow(10, 9)));
                if (data.result.value < Number(sendMoney)) {
                    alert("Insufficient SOL");
                    return;
                }
            }

            try {
                setSendMoneyLoading(true);
                if (Eth && etheriumKeyPair) EtheriumTransaction(Number(sendMoney), toPublicAddress, etheriumKeyPair.PrivateKey);
                else SolanaTransaction(Number(sendMoney), solanaKeyPair, toPublicAddress);

                alert("Transaction sent!");
            } catch {
                alert("Something went wrong while sending");
                return;
            } finally {
                setSendMoneyLoading(false);
            }
        } else {
            alert("Something went wrong while fetching balance!");
            return;
        }
    }

    const handleOnChangeSendMoney = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSendMoney(e.target.value);
    }

    const handleOnChangeToPublicAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
        setToPublicAddress(e.target.value);
    }

    const airdropSol = async () => {
        try {
            setAirdropLoading(true);
            if (solanaKeyPair) await SolAirDrop(solanaKeyPair);
        } catch {
            alert("Rate limited");
        } finally {
            setAirdropLoading(false);
        }
    }

    const fetchBalance = async () => {
        if (URL) {
            const params = [`${Eth ? etheriumKeyPair?.PrivateKey : solanaKeyPair?.publicKey.toBase58()}`];
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

            return response;
        }
    }

    const getBalance = async () => {
        if (URL) {
            setLoading(true);
            try {
                const response = await fetchBalance();
                if (response?.ok) {
                    if (Eth) {
                        const data: IGetBalEth = await response.json();
                        setBalance((Number(data.result)) / (Math.pow(10, 18)));
                    } else {
                        const data: IGetBalSol = await response.json();
                        setBalance(data.result.value / (Math.pow(10, 9)));
                    }
                } else {
                    alert("Something went wrong while fetching balance!");
                    return;
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
                    <span className="flex items-center justify-between mb-2">
                        <span className="text-small">
                            Public Key : {Eth ? etheriumKeyPair?.PublicKey : solanaKeyPair?.publicKey.toBase58()}
                        </span>
                        {
                            !Eth ?
                                <div className="flex justify-start items-center">
                                    <Button onClick={airdropSol} disabled={airdropLoading === true} size="lg" color="default">
                                        {airdropLoading ? 'Wait...' : 'Air Drop Solana'}
                                    </Button>
                                </div> : null
                        }
                        <span className="material-symbols-outlined cursor-pointer" onClick={() => copyContentToClipboard()}>
                            content_copy
                        </span>
                    </span>
                    <div className="flex flex-row justify-between">
                        <div className="flex justify-start items-center gap-10">
                            <Button size="lg" color="default" onClick={getBalance}>
                                Get Balance
                            </Button>
                            {
                                loading ?
                                    'Loading...' :
                                    <div className="">
                                        Balance: {balance} {balance != null ? (Eth ? 'ETH' : 'SOL') : null}
                                    </div>
                            }
                        </div>
                    </div>
                    <div className="flex justify-start items-center gap-5 mt-2">
                        <Button disabled={sendMoneyLoading === true} size="lg" color="default" onClick={handleSendMoney}>
                            {sendMoneyLoading ? 'Sending...' : 'Send'}
                        </Button>
                        <div className="flex w-full flex-col flex-wrap md:flex-nowrap gap-0.5">
                            <Input type="number" value={sendMoney} onChange={handleOnChangeSendMoney} label={`Enter ${Eth ? 'ETH' : 'SOL'}`} />
                        </div>
                        <div className="flex w-full flex-col flex-wrap md:flex-nowrap gap-0.5">
                            <Input type="text" value={toPublicAddress} onChange={handleOnChangeToPublicAddress} label={`Enter ${Eth ? 'Etherium Address' : 'Solana Address'}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}