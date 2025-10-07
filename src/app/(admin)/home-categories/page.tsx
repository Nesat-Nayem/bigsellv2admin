import React from 'react'
import { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import HomeCategories from './components/HomeCategories'

export const metadata: Metadata = { title: 'Home Categories' }

const HomeCategoriesPage = () => {
  return (
    <>
      <PageTItle title="Home Categories" />
      <HomeCategories />
    </>
  )
}

export default HomeCategoriesPage
