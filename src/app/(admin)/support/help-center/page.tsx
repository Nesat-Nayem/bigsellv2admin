import React from 'react'
import HelpCenter from './components/HelpCenter'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Help Center' }

const HelpCenterPage = () => {
  return (
    <>
      <PageTItle title="HELP CENTER" />
      <HelpCenter />
    </>
  )
}

export default HelpCenterPage
