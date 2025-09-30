import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EditBlogCategory from './components/EditBlogCategory'

export const metadata: Metadata = { title: 'Edit Blog Category' }

const BlogCategoryEditPage = () => {
  return (
    <>
      <PageTItle title="Edit Blog Category" />
      <EditBlogCategory />
    </>
  )
}

export default BlogCategoryEditPage
