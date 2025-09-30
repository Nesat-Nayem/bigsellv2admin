import React from 'react'
import CheckoutForm from './components/CheckoutForm'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Checkout' }

const CheckoutPage = () => {
  return (
    <>
      <PageTItle title="ORDER CHECKOUT" />
      <CheckoutForm />
    </>
  )
}

export default CheckoutPage
