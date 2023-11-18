import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Web3Wrapper from '@/components/Web3Wrapper'
import AxiomWrapper from '@/components/axiom/AxiomWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'axiom-starter',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="#" />
      </head>
      <body className={`${inter.className} flex flex-col w-screen h-screen justify-center items-center`}>
        <Web3Wrapper>
          <AxiomWrapper>
            {children}
          </AxiomWrapper>
        </Web3Wrapper>
      </body>
    </html>
  )
}
