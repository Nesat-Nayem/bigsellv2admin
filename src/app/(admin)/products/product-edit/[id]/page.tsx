'use client'

import { Container, Row } from 'react-bootstrap'
import EditProduct from './components/EditProduct'

interface PageProps {
  params: {
    id: string
  }
}

const EditProductPage = ({ params }: PageProps) => {
  return (
    <Container fluid className="p-6">
      <Row>
        <EditProduct productId={params.id} />
      </Row>
    </Container>
  )
}

export default EditProductPage
