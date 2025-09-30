import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import BlogList from './components/BlogList'

export const metadata: Metadata = { title: 'Blog List' }

const BlogPage = () => {
  return (
    <>
      <PageTItle title=" Blog List" />
      <BlogList />
    </>
  )
}

export default BlogPage
