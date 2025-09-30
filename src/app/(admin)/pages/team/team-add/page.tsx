import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CreateTeam from './components/CreateTeam'

export const metadata: Metadata = { title: 'Create Team' }

const CreateTeamPage = () => {
  return (
    <>
      <PageTItle title="Create Team" />
      <CreateTeam />
    </>
  )
}

export default CreateTeamPage
