'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { parseUsernames } from '@/lib/parser'
import { createSnapshotAction, renameSnapshotAction, deleteSnapshotAction } from '@/app/dashboard/snapshots/actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { Camera, PlusCircle, Trash2, Edit2, Calendar, GitCompare, Eye, Upload, FileText } from 'lucide-react'
import confetti from 'canvas-confetti'

interface Snapshot {
  id: string
  name: string
  description: string | null
  follower_count: number
  created_at: string
}

interface SnapshotsClientProps {
  initialSnapshots: Snapshot[]
}

export function SnapshotsClient({ initialSnapshots }: SnapshotsClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  // Selection states for rename/delete actions
  const [activeSnapshot, setActiveSnapshot] = useState<Snapshot | null>(null)
  
  // Form states
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [uploadTab, setUploadTab] = useState<'paste' | 'file'>('paste')
  const [pasteContent, setPasteContent] = useState('')
  const [fileContent, setFileContent] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [previewUsernames, setPreviewUsernames] = useState<string[]>([])

  // Action loading states
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle manual textarea input
  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setPasteContent(text)
    const parsed = parseUsernames(text)
    setPreviewUsernames(parsed)
  }

  // Handle local text/csv file reading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)
      const parsed = parseUsernames(content)
      setPreviewUsernames(parsed)
    }
    reader.readAsText(file)
  }

  // Create Snapshot Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      toast({ description: 'Please provide a snapshot name.', variant: 'destructive' })
      return
    }
    if (previewUsernames.length === 0) {
      toast({ description: 'No valid usernames found. Please paste list or upload a file.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    const res = await createSnapshotAction(newName, newDescription || null, previewUsernames)
    setIsSubmitting(false)

    if (res.error) {
      toast({ title: 'Error creating snapshot', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'Snapshot Created!', description: `Successfully stored ${previewUsernames.length} usernames.`, variant: 'success' })
      setIsCreateOpen(false)
      resetForm()
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } })
      router.refresh()
    }
  }

  // Rename Snapshot Submit
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSnapshot || !newName.trim()) return

    setIsSubmitting(true)
    const res = await renameSnapshotAction(activeSnapshot.id, newName)
    setIsSubmitting(false)

    if (res.error) {
      toast({ title: 'Error renaming snapshot', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'Renamed Success', description: 'Snapshot renamed successfully.', variant: 'success' })
      setIsRenameOpen(false)
      setActiveSnapshot(null)
      setNewName('')
      router.refresh()
    }
  }

  // Delete Snapshot Submit
  const handleDeleteSubmit = async () => {
    if (!activeSnapshot) return

    setIsSubmitting(true)
    const res = await deleteSnapshotAction(activeSnapshot.id)
    setIsSubmitting(false)

    if (res.error) {
      toast({ title: 'Error deleting snapshot', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'Snapshot Deleted', description: 'Snapshot has been deleted from history.', variant: 'success' })
      setIsDeleteOpen(false)
      setActiveSnapshot(null)
      router.refresh()
    }
  }

  const resetForm = () => {
    setNewName('')
    setNewDescription('')
    setPasteContent('')
    setFileContent('')
    setFileName('')
    setPreviewUsernames([])
  }

  const openRenameModal = (snapshot: Snapshot) => {
    setActiveSnapshot(snapshot)
    setNewName(snapshot.name)
    setIsRenameOpen(true)
  }

  const openDeleteModal = (snapshot: Snapshot) => {
    setActiveSnapshot(snapshot)
    setIsDeleteOpen(true)
  }

  return (
    <div className="space-y-6 font-sans text-gray-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Snapshots History</h1>
          <p className="text-sm text-gray-400 mt-1">
            Store and manage lists of user followers.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="sm:w-auto font-semibold">
          <PlusCircle className="h-4.5 w-4.5 mr-2" />
          New Snapshot
        </Button>
      </div>

      {/* Snapshots Table */}
      {initialSnapshots.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border border-white/5 bg-slate-950/20 backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4 animate-pulse">
            <Camera className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No snapshots created yet</h3>
          <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
            Upload or paste follower username records to establish history tracking and unlock dashboard analytics.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusCircle className="h-4.5 w-4.5 mr-2" />
            Create First Snapshot
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Snapshot Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Follower Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSnapshots.map((snapshot) => {
                const date = new Date(snapshot.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
                return (
                  <TableRow key={snapshot.id}>
                    <TableCell className="font-bold text-white">
                      {snapshot.name}
                    </TableCell>
                    <TableCell className="text-gray-400 max-w-[200px] truncate">
                      {snapshot.description || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {date}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-lg bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                        {snapshot.follower_count.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/dashboard/snapshots/${snapshot.id}`} title="View Details">
                          <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openRenameModal(snapshot)}
                          title="Rename"
                          className="h-8 w-8 cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Link href={`/dashboard/compare?a=${snapshot.id}`} title="Compare with another">
                          <Button size="icon" variant="ghost" className="h-8 w-8 cursor-pointer">
                            <GitCompare className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openDeleteModal(snapshot)}
                          title="Delete"
                          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* CREATE SNAPSHOT DIALOG */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false)
          resetForm()
        }}
        title="Create Follower Snapshot"
        description="Paste user records or upload a text file to create a follower snapshot."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-left font-sans">
          <div className="space-y-1.5">
            <Label htmlFor="name">Snapshot Name</Label>
            <Input
              id="name"
              placeholder="e.g. June 2026 Snapshot"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Exported from profile download data"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          {/* Import Tabs */}
          <div className="space-y-3">
            <div className="flex border-b border-white/10">
              <button
                type="button"
                onClick={() => {
                  setUploadTab('paste')
                  setPreviewUsernames(parseUsernames(pasteContent))
                }}
                className={`flex-1 pb-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  uploadTab === 'paste'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Paste Usernames
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadTab('file')
                  setPreviewUsernames(parseUsernames(fileContent))
                }}
                className={`flex-1 pb-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  uploadTab === 'file'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Upload File (TXT/CSV)
              </button>
            </div>

            {uploadTab === 'paste' ? (
              <div className="space-y-1.5">
                <Label htmlFor="paste">Usernames list</Label>
                <Textarea
                  id="paste"
                  rows={6}
                  placeholder="john&#10;alex&#10;emma&#10;sarah"
                  value={pasteContent}
                  onChange={handlePasteChange}
                />
                <span className="text-2xs text-gray-500">
                  Separated by newlines, commas, or spaces. Leading @ is stripped automatically.
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="file">Select list file</Label>
                <div className="relative flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-6 bg-white/3 hover:bg-white/5 hover:border-indigo-500/50 transition-all cursor-pointer">
                  <input
                    type="file"
                    id="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-xs font-medium text-white mb-0.5">
                    {fileName ? fileName : 'Choose TXT or CSV file'}
                  </span>
                  <span className="text-2xs text-gray-400">
                    File will be parsed locally in browser
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Parsed Preview Counter */}
          <div className="rounded-xl bg-slate-950/60 border border-white/5 p-3 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-sans font-medium">Followers Detected:</span>
            <span className="font-bold text-indigo-400 text-sm font-mono">
              {previewUsernames.length} valid
            </span>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsCreateOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Snapshot
            </Button>
          </div>
        </form>
      </Dialog>

      {/* RENAME DIALOG */}
      <Dialog
        isOpen={isRenameOpen}
        onClose={() => {
          setIsRenameOpen(false)
          setActiveSnapshot(null)
          setNewName('')
        }}
        title="Rename Snapshot"
        description="Provide a new name for your historical follower snapshot."
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4 text-left font-sans">
          <div className="space-y-1.5">
            <Label htmlFor="rename">Snapshot Name</Label>
            <Input
              id="rename"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsRenameOpen(false)
                setActiveSnapshot(null)
                setNewName('')
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setActiveSnapshot(null)
        }}
        title="Confirm Deletion"
        description="Are you absolutely sure you want to delete this snapshot? All stored follower usernames for this snapshot will be permanently purged. This action cannot be undone."
      >
        <div className="space-y-4 text-left font-sans text-sm">
          {activeSnapshot && (
            <div className="rounded-xl border border-white/5 bg-slate-950 p-4">
              <div className="font-bold text-white">{activeSnapshot.name}</div>
              <div className="text-xs text-gray-400 mt-1">
                Contains {activeSnapshot.follower_count.toLocaleString()} follower names.
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDeleteOpen(false)
                setActiveSnapshot(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={isSubmitting}
              onClick={handleDeleteSubmit}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
