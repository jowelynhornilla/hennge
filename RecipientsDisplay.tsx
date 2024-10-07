import { useEffect, useMemo, useRef, useState } from 'react'
import RecipientsBadge from './RecipientsBadge'
import styled from 'styled-components'

export interface RecipientsDisplayProps {
  recipients?: string[]
}

const MORE_RECIPIENTS_INDICATOR_TEXT = ', ...'

const TooltipContainer = styled.div`
  position: fixed;
  top: 8px;
  right: 8px;
  background-color: #666;
  color: #f0f0f0;
  padding: 8px 16px;
  border-radius: 24px;
  display: flex;
  align-items: center;
`

const RecipientsContainer = styled.div`
  display: flex;
  align-items: center;
`

const RecipientsTextContainer = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  flex: 1;
  display: inline-block;
`

export default function RecipientsDisplay({
  recipients,
}: RecipientsDisplayProps) {
  const recipientsContainerRef = useRef<HTMLDivElement>(null)

  const [visibleRecipients, setVisibleRecipients] = useState<string[]>([])
  const [showTooltip, setShowTooltip] = useState<boolean>(false)

  const trimmedCount = useMemo(() => {
    if (!recipients || !visibleRecipients.length) return 0
    return recipients.length - visibleRecipients.length
  }, [visibleRecipients])

  const updateDisplayedRecipients = () => {
    if (!recipientsContainerRef.current || !recipients?.length) {
      return
    }

    setVisibleRecipients([])

    const recipientsContainerWidth =
      recipientsContainerRef.current.getBoundingClientRect().width
    let availableWidth = recipientsContainerWidth

    const recipientElement = document.createElement('span')
    recipientElement.style.position = 'absolute'
    recipientElement.style.whiteSpace = 'nowrap'
    recipientElement.style.visibility = 'hidden'
    document.body.appendChild(recipientElement)

    const displayedRecipients: string[] = []
    let trimmedCount = recipients.length

    for (let i = 0; i < recipients.length; i++) {
      const recipientText = recipients[i]

      recipientElement.textContent =
        i === 0 ? recipientText : `, ${recipientText}`

      const recipientsWidth = recipientElement.getBoundingClientRect().width

      if (availableWidth >= recipientsWidth || i === 0) {
        displayedRecipients.push(recipients[i])
        availableWidth -= recipientsWidth
        trimmedCount--
      } else {
        break
      }
    }

    if (trimmedCount > 0) {
      recipientElement.textContent = MORE_RECIPIENTS_INDICATOR_TEXT
      const ellipsisWidth = recipientElement.getBoundingClientRect().width

      while (displayedRecipients.length > 1 && availableWidth < ellipsisWidth) {
        const removedRecipient = displayedRecipients.pop()
        recipientElement.textContent = `, ${removedRecipient}`
        availableWidth += recipientElement.getBoundingClientRect().width
        trimmedCount++
      }
    }

    setVisibleRecipients(displayedRecipients)

    document.body.removeChild(recipientElement)
  }

  useEffect(() => {
    updateDisplayedRecipients()
    window.addEventListener('resize', updateDisplayedRecipients)
    return () => {
      window.removeEventListener('resize', updateDisplayedRecipients)
    }
  }, [recipients])

  useEffect(() => {
    if (visibleRecipients.length) {
      updateDisplayedRecipients()
    }
  }, [trimmedCount])

  return (
    <RecipientsContainer>
      <RecipientsTextContainer
        ref={recipientsContainerRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {visibleRecipients.join(', ')}
        {trimmedCount > 0 && MORE_RECIPIENTS_INDICATOR_TEXT}
      </RecipientsTextContainer>
      {trimmedCount > 0 && (
        <>
          <RecipientsBadge numTruncated={trimmedCount} />
          {showTooltip && (
            <TooltipContainer>{recipients?.join(', ')}</TooltipContainer>
          )}
        </>
      )}
    </RecipientsContainer>
  )
}
