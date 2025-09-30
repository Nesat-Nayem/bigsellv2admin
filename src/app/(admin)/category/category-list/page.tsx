import React from 'react'
import CategoryList from './components/CategoryList'
import PageTItle from '@/components/PageTItle'
import CategoryStats from '@/components/category/CategoryStats'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Category Management' }

const CategoryListPage = () => {
  return (
    <>
      <PageTItle title="CATEGORY MANAGEMENT" />
      <CategoryStats />
      <CategoryList />
    </>
  )
}

export default CategoryListPage
