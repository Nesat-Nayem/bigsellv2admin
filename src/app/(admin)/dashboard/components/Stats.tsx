'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import dynamic from 'next/dynamic'
import { Card, CardBody, CardFooter, CardTitle, Col, Row } from 'react-bootstrap'
import { StatType } from '../types'
import { useEffect, useMemo, useState } from 'react'
import { currency } from '@/context/constants'
import { useGetOrderSummaryQuery, useGetVendorOrderSummaryQuery } from '@/store/orderApi'
import { useGetProductSummaryQuery, useGetVendorProductSummaryQuery } from '@/store/productsApi'
import { useSelector } from 'react-redux'
import type { RootState as IRootState } from '@/store'

// Disable SSR for the chart to avoid window-related issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const StatsCard = ({ amount, change, icon, name, variant }: StatType) => {
  const getVariantColors = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          iconBg: 'rgba(102, 126, 234, 0.1)',
          iconColor: '#667eea'
        }
      case 'success':
        return {
          bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          iconBg: 'rgba(79, 172, 254, 0.1)',
          iconColor: '#4facfe'
        }
      case 'warning':
        return {
          bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          iconBg: 'rgba(250, 112, 154, 0.1)',
          iconColor: '#fa709a'
        }
      case 'danger':
        return {
          bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          iconBg: 'rgba(255, 107, 107, 0.1)',
          iconColor: '#ff6b6b'
        }
      default:
        return {
          bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          iconBg: 'rgba(102, 126, 234, 0.1)',
          iconColor: '#667eea'
        }
    }
  }

  const colors = getVariantColors(variant)

  return (
    <Col xs={12} sm={6} lg={4} className="mb-4">
      <Card 
        className="border-0 h-100 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          borderRadius: '16px',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'
        }}
      >
        {/* Decorative gradient bar */}
        <div 
          className="position-absolute top-0 start-0 w-100"
          style={{
            height: '4px',
            background: colors.bg
          }}
        />
        
        <CardBody className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div 
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: '64px',
                height: '64px',
                background: colors.iconBg,
                border: `2px solid ${colors.iconColor}20`
              }}
            >
              <IconifyIcon 
                icon={icon} 
                style={{ 
                  fontSize: '28px', 
                  color: colors.iconColor 
                }} 
              />
            </div>
            
            {change && change !== '—' && (
              <div className="text-end">
                <span 
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    background: `${colors.iconColor}15`,
                    color: colors.iconColor,
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-muted mb-2 fw-medium" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>
              {name.toUpperCase()}
            </p>
            <h2 
              className="mb-0 fw-bold"
              style={{ 
                fontSize: '2rem',
                color: '#2d3748',
                lineHeight: '1.2'
              }}
            >
              {amount}
            </h2>
          </div>
        </CardBody>
        
        <div 
          className="position-absolute bottom-0 end-0 opacity-25"
          style={{
            width: '80px',
            height: '80px',
            background: colors.bg,
            borderRadius: '50%',
            transform: 'translate(30px, 30px)'
          }}
        />
      </Card>
    </Col>
  )
}

