import React from 'react'
import CategoryList from './components/SubCategoryList'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import SubCategoryList from './components/SubCategoryList'

export const metadata: Metadata = { title: 'Sub Category List' }

const SubCategoryListPage = () => {
  return (
    <>
      <PageTItle title="SUB CATEGORIES LIST" />
      <SubCategoryList />
    </>
  )
}

export default SubCategoryListPage
