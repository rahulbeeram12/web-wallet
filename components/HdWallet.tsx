'use client';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { useState } from 'react';
import { Etherium } from './Etherium';
import { Solana } from './Solana';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';
import { HDNodeWallet } from 'ethers';
import { Wallet } from 'ethers';
import { Button } from '@nextui-org/button';

export const HdWallet = () => {
    const [ethAccountNumber, setEthAccountNumber] = useState<number>(0);
    const [solAccountNumber, setSolAccountNumber] = useState<number>(0);

    const [mnemonic, setMnemonic] = useState<Array<string>>();
    const [masterSeed, setMasterSeed] = useState<Uint8Array>();
    const [solanaKeys, setSolanaKeys] = useState<Array<string>>([]);
    const [ethKeys, setEthKeys] = useState<Array<string>>([]);

    const generateMnemonicAndSeed = () => {
        // 12 words mnemonic
        const mnemonic: string = generateMnemonic(128);
        setMnemonic(mnemonic.split(" "));
        setMasterSeed(mnemonicToSeedSync(mnemonic));
        setSolanaKeys([]);
        setEthKeys([]);
    }

    const copyMnemonicToClipboard = async () => {
        if (mnemonic?.length && mnemonic.length > 0)
            await navigator.clipboard.writeText(mnemonic.toString());
    }

    const addNewEtheriumKeyPair = async () => {
        const derivationPath = `m/44'/60'/${ethAccountNumber}'/0'`;

        if (masterSeed) {
            const hdNode = HDNodeWallet.fromSeed(masterSeed);
            const child = hdNode.derivePath(derivationPath);
            const privateKey = child.privateKey;
            const wallet = new Wallet(privateKey);
            const publicKey = await wallet.getAddress();

            setEthKeys((previousEthKeys) => [
                publicKey,
                ...previousEthKeys
            ]);

            setEthAccountNumber(ethAccountNumber + 1);
        }
    }

    const addNewSolanaKeyPair = () => {
        const derivationPath = `m/44'/501'/${solAccountNumber}'/0'`;

        if (masterSeed) {
            const derivedSeed = derivePath(derivationPath, Buffer.from(masterSeed).toString('hex')).key;
            const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
            const publicKey = Keypair.fromSecretKey(secret).publicKey.toBase58(); // solana converts to base58

            setSolanaKeys((previousSolanaKeys) => [
                publicKey,
                ...previousSolanaKeys
            ]);

            setSolAccountNumber(solAccountNumber + 1);
        }
    }

    return <>
        <div className="text-4xl flex items-center justify-center">
            <div className="flex items-center w-auto py-5">
                Create
                <span className="text-blue-400 font-bold px-5">Hierarchical Deterministic</span>
                Wallet
            </div>
        </div>
        <div className="w-full">
            <div className="mt-10 flex justify-evenly items-center">
                <h3 className="font-bold">Generate Mnemonic</h3>
                <Button size="lg" onClick={generateMnemonicAndSeed}>
                    Generate
                </Button>
            </div>
        </div>
        {
            mnemonic ?
                <>
                    <div className="flex w-auto justify-center m-10">
                        <div className="flex flex-col">
                            <div className="mb-2">Click anywhere in the below box to copy!</div>
                            <div onClick={copyMnemonicToClipboard} className="bg-green-300 flex justify-center rounded-2xl p-5 cursor-pointer">
                                {mnemonic.map(word => {
                                    return <div key={word} className="w-auto">
                                        <div className="font-bold mx-5 bg-gray-300 p-2 rounded-2xl">
                                            {word}
                                        </div>
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-around items-center mb-5">
                        <Button size="lg" onClick={addNewEtheriumKeyPair}>Generate Etherium key pair</Button>
                        <Button size="lg" onClick={addNewSolanaKeyPair}>Generate Solana key pair</Button>
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="flex items-center justify-center bg-gray-300 h-[35rem] rounded-3xl w-full mx-20">
                            <div className="flex w-full justify-around h-full">
                                <Etherium Keys={ethKeys} />
                            </div>
                        </div>
                        <div className="flex items-center justify-center bg-gray-300 h-[35rem] rounded-3xl w-full mx-20">
                            <div className="flex w-full justify-around h-full">
                                <Solana Keys={solanaKeys} />
                            </div>
                        </div>
                    </div>
                </>
                : null
        }
    </>
}