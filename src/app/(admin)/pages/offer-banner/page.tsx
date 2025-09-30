import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import OfferBanner from './components/OfferBanner'

export const metadata: Metadata = { title: 'Offer Banner' }

const DiscountPage = () => {
  return (
    <>
      <PageTItle title="Offer Banner" />
      <OfferBanner />
    </>
  )
}

export default DiscountPage
