import { Container, Row } from 'react-bootstrap'
import Stats from './components/Stats'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

const DashboardPage = () => {
  return (
    <Container fluid className="dashboard-container px-2 px-sm-3 px-lg-4">
      <Row className="g-3 g-lg-4 justify-content-center">
        <Stats />
      </Row>
    </Container>
  )
}

export default DashboardPage