const Stats = () => {
  const [chartHeight, setChartHeight] = useState(380)

  // Role-aware summaries
  const role = useSelector((s: IRootState) => (s as any)?.auth?.user?.role)

  const { data: adminOrderSummary } = useGetOrderSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 60000,
    skip: role === 'vendor',
  })
  const { data: vendorOrderSummary } = useGetVendorOrderSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 60000,
    skip: role !== 'vendor',
  })

  const { data: adminProductSummary } = useGetProductSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 60000,
    skip: role === 'vendor',
  })
  const { data: vendorProductSummary } = useGetVendorProductSummaryQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 60000,
    skip: role !== 'vendor',
  })

  const orderSummary = role === 'vendor' ? vendorOrderSummary : adminOrderSummary
  const productSummary = role === 'vendor' ? vendorProductSummary : adminProductSummary

  const formatNumber = (n: number) => new Intl.NumberFormat().format(n || 0)
  const formatCurrency = (n: number) => `${currency}${new Intl.NumberFormat().format(Math.round(n || 0))}`

  useEffect(() => {
    const updateChartHeight = () => {
      const width = window.innerWidth
      if (width < 576) {
        setChartHeight(250)
      } else if (width < 768) {
        setChartHeight(280)
      } else if (width < 992) {
        setChartHeight(300)
      } else if (width < 1200) {
        setChartHeight(320)
      } else if (width < 1400) {
        setChartHeight(350)
      } else if (width < 1920) {
        setChartHeight(380)
      } else {
        setChartHeight(400)
      }
    }

    // Initial calculation
    updateChartHeight()

    // Listen for window resize with debounce
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateChartHeight, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  const months = useMemo(() => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], [])

  const revenueSeries = useMemo(() => {
    const arr = orderSummary?.monthlyRevenue || []
    // ensure length 12
    const twelve = Array.from({ length: 12 }, (_, i) => Number(arr[i] ?? 0))
    return twelve
  }, [orderSummary])

  const ordersSeries = useMemo(() => {
    const arr = orderSummary?.monthlyOrders || []
    const twelve = Array.from({ length: 12 }, (_, i) => Number(arr[i] ?? 0))
    return twelve
  }, [orderSummary])

  const chartSeries = useMemo(() => ([
    { name: 'Revenue', type: 'bar' as const, data: revenueSeries },
    { name: 'Orders', type: 'area' as const, data: ordersSeries },
  ]), [revenueSeries, ordersSeries])

  const chartOptions: ApexOptions = useMemo(() => {
    const maxVal = Math.max(...revenueSeries, ...ordersSeries, 0)
    const yAxis: ApexOptions['yaxis'] = {
      min: 0,
      ...(maxVal <= 0 ? { max: 5 } : {}),
      axisBorder: { show: false },
    }
    return {
      chart: {
        height: chartHeight,
        type: 'line',
        toolbar: { show: false },
      },
      stroke: { dashArray: [0, 0], width: [0, 2], curve: 'smooth' },
      fill: {
        opacity: [1, 1],
        type: ['solid', 'gradient'],
        gradient: { type: 'vertical', inverseColors: false, opacityFrom: 0.5, opacityTo: 0, stops: [0, 90] },
      },
      markers: { size: [0, 0], strokeWidth: 2, hover: { size: 4 } },
      xaxis: { categories: months, axisTicks: { show: false }, axisBorder: { show: false } },
      yaxis: yAxis,
      grid: {
        show: true,
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: -2, bottom: 0, left: 10 },
      },
      legend: {
        show: true,
        horizontalAlign: 'center',
        offsetX: 0,
        offsetY: 5,
        markers: { size: 9, strokeWidth: 0, fillColors: undefined, shape: 'circle' as const },
        itemMargin: { horizontal: 10, vertical: 0 },
      },
      plotOptions: { bar: { columnWidth: '30%', barHeight: '70%', borderRadius: 3 } },
      colors: ['#ff6c2f', '#22c55e'],
      tooltip: { shared: true },
    }
  }, [chartHeight, months, revenueSeries, ordersSeries])

  const hasAnyData = useMemo(() => {
    return revenueSeries.some((v) => v > 0) || ordersSeries.some((v) => v > 0)
  }, [revenueSeries, ordersSeries])

  // Dynamic cards
  const cardsData: StatType[] = useMemo(() => {
    return [
      {
        icon: 'bxs:backpack',
        name: 'Total Products',
        amount: formatNumber(productSummary?.totalProducts ?? 0),
        variant: 'primary',
        change: '—',
      },
      {
        icon: 'solar:cart-5-bold-duotone',
        name: 'Total Orders',
        amount: formatNumber(orderSummary?.totalOrders ?? 0),
        variant: 'success',
        change: '—',
      },
      {
        icon: 'bx:coin',
        name: 'Total Revenue',
        amount: formatCurrency(orderSummary?.totalRevenue ?? 0),
        variant: 'warning',
        change: '—',
      },
    ]
  }, [orderSummary, productSummary])

  return (
    <>
      {/* Stats Cards */}
      <Col xs={12} xxl={5} className="mb-4 mb-xxl-0 dashboard-stats">
        <Row className="g-3 g-lg-4">
          {cardsData.map((item, idx) => (
            <StatsCard key={idx} {...item} />
          ))}
        </Row>
      </Col>
      
      {/* Chart Section */}
      <Col xs={12} xxl={7}>
        <Card className="h-100 border-0 shadow-sm">
          <CardBody className="responsive-spacing">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
              <CardTitle as={'h4'} className="mb-0 fw-bold text-dark">This Yr Sell</CardTitle>
              <div className="d-flex flex-wrap gap-2 chart-buttons">
                <button type="button" className="btn btn-sm btn-outline-secondary">
                  ALL
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary">
                  1M
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary">
                  6M
                </button>
                <button type="button" className="btn btn-sm btn-secondary active">
                  1Y
                </button>
              </div>
            </div>
            <div dir="ltr" className="chart-container">
              {hasAnyData ? (
                <ReactApexChart 
                  options={chartOptions} 
                  series={chartSeries} 
                  height={chartHeight} 
                  type="line" 
                  className="apex-charts w-100" 
                />
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center text-muted">
                  <IconifyIcon icon="solar:chart-2-broken" className="fs-32 mb-2" />
                  <div className="mb-1">No chart data yet</div>
                  <small>Mark some orders as Delivered or create more orders to populate this chart.</small>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

export default Stats
