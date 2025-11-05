import { useContext } from 'react'
import { CurrentNoteNidContext } from '../contexts/NoteNidContext'

export const useCurrentNoteNid = () => {
  return useContext(CurrentNoteNidContext)
}
