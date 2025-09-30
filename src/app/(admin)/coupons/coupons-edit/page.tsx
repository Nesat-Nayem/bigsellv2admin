import React from 'react'

import { Metadata } from 'next'
import CouponsEdit from './CouponsEdit'

export const metadata: Metadata = { title: 'Coupons Add' }

const CouponsEditPage = () => {
  return (
    <>
      <CouponsEdit />
    </>
  )
}

export default CouponsEditPage
