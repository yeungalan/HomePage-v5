import type { Locale } from '../config'
import { enUS, type Messages } from './en-US'
import { zhHK } from './zh-HK'
import { jaJP } from './ja-JP'

export type { Messages }

export const MESSAGES: Record<Locale, Messages> = {
  'en-US': enUS,
  'zh-HK': zhHK,
  'ja-JP': jaJP,
}
