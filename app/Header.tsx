'use client';
import { useRouter, usePathname } from 'next/navigation';

export const Header = () => {
    const router = useRouter();
    const pathname = usePathname();

    return <div className="text-4xl flex items-center justify-around">
        <div className="flex items-center w-auto py-5">
            <span className="text-blue-400 font-bold px-5">Web based</span>
            Wallet
        </div>
        <div className="flex justify-around text-2xl w-80">
            <button className={`cursor-pointer ${pathname.split('/')[1] === 'wallet' ? 'text-gray-800' : 'text-gray-400'}`} type="button" onClick={() => router.push('/wallet')}>
                Wallet
            </button>
            <button className={`cursor-pointer ${pathname.split('/')[1] === 'token' ? 'text-gray-800' : 'text-gray-400'}`} type="button" onClick={() => router.push('/token')}>
                Token
            </button>
        </div>
    </div>
}