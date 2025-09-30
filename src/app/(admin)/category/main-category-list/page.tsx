import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MainCategory from './components/MainCategory'

export const metadata: Metadata = { title: 'Main Category' }

const MainCategoryPage = () => {
  return (
    <>
      <PageTItle title="MAIN CATEGORY" />
      <Row>
        <Col xl={12} lg={12}>
          <MainCategory />
        </Col>
      </Row>
    </>
  )
}

export default MainCategoryPage
