"use client";

import { shortenAddress } from '../../lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
} from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import Button from './Button';

export default function ConnectWallet({ connected }: { connected: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { disconnect } = useDisconnect()
  const { error } = useConnect()
  const { open } = useWeb3Modal()

  const disconnectWallet = () => {
    disconnect();
    router.replace(pathname);
  }

  useEffect(() => {
    if (isConnected && address && connected !== address && !searchParams.get("connected")) {
      router.replace(`${pathname}/?connected=${address}&${searchParams}`);
    }
  }, [address, connected, isConnected, router, pathname, searchParams]);

  if (isConnected) {
    return (
      <Button
        onClick={() => open({ view: 'Account' })}
      >
        {ensName ? ensName : shortenAddress(address as string)}
      </Button>
    )
  }

  return (
    <div>
      <Button onClick={() => open()}>Connect Wallet</Button>
      {error && <div>{error.message}</div>}
    </div>
  )
}
