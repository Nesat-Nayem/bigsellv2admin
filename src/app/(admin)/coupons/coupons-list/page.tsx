import React from 'react'
import CouponsDataList from './components/CouponsDataList'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Coupons List' }

const CouponsListPage = () => {
  return (
    <>
      <PageTItle title="COUPONS" />
      <CouponsDataList />
    </>
  )
}

export default CouponsListPage
