import React from 'react'
import { Col, Row } from 'react-bootstrap'
import FileUpload from '@/components/FileUpload'
import AddCategory from './components/AddCategory'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Category Add' }

const CategoryAddPage = () => {
  return (
    <>
      <PageTItle title="CREATE CATEGORY" />
      <Row>
        <Col xl={12} lg={12}>
          <AddCategory />
        </Col>
      </Row>
    </>
  )
}

export default CategoryAddPage
