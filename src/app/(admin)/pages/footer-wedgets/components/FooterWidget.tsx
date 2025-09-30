import ComponentContainerCard from '@/components/ComponentContainerCard'
import DropzoneFormInput from '@/components/form/DropzoneFormInput'
import Link from 'next/link'
import React from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap'

const FooterWidget = () => {
  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Widgets</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Sub" className="form-label">
                  Sub Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Sub" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Sub" className="form-label">
                  Sub Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Sub" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Sub" className="form-label">
                  Sub Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Sub" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Sub" className="form-label">
                  Sub Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Sub" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Link href="" className="btn btn-outline-secondary w-100">
              Create
            </Link>
          </Col>
          <Col lg={2}>
            <Link href="" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default FooterWidget
