import { useContext } from 'react'
import { CurrentNoteDataContext } from '../contexts/NoteDataContext'
import { NoteWrappedPayload } from '../types'

export const useCurrentNoteDataSelector = <T,>(
  selector: (data: NoteWrappedPayload | null) => T
): T => {
  const data = useContext(CurrentNoteDataContext)
  return selector(data)
}
