'use client'

import { useGetDiscountBannerQuery, useUpdateDiscountBannerMutation } from '@/store/discountBannerApi'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Button, Spinner } from 'react-bootstrap'

interface BannerForm {
  title: string
  offer: string
  image: File | null
  preview: string | null
}

const DiscountBanner = () => {
  const { data: discountBanner, isLoading, isError } = useGetDiscountBannerQuery()
  const [updateDiscountBanner, { isLoading: isUpdating }] = useUpdateDiscountBannerMutation()

  const [banners, setBanners] = useState<BannerForm[]>([
    { title: '', offer: '', image: null, preview: null },
    { title: '', offer: '', image: null, preview: null },
  ])

  // Prefill banners from API
  useEffect(() => {
    if (discountBanner && discountBanner.length > 0) {
      const updated = banners.map((b, i) => ({
        title: discountBanner[i]?.title || '',
        offer: discountBanner[i]?.offer || '',
        image: null,
        preview: discountBanner[i]?.image || null, // existing image as preview
      }))
      setBanners(updated)
    }
  }, [banners, discountBanner])

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
        formData.append(`banners[${i}][offer]`, b.offer)
        if (b.image) {
          formData.append(`banners[${i}][image]`, b.image)
        }
      })

      await updateDiscountBanner(formData).unwrap()
      alert('Discount banners updated successfully!')
    } catch (error) {
      console.error('Error updating discount banners:', error)
      alert('Failed to update banners')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading discount banners</div>

  return (
    <Container>
      <form onSubmit={handleSave}>
        {banners.map((banner, index) => (
          <Card key={index} className="mb-3">
            <CardHeader>
              <CardTitle as="h4">Discount Banner {index + 1}</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
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
                  <input type="text" name="title" className="form-control" value={banner.title} onChange={(e) => handleChange(index, e)} />
                </Col>
                <Col lg={4}>
                  <label className="form-label">% Off</label>
                  <input type="text" name="offer" className="form-control" value={banner.offer} onChange={(e) => handleChange(index, e)} />
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

export default DiscountBanner
