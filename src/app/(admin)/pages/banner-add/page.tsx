import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddMainBanner from './components/AddMainBanner'

export const metadata: Metadata = { title: 'Add Main Banner' }

const MainBannerAddPage = () => {
  return (
    <>
      <PageTItle title="Add Main Banner" />
      <Row>
        <Col xl={12} lg={12}>
          <AddMainBanner />
        </Col>
      </Row>
    </>
  )
}

export default MainBannerAddPage
