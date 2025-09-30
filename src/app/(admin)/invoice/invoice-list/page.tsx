import React from 'react'
import InvoiceCard from './components/InvoiceCard'
import InvoiceList from './components/InvoiceList'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Invoice List' }

const InvoiceListPage = () => {
  return (
    <>
      <PageTItle title="INVOICES LIST" />
      <InvoiceCard />
      <InvoiceList />
    </>
  )
}

export default InvoiceListPage
