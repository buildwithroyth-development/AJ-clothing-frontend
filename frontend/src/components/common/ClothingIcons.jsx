import React from 'react'

/**
 * SVG-style vector clothing illustrations for categories.
 * Crafted with crisp 24x24 viewBox lines matching the store's warm aesthetic.
 */

export function ShirtIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Formal collar */}
      <path d="M9 3.2L12 6.5L15 3.2" />
      {/* Sleeves & silhouette */}
      <path d="M9 3.2L4 6.2L5.8 10L8 9V20.8H16V9L18.2 10L20 6.2L15 3.2" />
      {/* Button placket */}
      <path d="M12 6.5V20.8" />
      {/* Buttons */}
      <circle cx="12" cy="10.5" r="0.6" fill="currentColor" />
      <circle cx="12" cy="14.5" r="0.6" fill="currentColor" />
      <circle cx="12" cy="18.5" r="0.6" fill="currentColor" />
      {/* Pocket */}
      <path d="M14 9.8H16.2V12.5H14Z" />
    </svg>
  )
}

export function TShirtIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Crew neck */}
      <path d="M9.2 3.5C9.8 4.8 10.8 5.6 12 5.6C13.2 5.6 14.2 4.8 14.8 3.5" />
      {/* Short sleeves & torso */}
      <path d="M9.2 3.5L3.8 6.8L5.5 10.8L8 9.6V20.8H16V9.6L18.5 10.8L20.2 6.8L14.8 3.5" />
      {/* Hem detail */}
      <line x1="8" y1="20.8" x2="16" y2="20.8" />
    </svg>
  )
}

export function PantsIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Waistband */}
      <rect x="5.5" y="3.5" width="13" height="3" rx="1" />
      {/* Belt loops */}
      <line x1="8.5" y1="3.5" x2="8.5" y2="6.5" />
      <line x1="15.5" y1="3.5" x2="15.5" y2="6.5" />
      {/* Trouser legs */}
      <path d="M6 6.5L7.5 21H10.8L12 11.5L13.2 21H16.5L18 6.5" />
      {/* Pockets */}
      <path d="M6.5 9.5L8.8 6.8" />
      <path d="M17.5 9.5L15.2 6.8" />
    </svg>
  )
}

export function KurtaIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Mandarin / Nehru collar */}
      <path d="M10 3.2H14" />
      <path d="M10 3.2V5.8C10 6.4 10.8 7 12 7C13.2 7 14 6.4 14 5.8V3.2" />
      {/* Placket */}
      <line x1="12" y1="7" x2="12" y2="12.5" />
      <circle cx="12" cy="8.8" r="0.5" fill="currentColor" />
      <circle cx="12" cy="11.2" r="0.5" fill="currentColor" />
      {/* Sleeves & side slits (kurta length) */}
      <path d="M10 3.2L4.5 6.5L6.5 10.8L8.5 9.8V21.2H10.5V16.5H13.5V21.2H15.5V9.8L17.5 10.8L19.5 6.5L14 3.2" />
    </svg>
  )
}

export function SareeIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Blouse outline */}
      <path d="M8 4L4.8 7L6.5 10L8.5 9.2V11.5H15.5V9.2L17.5 10L19.2 7L16 4C14.5 5.5 9.5 5.5 8 4Z" />
      {/* Elegant diagonal pallu drape fold */}
      <path d="M16 4L9 14.5V21.2H15.5L18 10L16 4Z" />
      {/* Pleats */}
      <line x1="11" y1="14.5" x2="11" y2="21.2" />
      <line x1="13" y1="14.5" x2="13" y2="21.2" />
      {/* Zari / Pallu border motif */}
      <path d="M7 16.5C10 18 14 18 17 16.5" strokeDasharray="1.5 1.5" />
    </svg>
  )
}

export function DressIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Scoop neck */}
      <path d="M9 3.5C9.8 4.6 10.8 5.2 12 5.2C13.2 5.2 14.2 4.6 15 3.5" />
      {/* Straps / Bodice */}
      <path d="M9 3.5L6.5 7.5L8.5 9.2H15.5L17.5 7.5L15 3.5" />
      {/* Waistband */}
      <line x1="8.5" y1="9.2" x2="15.5" y2="9.2" />
      {/* Flared A-line skirt */}
      <path d="M8.5 9.2L4.5 21H19.5L15.5 9.2" />
      {/* Subtle drape folds */}
      <path d="M10.2 11.5L8.8 21" strokeDasharray="1 2" />
      <path d="M13.8 11.5L15.2 21" strokeDasharray="1 2" />
    </svg>
  )
}

