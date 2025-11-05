import { createContext } from 'react'
import { NoteWrappedPayload } from '../types'

export const CurrentNoteDataContext = createContext<NoteWrappedPayload | null>(null)
