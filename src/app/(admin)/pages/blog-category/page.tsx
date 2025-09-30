import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import BlogCategory from './components/BlogCategory'

export const metadata: Metadata = { title: 'Blog Category' }

const BlogCategoryPage = () => {
  return (
    <>
      <PageTItle title="Blog Category" />
      <BlogCategory />
    </>
  )
}

export default BlogCategoryPage
