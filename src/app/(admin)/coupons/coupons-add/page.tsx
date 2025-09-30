import React from 'react'
import Coupons from './Coupons'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Coupons Add' }

const CouponsAddPage = () => {
  return (
    <>
      <Coupons />
    </>
  )
}

export default CouponsAddPage
