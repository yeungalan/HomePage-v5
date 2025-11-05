import { createContext } from 'react'
import { LanguageData } from '../types'

export const LanguageContext = createContext<LanguageData | null>(null)
