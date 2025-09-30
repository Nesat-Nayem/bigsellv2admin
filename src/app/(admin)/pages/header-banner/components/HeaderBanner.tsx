'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Spinner } from 'react-bootstrap'
import { useGetHeaderBannerQuery, useUpdateHeaderBannerMutation } from '@/store/headerBannerApi'
import Image from 'next/image'

const HeaderBanner = () => {
  const { data: banner, isLoading } = useGetHeaderBannerQuery()
  const [updateHeaderBanner, { isLoading: isUpdating }] = useUpdateHeaderBannerMutation()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('') //   support title input

  // create preview URL when file changes
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl) // cleanup
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleRemovePreview = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Please select a file!')
    if (!banner || !banner[0]?._id) return alert('No banner ID found!')

    try {
      const formData = new FormData()
      formData.append('image', file)
      if (title) formData.append('title', title)

      await updateHeaderBanner({ id: banner[0]._id, formData }).unwrap()

      alert('Banner updated successfully!')
      setFile(null)
      setPreview(null)
      setTitle('')
    } catch (err: any) {
      console.error('Upload Error:', err)
      alert(err?.data?.message || 'Something went wrong')
    }
  }

  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Upload Header Banner</CardTitle>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Spinner animation="border" />
          ) : (
            <Row>
              <Col lg={12}>
                <form onSubmit={handleSubmit}>
                  {/* Title Input */}
                  <div className="mb-3">
                    <label htmlFor="bannerTitle" className="form-label">
                      Title
                    </label>
                    <input
                      type="text"
                      id="bannerTitle"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter banner title"
                    />
                  </div>

                  {/* File Upload */}
                  <div className="mb-3">
                    <label htmlFor="bannerFile" className="form-label">
                      Upload Banner
                    </label>
                    <input type="file" id="bannerFile" className="form-control" onChange={handleFileChange} accept="image/*" />
                  </div>

                  {/* Preview new image before upload */}
                  {preview && (
                    <div className="mb-3">
                      <p>Preview:</p>
                      <Image
                        src={preview}
                        alt="New Banner Preview"
                        width={400}
                        height={200}
                        className="img-fluid rounded border"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                      />
                      <button type="button" onClick={handleRemovePreview} className="btn btn-sm btn-outline-danger mt-2">
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Show current banner if no new file selected */}
                  {!preview && banner?.[0]?.image && (
                    <div className="mb-3">
                      <p>Current Banner:</p>
                      <Image
                        src={banner[0].image}
                        alt="Header Banner"
                        width={400}
                        height={200}
                        className="img-fluid rounded border"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                    {isUpdating ? 'Uploading...' : 'Upload'}
                  </button>
                </form>
              </Col>
            </Row>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default HeaderBanner
