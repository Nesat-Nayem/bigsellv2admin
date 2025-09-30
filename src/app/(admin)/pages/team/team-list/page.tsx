import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import TeamList from './components/TeamList'

export const metadata: Metadata = { title: 'Team List' }

const TeamPage = () => {
  return (
    <>
      <PageTItle title=" Team List" />
      <TeamList />
    </>
  )
}

export default TeamPage
