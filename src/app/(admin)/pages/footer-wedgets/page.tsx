import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import FooterWidget from './components/FooterWidget'

export const metadata: Metadata = { title: 'Footer Widgets' }

const FooterWidgetPage = () => {
  return (
    <>
      <PageTItle title="Footer Widgets" />
      <FooterWidget />
    </>
  )
}

export default FooterWidgetPage
