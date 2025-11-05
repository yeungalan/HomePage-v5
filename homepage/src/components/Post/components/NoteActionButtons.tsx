import React, { useState } from 'react'
import { ActionButton } from './ActionButton'

export const NoteActionButtons: React.FC = () => {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(12)

  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Demo Note - Standalone Version',
        text: 'Check out this demo note!',
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleComment = () => {
    // Scroll to comments section (if it existed)
    alert('Comments feature would be here!')
  }

  const handleSubscribe = () => {
    alert('Subscribe feature would be here!')
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Actions</h3>
      <div className="flex flex-col space-y-2">
        <ActionButton
          icon={liked ? '❤️' : '🤍'}
          label="Like"
          onClick={handleLike}
          count={likeCount}
        />
        <ActionButton icon="📤" label="Share" onClick={handleShare} />
        <ActionButton icon="💬" label="Comments" onClick={handleComment} />
        <ActionButton icon="🔔" label="Subscribe" onClick={handleSubscribe} />
      </div>
    </div>
  )
}
