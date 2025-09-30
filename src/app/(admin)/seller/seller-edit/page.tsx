import React from 'react'
import { Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SellerEdit from './components/SellerEdit'

export const metadata: Metadata = { title: 'Seller Edit' }

const SellerEditPage = () => {
  return (
    <>
      <PageTItle title="SELLER EDIT" />
      <Row>
        <SellerEdit />
      </Row>
    </>
  )
}

export default SellerEditPage