export function JacketIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Lapels */}
      <path d="M8.5 3.5L12 9.5L15.5 3.5" />
      <path d="M8.5 3.5L3.5 7L5.5 11.5L8 10V20.8H16V10L18.5 11.5L20.5 7L15.5 3.5" />
      {/* Zipper / Centre line */}
      <line x1="12" y1="9.5" x2="12" y2="20.8" />
      {/* Zipper pull */}
      <rect x="11.2" y="10.8" width="1.6" height="2.5" rx="0.5" fill="currentColor" />
      {/* Pocket flaps */}
      <line x1="6.5" y1="14.5" x2="9" y2="14.5" />
      <line x1="15" y1="14.5" x2="17.5" y2="14.5" />
    </svg>
  )
}

export function FootwearIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Sneaker / shoe profile */}
      <path d="M2.5 17.5C4 17.5 5 15 8 15H11.5L14 9.5C14.8 9.5 15.5 10.2 15.5 11V14.5H19C20.7 14.5 21.8 16 21.8 17.5V18.5H2.5V17.5Z" />
      {/* Sole tread */}
      <line x1="2.5" y1="18.5" x2="21.8" y2="18.5" />
      {/* Eyelets & laces */}
      <line x1="11.5" y1="12" x2="13.5" y2="12" />
      <line x1="11" y1="13.5" x2="13" y2="13.5" />
    </svg>
  )
}

export function AccessoriesIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Baseball / peak cap crown */}
      <path d="M4.5 14C4.5 9 8 5 13 5C17.5 5 20.5 8.5 20.5 13H4.5Z" />
      {/* Visor / Brim */}
      <path d="M3.5 14H21C22 14 22.5 15 21 16.2C19 17.8 16 18.5 13 18.5C10 18.5 6 17.5 4 16C2.8 15.2 2.8 14 3.5 14Z" />
      {/* Top button */}
      <circle cx="13" cy="4.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

export function DefaultBagIcon({ size = 24, className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Boutique shopping bag */}
      <path d="M6 8.5H18L16.8 21H7.2L6 8.5Z" />
      {/* Handle */}
      <path d="M9.5 8.5V6C9.5 4.6 10.6 3.5 12 3.5C13.4 3.5 14.5 4.6 14.5 6V8.5" />
      {/* Emblem / Star tag */}
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
    </svg>
  )
}

/**
 * Returns the matching SVG vector clothing icon based on dynamic category name
 */
export function getVectorCategoryIcon(category = '', options = {}) {
  const c = (category || '').toLowerCase()
  const { size = 26, strokeWidth = 1.8, className = '' } = options

  if (/shirt/.test(c) && !/t[ -]?shirt/.test(c)) {
    return <ShirtIcon size={size} strokeWidth={strokeWidth} className={className} />
  }
  if (/pant|trouser|bottom|jeans|denim|chinos|jogger|cargo/.test(c)) {
    return <PantsIcon size={size} strokeWidth={strokeWidth} className={className} />
  }
  if (/kurta|kurtha/.test(c)) {
    return <KurtaIcon size={size} strokeWidth={strokeWidth} className={className} />
  }
  if (/saree|sari|ethnic|traditional/.test(c)) {
    return <SareeIcon size={size} strokeWidth={strokeWidth} className={className} />
  }
  if (/tee|t[ -]?shirt|top|polo/.test(c)) {
    return <TShirtIcon size={size} strokeWidth={strokeWidth} className={className} />
  }
  if (/dress|frock|gown|skirt|onepiece/.test(c)) {
    return <DressIcon size={size} strokeWidth={strokeWidth} className={className} />
  }
  if (/jacket|coat|hoodie|winter|sweater|blazer|cardigan/.test(c)) {
    return <JacketIcon size={size} strokeWidth={strokeWidth} className={className} />
  }
  if (/shoe|footwear|sandal|sneaker|heel|boot/.test(c)) {
    return <FootwearIcon size={size} strokeWidth={strokeWidth} className={className} />
  }
  if (/accessori|cap|hat|belt|wallet|tie|bag|scarf/.test(c)) {
    return <AccessoriesIcon size={size} strokeWidth={strokeWidth} className={className} />
  }

  return <DefaultBagIcon size={size} strokeWidth={strokeWidth} className={className} />
}

export default getVectorCategoryIcon
