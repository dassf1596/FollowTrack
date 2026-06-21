import React from 'react'
import { SearchClient } from '@/components/SearchClient'

export const runtime = 'edge'

export default async function SearchPage() {
  return (
    <SearchClient />
  )
}
