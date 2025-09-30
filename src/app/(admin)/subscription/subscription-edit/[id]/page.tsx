import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SubscriptionEdit from '../components/SubscriptionEdit'

export const metadata: Metadata = { title: 'Subscription Edit' }

const SubscriptionEditPage = () => {
  return (
    <>
      <PageTItle title="Subscription Edit" />
      <SubscriptionEdit />
    </>
  )
}

export default SubscriptionEditPage
