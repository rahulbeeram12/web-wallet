'use client';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { useState } from 'react';
import { Etherium } from '../../components/Etherium';
import { Solana } from '../../components/Solana';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';
import { HDNodeWallet } from 'ethers';
import { Wallet as wallet } from 'ethers';
import { Button } from '@nextui-org/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input } from "@nextui-org/react";

const Wallet = () => {
    const [ethAccountNumber, setEthAccountNumber] = useState<number>(0);
    const [solAccountNumber, setSolAccountNumber] = useState<number>(0);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [mnemonic, setMnemonic] = useState<Array<string>>();
    const [masterSeed, setMasterSeed] = useState<Uint8Array>();
    const [solanaKeys, setSolanaKeys] = useState<Array<Keypair>>([]);
    const [ethKeys, setEthKeys] = useState<Array<{ PrivateKey: string, PublicKey: string }>>([]);
    const [userMnemonics, setUserMnemonics] = useState<Array<string>>(Array(12).fill(''));

    const generateMnemonicAndSeed = (userMnemonic: string | undefined) => {
        // 12 words mnemonic
        const mnemonic: string = userMnemonic ? userMnemonic : generateMnemonic(128);
        setMnemonic(mnemonic.split(" "));
        setMasterSeed(mnemonicToSeedSync(mnemonic));
        setSolanaKeys([]);
        setEthKeys([]);
    }

    const copyMnemonicToClipboard = async () => {
        if (mnemonic?.length && mnemonic.length > 0)
            await navigator.clipboard.writeText(mnemonic.toString());
    }

    const storeUserGeneratedMnemonic = () => {
        if (userMnemonics.some(mnemonic => mnemonic === '')) {
            alert("Mnemonic shouldn't be empty");
            return false;
        }

        generateMnemonicAndSeed(userMnemonics.join(" "));
        return true;
    }

    const addNewEtheriumKeyPair = async () => {
        const derivationPath = `m/44'/60'/${ethAccountNumber}'/0'`;

        if (masterSeed) {
            const hdNode = HDNodeWallet.fromSeed(masterSeed);
            const child = hdNode.derivePath(derivationPath);
            const privateKey = child.privateKey;
            const ethWallet = new wallet(privateKey);
            const publicKey = await ethWallet.getAddress();

            setEthKeys((previousEthKeypairs) => [
                {
                    PrivateKey: privateKey,
                    PublicKey: publicKey
                },
                ...previousEthKeypairs
            ]);

            setEthAccountNumber(ethAccountNumber + 1);
        }
    }

    const addNewSolanaKeyPair = () => {
        const derivationPath = `m/44'/501'/${solAccountNumber}'/0'`;

        if (masterSeed) {
            const derivedSeed = derivePath(derivationPath, Buffer.from(masterSeed).toString('hex')).key;
            const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
            const currentKeypair = Keypair.fromSecretKey(secret);

            setSolanaKeys((previousSolanaKeypairs) => [
                currentKeypair,
                ...previousSolanaKeypairs
            ]);

            setSolAccountNumber(solAccountNumber + 1);
        }
    }

    return <>
        <Modal
            size={"5xl"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Enter Mnemonic</ModalHeader>
                        <ModalBody>
                            <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                <div className="flex gap-1">
                                    {Array.from({ length: 12 }, (value: string, i: number) => (
                                        <Input key={i} type="text" value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const prevUserMnemonics = userMnemonics;
                                            prevUserMnemonics[i] = e.target.value;
                                            console.log(userMnemonics);
                                            setUserMnemonics(prevUserMnemonics);
                                        }} />
                                    ))}
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={() => {
                                setUserMnemonics(Array(12).fill(''));
                                onClose();
                            }}>
                                Close
                            </Button>
                            <Button color="primary" onPress={() => {
                                const res = storeUserGeneratedMnemonic();
                                if (res) {
                                    setUserMnemonics(Array(12).fill(''));
                                    onClose();
                                }
                            }}>
                                Generate Master Seed
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
        <div className="w-full">
            <div className="mt-10 flex justify-evenly items-center">
                <h3 className="font-bold">Generate Mnemonic</h3>
                <div className="flex w-80 justify-around">
                    <Button size="lg" onClick={() => generateMnemonicAndSeed(undefined)}>
                        Generate
                    </Button>
                    <Button size="lg" onClick={() => onOpen()}>
                        Enter Mnemonic
                    </Button>
                </div>
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
                                <Etherium Keypairs={ethKeys} />
                            </div>
                        </div>
                        <div className="flex items-center justify-center bg-gray-300 h-[35rem] rounded-3xl w-full mx-20">
                            <div className="flex w-full justify-around h-full">
                                <Solana Keypairs={solanaKeys} />
                            </div>
                        </div>
                    </div>
                </>
                : null
        }
    </>
}

export default Wallet;