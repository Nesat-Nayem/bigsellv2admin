import React from 'react'
import CategoryTree from './components/CategoryTree'
import PageTitle from '@/components/PageTItle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Category Tree View' }

const CategoryTreePage = () => {
  return (
    <>
      <PageTitle title="CATEGORY TREE VIEW" />
      <CategoryTree />
    </>
  )
}

export default CategoryTreePage
