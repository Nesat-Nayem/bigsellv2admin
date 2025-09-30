import React from 'react'
import PurchaseOrder from './components/PurchaseOrder'
import PurchaseList from './components/PurchaseList'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Purchase Order' }

const PurchaseOrderPage = () => {
  return (
    <>
      <PageTItle title="PURCHASE ORDER" />
      <PurchaseOrder />
      <PurchaseList />
    </>
  )
}

export default PurchaseOrderPage
