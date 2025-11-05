import React from 'react'

interface NoteBannerProps {
  type: string
  message: string
}

export const NoteBanner: React.FC<NoteBannerProps> = ({ type, message }) => {
  const bgColor =
    type === 'warning'
      ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
      : 'bg-blue-100 border-blue-400 text-blue-800'

  return (
    <div className={`border-l-4 p-4 mb-4 ${bgColor}`}>
      <p>{message}</p>
    </div>
  )
}
