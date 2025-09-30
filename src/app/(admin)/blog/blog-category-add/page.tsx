import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddBlogCategory from './components/AddBlogCategory'

export const metadata: Metadata = { title: 'Add Blog Category' }

const BlogCategoryAddPage = () => {
  return (
    <>
      <PageTItle title="Add Blog Category" />
      <AddBlogCategory />
    </>
  )
}

export default BlogCategoryAddPage
