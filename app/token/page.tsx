'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody, Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { AccountLayout, createMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';

interface TokenInfo {
    PrivateKey: string,
    MintAuthority: string,
    Decimals: number
}

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const Token = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [tokenInfo, setTokenInfo] = useState<TokenInfo>({ PrivateKey: '', MintAuthority: '', Decimals: 9 });
    const [publicAddress, setPublicAddress] = useState<string>("");
    const [tokenAccounts, setTokenAccounts] = useState<Array<{
        mintAccount: string,
        balance: number
    }>>();
    const [loadingTokenAccounts, setLoadingTokenAccounts] = useState<boolean>(false);
    const [creatingToken, setCreatingToken] = useState(false);
    const [mintAccounts, setMintAccounts] = useState<Array<string>>([]);

    const getTokenMints = async () => {
        if (!publicAddress) {
            alert('Public address should not be empty');
            return;
        }

        setLoadingTokenAccounts(true);
        try {
            const allAccounts = await connection.getTokenAccountsByOwner(
                new PublicKey(publicAddress),
                {
                    programId: TOKEN_PROGRAM_ID,
                }
            );

            allAccounts.value.forEach((tokenAccount) => {
                const accountData = AccountLayout.decode(tokenAccount.account.data);
                if (tokenAccounts === undefined || tokenAccounts.length === 0) {
                    setTokenAccounts([{
                        mintAccount: new PublicKey(accountData.mint).toBase58(),
                        balance: (Number(accountData.amount) / (Math.pow(10, 9)))
                    }]);
                } else {
                    const acc = new PublicKey(accountData.mint).toBase58();
                    const prevTokenAccounts = tokenAccounts;
                    if (!prevTokenAccounts.some((account) => account.mintAccount === acc)) {
                        prevTokenAccounts.push({
                            mintAccount: acc,
                            balance: (Number(accountData.amount) / (Math.pow(10, 9)))
                        });
                        setTokenAccounts(prevTokenAccounts);
                    } else {
                        alert('Account already exists');
                        return;
                    }
                }
            });
        } finally {
            setLoadingTokenAccounts(false);
        }
    }

    const generateMintAccount = async () => {
        if (tokenInfo.PrivateKey === '' || tokenInfo.MintAuthority === '') {
            alert('Fields should not be empty');
            return false;
        }

        const inRange = tokenInfo.Decimals >= 0 && tokenInfo.Decimals <= 9;
        if (!inRange) {
            alert('Decimal is not in range. It should be 0 >= x <= 9');
            return false;
        }

        tokenInfo.PrivateKey = tokenInfo.PrivateKey.trim();

        const seed = mnemonicToSeedSync(tokenInfo.PrivateKey);
        const keypair = Keypair.fromSeed(seed.slice(0, 32));
        try {
            setCreatingToken(true);
            const mint = await createMint(
                connection,
                keypair,
                new PublicKey(tokenInfo.MintAuthority),
                null,
                tokenInfo.Decimals);

            setMintAccounts((prevAcc) => [...prevAcc, mint.toBase58()]);
        } catch (e) {
            alert('Something went wrong while creating token ' + e);
            return false;
        } finally {
            setCreatingToken(false);
        }
        return true;
    }

    return (
        <div>
            <div className="text-2xl flex justify-center m-5"><p>Solana Token Accounts</p></div>
            <div className="flex justify-evenly">
                <span className="mr-16">Get Mint Tokens</span>
                <span>Generate Mint Tokens</span>
            </div>
            <div className="flex items-center  md:flex-nowrap gap-2">
                <div className="flex items-center flex-col w-1/3 m-16">
                    <div className="flex items-center w-full gap-4">
                        <Input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setPublicAddress(e.target.value);
                        }} label="Enter Solana Public Address" />
                        <Button className="px-10" size="lg" onClick={getTokenMints}>
                            {loadingTokenAccounts ? 'Loading...' : 'Get Token Mints'}
                        </Button>
                    </div>
                </div>
                <div className="flex items-center flex-col w-1/2 m-16">
                    <div className="flex items-center w-full gap-4">
                        <Button className="px-16 w-full" size="lg" onClick={onOpen}>
                            Generate Mint Account
                        </Button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 w-[35%] mx-14">
                {
                    tokenAccounts?.map((tokenAccount, idx) => {
                        return (
                            <Card key={idx} className="mx-7">
                                <div className="p-4">
                                    <p className="font-bold">Token Mint Details</p>
                                    <CardBody className="bg-neutral-200 rounded-xl mt-3 w-full">
                                        <p className="flex justify-between">
                                            Account: {tokenAccount.mintAccount}
                                            <span className="material-symbols-outlined cursor-pointer" onClick={async () => {
                                                if (publicAddress) await navigator.clipboard.writeText(publicAddress);
                                            }}>
                                                content_copy
                                            </span>
                                        </p>
                                        <p>Balance: {tokenAccount.balance} SOL</p>
                                    </CardBody>
                                </div>
                            </Card>);
                    })
                }
            </div>
            <div className="grid relative grid-cols-1 ml-[47%] mr-36">
                {
                    mintAccounts?.map((tokenAccount, idx) => {
                        return (
                            <Card key={idx} className="mx-7">
                                <div className="p-4">
                                    <p className="font-bold">Token Mint Details</p>
                                    <CardBody className="bg-neutral-200 rounded-xl mt-3 w-full">
                                        <p className="flex justify-between">
                                            Mint Account: {tokenAccount}
                                            <span className="material-symbols-outlined cursor-pointer" onClick={async () => {
                                                if (publicAddress) await navigator.clipboard.writeText(publicAddress);
                                            }}>
                                                content_copy
                                            </span>
                                        </p>
                                    </CardBody>
                                </div>
                            </Card>);
                    })
                }
            </div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement="top-center"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Enter Token Details</ModalHeader>
                            <ModalBody>
                                <Input
                                    type="text"
                                    label="Public Key"
                                    required={true}
                                    variant="bordered"
                                    placeholder="Enter 12 word Mnemonic separated by space"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setTokenInfo({
                                            ...tokenInfo,
                                            PrivateKey: e.target.value
                                        })
                                    }}
                                />
                                <Input
                                    label="Mint Authority"
                                    type="text"
                                    variant="bordered"
                                    required={true}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setTokenInfo({
                                            ...tokenInfo,
                                            MintAuthority: e.target.value
                                        })
                                    }}
                                />
                                <Input
                                    label="Decimal"
                                    type="number"
                                    variant="bordered"
                                    min={0}
                                    max={9}
                                    required={true}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setTokenInfo({
                                            ...tokenInfo,
                                            Decimals: parseInt(e.target.value)
                                        })
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="flat" onPress={() => {
                                    setTokenInfo({ PrivateKey: '', MintAuthority: '', Decimals: 9 });
                                    onClose();
                                }}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={async () => {
                                    const res = await generateMintAccount();
                                    if (res === true) {
                                        setTokenInfo({ PrivateKey: '', MintAuthority: '', Decimals: 9 });
                                        onClose();
                                    }
                                }}>
                                    { creatingToken ? 'Creating...' : 'Create Token'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

export default Token;