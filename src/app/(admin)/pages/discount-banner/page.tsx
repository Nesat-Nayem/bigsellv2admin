import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import DiscountBanner from './components/DiscountBanner'

export const metadata: Metadata = { title: 'Discount Banner' }

const DiscountPage = () => {
  return (
    <>
      <PageTItle title="Discount Banner" />
      <DiscountBanner />
    </>
  )
}

export default DiscountPage
