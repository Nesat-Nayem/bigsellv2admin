import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddMainCategory from './components/AddMainCategory'

export const metadata: Metadata = { title: 'Category Main Add' }

const MainCategoryAddPage = () => {
  return (
    <>
      <PageTItle title="CREATE MAIN CATEGORY" />
      <Row>
        <Col xl={12} lg={12}>
          <AddMainCategory />
        </Col>
      </Row>
    </>
  )
}

export default MainCategoryAddPage
