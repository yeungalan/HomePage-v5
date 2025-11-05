import { useContext } from 'react'
import { LanguageContext } from '../contexts/LanguageContext'

export const useLanguageData = () => {
  return useContext(LanguageContext)
}
