'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Does this app connect to Instagram or automate logins?',
    answer: 'No. This application does not connect to Instagram, require your Instagram credentials, or automate any crawling or scraping actions. It operates completely offline from third-party social networks. You must manually provide lists by pasting usernames or uploading CSV/TXT files that you have full permission to use.',
  },
  {
    question: 'How can I safely acquire my follower lists to upload?',
    answer: 'The safest method is utilizing Instagram’s native "Download Your Information" tool under Account Settings. Request a download of your data in JSON or HTML format, extract the followers list, and copy-paste or upload the file directly. This method uses official data exports and complies fully with community guidelines.',
  },
  {
    question: 'Is my data isolated and private?',
    answer: 'Absolutely. We use Supabase PostgreSQL database schemas with Row Level Security (RLS) enabled on every single table. Each snapshot and follower username record is hard-linked to your private user ID. No other user can search or access your files under any circumstances.',
  },
  {
    question: 'Are there limits on snapshot sizes or counts?',
    answer: 'No. You can upload large lists containing thousands of usernames. Our data parser automatically cleans up files by removing duplicates, trimming whitespace, and validating input, allowing seamless comparisons regardless of snapshot volume.',
  },
]

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4 font-sans text-sm">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className="rounded-xl border border-white/5 bg-slate-950/20 backdrop-blur-md overflow-hidden transition-colors hover:border-white/10"
          >
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between p-5 text-left font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <span>{item.question}</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-indigo-400 shrink-0 ml-4" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 ml-4" />
              )}
            </button>
            <div
              className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                isOpen ? "max-h-48 border-t border-white/5" : "max-h-0"
              )}
            >
              <p className="p-5 text-gray-400 font-sans leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
