import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AboutUS from './components/AboutUs'

export const metadata: Metadata = { title: 'About Us' }

const AboutPage = () => {
  return (
    <>
      <PageTItle title="About Us" />
      <AboutUS />
    </>
  )
}

export default AboutPage
