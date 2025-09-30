import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EditBlog from './components/EditBlog'

export const metadata: Metadata = { title: 'Edit Blog' }

const EditBlogPage = () => {
  return (
    <>
      <PageTItle title="Edit Blog" />
      <EditBlog />
    </>
  )
}

export default EditBlogPage
