'use client'

import { useGetOfferBannerQuery, useUpdateOfferBannerMutation } from '@/store/offerBannerApi'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Button, Spinner } from 'react-bootstrap'

interface BannerForm {
  title: string
  subtitle: string
  offer: string
  url: string
  image: File | null
  preview: string | null
}

const OfferBanner = () => {
  const { data: offerBanners, isLoading, isError } = useGetOfferBannerQuery()
  const [updateOfferBanner, { isLoading: isUpdating }] = useUpdateOfferBannerMutation()

  const [banners, setBanners] = useState<BannerForm[]>([
    { title: '', subtitle: '', offer: '', url: '', image: null, preview: null },
    { title: '', subtitle: '', offer: '', url: '', image: null, preview: null },
    { title: '', subtitle: '', offer: '', url: '', image: null, preview: null },
  ])

  // Prefill from API
  useEffect(() => {
    if (offerBanners && offerBanners.length > 0) {
      setBanners((prev) =>
        prev.map((b, i) => ({
          title: offerBanners[i]?.title || '',
          subtitle: offerBanners[i]?.subtitle || '',
          offer: offerBanners[i]?.offer || '',
          url: offerBanners[i]?.url || '',
          image: null,
          preview: offerBanners[i]?.image || null,
        })),
      )
    }
  }, [offerBanners])

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    setBanners((prev) =>
      prev.map((b, i) =>
        i === index
          ? {
              ...b,
              [name]: files && files.length > 0 ? files[0] : value,
              ...(files && files.length > 0 ? { preview: URL.createObjectURL(files[0]) } : {}),
            }
          : b,
      ),
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      banners.forEach((b, i) => {
        formData.append(`banners[${i}][title]`, b.title)
        formData.append(`banners[${i}][subtitle]`, b.subtitle)
        formData.append(`banners[${i}][offer]`, b.offer)
        formData.append(`banners[${i}][url]`, b.url)
        if (b.image) {
          formData.append(`banners[${i}][image]`, b.image)
        }
      })
      await updateOfferBanner(formData).unwrap()
      alert('Offer banners updated successfully!')
    } catch (error) {
      console.error('Error updating offer banners:', error)
      alert('Failed to update banners')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading offer banners</div>

  return (
    <Container>
      <form onSubmit={handleSave}>
        {banners.map((banner, index) => (
          <Card key={index} className="mb-3">
            <CardHeader>
              <CardTitle as="h4">Upload Offer Banner {index + 1}</CardTitle>
            </CardHeader>
            <CardBody>
              <Row className="g-3">
                <Col lg={4}>
                  <label className="form-label">Upload Banner</label>
                  <input type="file" name="image" className="form-control" onChange={(e) => handleChange(index, e)} />
                  {banner.preview && (
                    <Image
                      width={100}
                      height={100}
                      src={banner.preview}
                      alt="Preview"
                      className="mt-2 img-fluid rounded"
                      style={{ maxHeight: 150 }}
                    />
                  )}
                </Col>
                <Col lg={4}>
                  <label className="form-label">Title</label>
                  <input type="text" name="title" value={banner.title} className="form-control" onChange={(e) => handleChange(index, e)} />
                </Col>
                <Col lg={4}>
                  <label className="form-label">Sub Title</label>
                  <input type="text" name="subtitle" value={banner.subtitle} className="form-control" onChange={(e) => handleChange(index, e)} />
                </Col>
                <Col lg={4}>
                  <label className="form-label">% Off</label>
                  <input type="text" name="offer" value={banner.offer} className="form-control" onChange={(e) => handleChange(index, e)} />
                </Col>
                <Col lg={4}>
                  <label className="form-label">URL</label>
                  <input type="text" name="url" value={banner.url} className="form-control" onChange={(e) => handleChange(index, e)} />
                </Col>
              </Row>
            </CardBody>
          </Card>
        ))}

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button type="submit" variant="primary" className="w-100" disabled={isUpdating}>
                {isUpdating ? <Spinner animation="border" size="sm" /> : 'Save'}
              </Button>
            </Col>
          </Row>
        </div>
      </form>
    </Container>
  )
}

export default OfferBanner
