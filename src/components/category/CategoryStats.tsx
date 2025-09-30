'use client'

import React from 'react'
import { Card, CardBody, Row, Col, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetCategoriesQuery, useGetCategoryTreeQuery } from '@/store/productCategoryApi'

const CategoryStats = () => {
  const { data: allCategories = [], isLoading: loadingAll } = useGetCategoriesQuery({
    page: 1,
    limit: 1000 // Get all categories for stats
  })
  
  const { data: categoryTree = [], isLoading: loadingTree } = useGetCategoryTreeQuery({
    maxDepth: 5
  })

  const isLoading = loadingAll || loadingTree

  if (isLoading) {
    return (
      <Row>
        <Col xl={3} md={6}>
          <Card>
            <CardBody className="text-center">
              <Spinner animation="border" size="sm" />
              <p className="mt-2 mb-0">Loading stats...</p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }

  const totalCategories = allCategories.length
  const activeCategories = allCategories.filter(cat => cat.isActive !== false).length
  const inactiveCategories = totalCategories - activeCategories
  const rootCategories = allCategories.filter(cat => !cat.parentId).length

  const categoriesByLevel = allCategories.reduce((acc, cat) => {
    const level = cat.level || 0
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const maxLevel = Math.max(...Object.keys(categoriesByLevel).map(Number), 0)

  const stats = [
    {
      title: 'Total Categories',
      value: totalCategories,
      icon: 'solar:folder-broken',
      color: 'primary',
      bgClass: 'bg-primary-subtle'
    },
    {
      title: 'Active Categories',
      value: activeCategories,
      icon: 'solar:check-circle-broken',
      color: 'success',
      bgClass: 'bg-success-subtle'
    },
    {
      title: 'Root Categories',
      value: rootCategories,
      icon: 'solar:home-broken',
      color: 'info',
      bgClass: 'bg-info-subtle'
    },
    {
      title: 'Max Depth',
      value: maxLevel,
      icon: 'solar:layers-broken',
      color: 'warning',
      bgClass: 'bg-warning-subtle'
    }
  ]

  return (
    <>
      {/* <Row className="mb-4">
        {stats.map((stat, index) => (
          <Col key={index} xl={3} md={6} className="mb-3">
            <Card className="h-100">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className={`rounded-circle p-3 me-3 ${stat.bgClass}`}>
                    <IconifyIcon 
                      icon={stat.icon} 
                      className={`fs-24 text-${stat.color}`} 
                    />
                  </div>
                  <div>
                    <h3 className="mb-1 fw-bold">{stat.value}</h3>
                    <p className="text-muted mb-0">{stat.title}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row> */}

      {/* Level Distribution */}
      {Object.keys(categoriesByLevel).length > 1 && (
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody>
                <h5 className="card-title mb-4">
                  <IconifyIcon icon="solar:chart-2-broken" className="me-2" />
                  Categories by Level
                </h5>
                <div className="row g-3">
                  {Object.entries(categoriesByLevel)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([level, count]) => (
                      <div key={level} className="col-md-3">
                        <div className="text-center p-3 border rounded">
                          <h4 className="mb-1">{count}</h4>
                          <p className="text-muted mb-0">
                            Level {level} {Number(level) === 0 ? '(Root)' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </>
  )
}

export default CategoryStats
