import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SubscriptionList from './components/SubscriptionList'

export const metadata: Metadata = { title: 'Subscription List' }

const SubscriptionListPage = () => {
  return (
    <>
      <PageTItle title="Subscription List" />
      <SubscriptionList />
    </>
  )
}

export default SubscriptionListPage
