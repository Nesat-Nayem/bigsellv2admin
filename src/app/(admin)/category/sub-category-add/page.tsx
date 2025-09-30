import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddSubCategory from './components/AddSubCategory'

export const metadata: Metadata = { title: 'Sub Category Add' }

const SubCategoryAddPage = () => {
  return (
    <>
      <PageTItle title="SUB CATEGORY ADD" />
      <Row>
        <Col xl={12} lg={12}>
          <AddSubCategory />
        </Col>
      </Row>
    </>
  )
}

export default SubCategoryAddPage
