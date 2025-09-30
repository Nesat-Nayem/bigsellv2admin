'use client'

import { useGetAboutQuery, useUpdateAboutMutation } from '@/store/aboutApi'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Form } from 'react-bootstrap'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// local type for form
interface IWhyChooseForm {
  image: File | null
  preview: string | null
  title: string
  shortDesc: string
}

interface FormState {
  image: File | null
  title: string
  subtitle: string
  url: string
  happyCustomers: string
  electronicsProducts: string
  activeSalesman: string
  storeWorldwide: string
  aboutInfoImage: File | null
  aboutInfoTitle: string
  aboutInfoDescription: string
  whyChooseUs: IWhyChooseForm[]
}

const AboutUS = () => {
  const { data: aboutData, isLoading, isError } = useGetAboutQuery()
  const [updateAbout, { isLoading: isUpdating }] = useUpdateAboutMutation()

  const [formData, setFormData] = useState<FormState>({
    image: null,
    title: '',
    subtitle: '',
    url: '',
    happyCustomers: '',
    electronicsProducts: '',
    activeSalesman: '',
    storeWorldwide: '',
    aboutInfoImage: null,
    aboutInfoTitle: '',
    aboutInfoDescription: '',
    whyChooseUs: [],
  })

  //   NEW: preview states
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [aboutInfoImagePreview, setAboutInfoImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (aboutData) {
      setFormData((prev) => ({
        ...prev,
        title: aboutData.aboutUs?.title || '',
        subtitle: aboutData.aboutUs?.subtitle || '',
        url: aboutData.aboutUs?.url || '',
        happyCustomers: aboutData.counter?.happyCustomers?.toString() || '',
        electronicsProducts: aboutData.counter?.electronicsProducts?.toString() || '',
        activeSalesman: aboutData.counter?.activeSalesman?.toString() || '',
        storeWorldwide: aboutData.counter?.storeWorldwide?.toString() || '',
        aboutInfoTitle: aboutData.aboutInfo?.title || '',
        aboutInfoDescription: aboutData.aboutInfo?.description || '',
        whyChooseUs:
          aboutData.whyChooseUs?.map((item) => ({
            image: null,
            preview: item.image,
            title: item.title,
            shortDesc: item.shortDesc,
          })) || [],
      }))
      setImagePreview(aboutData.aboutUs?.image || null)
      setAboutInfoImagePreview(aboutData.aboutInfo?.image || null)
    }
  }, [aboutData])

  const handleWhyChooseChange = (index: number, field: keyof IWhyChooseForm, value: string | File) => {
    setFormData((prev) => {
      const updated = [...prev.whyChooseUs]
      if (field === 'image' && value instanceof File) {
        updated[index].image = value
        updated[index].preview = URL.createObjectURL(value)
      } else {
        updated[index] = { ...updated[index], [field]: value as any }
      }
      return { ...prev, whyChooseUs: updated }
    })
  }

  const addWhyChoose = () => {
    setFormData((prev) => ({
      ...prev,
      whyChooseUs: [...prev.whyChooseUs, { image: null, preview: null, title: '', shortDesc: '' }],
    }))
  }

  const removeWhyChoose = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.whyChooseUs]
      updated.splice(index, 1)
      return { ...prev, whyChooseUs: updated }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement
    if (files && files.length > 0) {
      const file = files[0]
      setFormData((prev) => ({ ...prev, [name]: file }) as any)

      if (name === 'image') {
        setImagePreview(URL.createObjectURL(file))
      }
      if (name === 'aboutInfoImage') {
        setAboutInfoImagePreview(URL.createObjectURL(file))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }) as any)
    }
  }

  const handleQuillChange = (value: string) => {
    setFormData((prev) => ({ ...prev, aboutInfoDescription: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = new FormData()

      // aboutUs
      data.append('title', formData.title)
      data.append('subtitle', formData.subtitle)
      data.append('url', formData.url)
      if (formData.image) data.append('image', formData.image)

      // counter
      data.append('happyCustomers', formData.happyCustomers)
      data.append('electronicsProducts', formData.electronicsProducts)
      data.append('activeSalesman', formData.activeSalesman)
      data.append('storeWorldwide', formData.storeWorldwide)

      // aboutInfo
      data.append('aboutInfoTitle', formData.aboutInfoTitle)
      data.append('aboutInfoDescription', formData.aboutInfoDescription)
      if (formData.aboutInfoImage) data.append('aboutInfoImage', formData.aboutInfoImage)

      // whyChooseUs
      formData.whyChooseUs.forEach((item, idx) => {
        if (item.image) {
          data.append(`whyChooseUsImage${idx}`, item.image) //   unique keys for multer
        }
        data.append(`whyChooseUsTitle${idx}`, item.title)
        data.append(`whyChooseUsShortDesc${idx}`, item.shortDesc)
      })

      await updateAbout(data).unwrap()
      alert('About section updated successfully!')
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update About section')
    }
  }

  if (isLoading) return <div className="text-center py-5">Loading...</div>
  if (isError) return <div className="text-center py-5 text-danger">Error loading data</div>

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        {/* About Us */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as={'h4'}>About Us</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Banner</Form.Label>
                  <Form.Control type="file" name="image" onChange={handleChange} />

                  {/*   Preview */}
                  {imagePreview && (
                    <Image
                      width={100}
                      height={100}
                      src={imagePreview}
                      alt="Banner Preview"
                      className="mt-2 img-fluid rounded"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                </Form.Group>
              </Col>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sub Title</Form.Label>
                  <Form.Control type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL</Form.Label>
                  <Form.Control type="text" name="url" value={formData.url} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Counter */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as={'h4'}>Counter</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Happy Customers</Form.Label>
                  <Form.Control type="number" name="happyCustomers" value={formData.happyCustomers} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col lg={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Electronics Products</Form.Label>
                  <Form.Control type="number" name="electronicsProducts" value={formData.electronicsProducts} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col lg={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Active Salesman</Form.Label>
                  <Form.Control type="number" name="activeSalesman" value={formData.activeSalesman} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col lg={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Store Worldwide</Form.Label>
                  <Form.Control type="number" name="storeWorldwide" value={formData.storeWorldwide} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Why Choose Us */}
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as={'h4'}>Why Choose Us</CardTitle>
          </CardHeader>
          <CardBody>
            {formData.whyChooseUs.map((item, index) => (
              <Row key={index} className="mb-4 border-bottom pb-3">
                <Col lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Image</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleWhyChooseChange(index, 'image', file)
                      }}
                    />
                    {item.preview && (
                      <Image
                        width={100}
                        height={100}
                        src={item.preview}
                        alt="Why Choose Us Preview"
                        className="mt-2 img-fluid rounded"
                        style={{ maxHeight: '200px' }}
                      />
                    )}
                  </Form.Group>
                </Col>
                <Col lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" value={item.title} onChange={(e) => handleWhyChooseChange(index, 'title', e.target.value)} />
                  </Form.Group>
                </Col>
                <Col lg={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Short Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={item.shortDesc}
                      onChange={(e) => handleWhyChooseChange(index, 'shortDesc', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            ))}
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <button type="submit" disabled={isUpdating} className="btn btn-primary w-100">
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </Col>
          </Row>
        </div>
      </Form>
    </Container>
  )
}

export default AboutUS
