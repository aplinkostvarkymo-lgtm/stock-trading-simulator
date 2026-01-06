import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stock Trading Simulator',
  description: 'Professional stock trading simulator with real-time market data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Script
          src="https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js"
          strategy="lazyOnload"
          type="module"
        />
        {/* @ts-ignore */}
        <zapier-interfaces-chatbot-embed 
          is-popup="true" 
          chatbot-id="cmk2to07x001anu002k2etvd8"
        />
      </body>
    </html>
  )
}

