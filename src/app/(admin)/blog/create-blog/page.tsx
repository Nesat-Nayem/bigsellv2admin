import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CreateBlog from './components/CreateBlog'

export const metadata: Metadata = { title: 'Create Blog' }

const CreateBlogPage = () => {
  return (
    <>
      <PageTItle title="Create Blog" />
      <CreateBlog />
    </>
  )
}

export default CreateBlogPage
