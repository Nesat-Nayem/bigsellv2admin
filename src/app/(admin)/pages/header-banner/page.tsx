import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import HeaderBanner from './components/HeaderBanner'

export const metadata: Metadata = { title: 'Header Banner' }

const HelpCenterPage = () => {
  return (
    <>
      <PageTItle title="Header Banner" />
      <HeaderBanner />
    </>
  )
}

export default HelpCenterPage
