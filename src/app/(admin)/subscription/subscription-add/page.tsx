import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SubscriptionAdd from './components/SubscriptionAdd'

export const metadata: Metadata = { title: 'Subscription Add' }

const SubscriptionPage = () => {
  return (
    <>
      <PageTItle title="Subscription Add" />
      <SubscriptionAdd />
    </>
  )
}

export default SubscriptionPage
