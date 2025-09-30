import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EditTeam from './components/EditTeam'

export const metadata: Metadata = { title: 'Edit Team' }

const EditTeamPage = () => {
  return (
    <>
      <PageTItle title="Edit Team" />
      <EditTeam />
    </>
  )
}

export default EditTeamPage
