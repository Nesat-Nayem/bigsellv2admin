import React from 'react'
import LockScreen from './components/LockScreen'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Lock Screen' }

const LockScreenPage = () => {
  return (
    <>
      <LockScreen />
    </>
  )
}

export default LockScreenPage
