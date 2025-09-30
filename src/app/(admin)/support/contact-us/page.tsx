import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ContactList from './components/ContactList'

export const metadata: Metadata = { title: 'Product List' }

const ProductListPage = () => {
  return (
    <>
      <PageTItle title="CONTACT ENQUIRY LIST" />
      <Row>
        <Col xl={12}>
          <ContactList />
        </Col>
      </Row>
    </>
  )
}

export default ProductListPage
