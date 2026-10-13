import React from 'react'

/**
 * Hand-crafted SVG-style vector clothing illustrations.
 * - Pant: Blue denim jeans with realistic seams, pockets, wash & brass rivets
 * - Shirt: Blue formal collared shirt with structured collar, buttons & placket
 * - T Shirt: Muted green crew-neck T-shirt with ribbed neck & twin-needle hem
 * - Kurta / Ethnic: Rich terracotta/rust mandarin collar tunic
 * - Saree: Royal blue & gold border drape folds
 * - Dress: Elegant terracotta A-line silhouette
 * - Default: Refined canvas boutique tote
 *
 * Rendered inside a small, rounded-square warm beige background (~80-100px).
 */

export function DenimJeansIllustration({ size = 76, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      {/* Drop shadow */}
      <ellipse cx="48" cy="89" rx="26" ry="3" fill="#2b2621" opacity="0.09" />

      {/* Main Jeans Body (Left & Right Legs) */}
      <path
        d="M27 24.5C27 24.5 24 47 26 85C26 86.5 28 87 38 87C42.5 87 42.8 86 43 85L47 43.5L51 85C51.2 86 51.5 87 56 87C66 87 68 86.5 68 85C70 47 67 24.5 67 24.5C61 23.5 33 23.5 27 24.5Z"
        fill="#2e608c"
      />

      {/* Waistband */}
      <path
        d="M26.5 18C33 16.5 63 16.5 69.5 18L68.5 24.8C62 23.6 34 23.6 27.5 24.8L26.5 18Z"
        fill="#234970"
      />

      {/* Belt Loops */}
      <rect x="33" y="17.2" width="2.4" height="7.8" rx="0.8" fill="#1b3957" />
      <rect x="46.8" y="17.2" width="2.4" height="7.8" rx="0.8" fill="#1b3957" />
      <rect x="60.6" y="17.2" width="2.4" height="7.8" rx="0.8" fill="#1b3957" />

      {/* Inner Leg Shadow Depth */}
      <path
        d="M47 43.5L43 85C42.8 86 41.5 87 38.5 87L40.5 85L45 46.5L47 43.5Z"
        fill="#1a3754"
        opacity="0.4"
      />
      <path
        d="M47 43.5L51 85C51.2 86 52.5 87 55.5 87L53.5 85L49 46.5L47 43.5Z"
        fill="#1a3754"
        opacity="0.4"
      />

      {/* Thigh Wash / Soft Highlights */}
      <ellipse cx="35" cy="48" rx="5" ry="15" fill="#4377a6" opacity="0.5" />
      <ellipse cx="59" cy="48" rx="5" ry="15" fill="#4377a6" opacity="0.5" />

      {/* Curved Denim Pockets with golden-tan stitch */}
      <path
        d="M27.5 24.8C31.5 25.5 37 29 38 34"
        stroke="#d49b52"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="2 1.5"
      />
      <path
        d="M66.5 24.8C62.5 25.5 57 29 56 34"
        stroke="#d49b52"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="2 1.5"
      />

      {/* Coin Pocket */}
      <path
        d="M57 26.5H62V30.5H57"
        stroke="#d49b52"
        strokeWidth="1"
        strokeDasharray="1.5 1.5"
      />

      {/* Fly J-Stitch */}
      <path
        d="M47 24.8V35.5C47 38 45.5 40.5 43 41"
        stroke="#d49b52"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="2 1.5"
      />

      {/* Brass Rivet Button */}
      <circle cx="47" cy="21" r="2.2" fill="#d99f4d" />
      <circle cx="47" cy="21" r="1.5" fill="#f7ca79" />

      {/* Pocket Corner Rivets */}
      <circle cx="28" cy="25.5" r="1" fill="#c99142" />
      <circle cx="66" cy="25.5" r="1" fill="#c99142" />

      {/* Bottom Hem Stitches */}
      <line
        x1="27"
        y1="83.8"
        x2="42.5"
        y2="83.8"
        stroke="#d49b52"
        strokeWidth="1"
        strokeDasharray="2 1.5"
      />
      <line
        x1="51.5"
        y1="83.8"
        x2="67"
        y2="83.8"
        stroke="#d49b52"
        strokeWidth="1"
        strokeDasharray="2 1.5"
      />
    </svg>
  )
}

export function FormalShirtIllustration({ size = 76, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      {/* Drop shadow */}
      <ellipse cx="48" cy="88" rx="26" ry="3" fill="#2b2621" opacity="0.09" />

      {/* Shirt Body & Sleeves */}
      <path
        d="M34 16L14 26.5L19 41.5L28 37.5V83.5C28 85 35 86 48 86C61 86 68 85 68 83.5V37.5L77 41.5L82 26.5L62 16H34Z"
        fill="#4a7bb0"
      />

      {/* Subtle Torso Side Shading */}
      <path
        d="M28 42L28 83.5C32 84.5 36 85 41 85.3V42H28Z"
        fill="#36618c"
        opacity="0.32"
      />
      <path
        d="M68 42L68 83.5C64 84.5 60 85 55 85.3V42H68Z"
        fill="#36618c"
        opacity="0.32"
      />

      {/* Front Placket */}
      <rect x="44.5" y="24" width="7" height="61.5" fill="#3b6b99" />
      <line x1="44.5" y1="24" x2="44.5" y2="85.5" stroke="#2d5378" strokeWidth="0.8" />
      <line x1="51.5" y1="24" x2="51.5" y2="85.5" stroke="#2d5378" strokeWidth="0.8" />

      {/* Pearl / Ivory Buttons */}
      {[32, 44, 56, 68, 77].map((y) => (
        <g key={y}>
          <circle cx="48" cy={y} r="1.8" fill="#f1f5f9" />
          <circle cx="48" cy={y} r="0.8" fill="#94a3b8" />
        </g>
      ))}

      {/* Left Breast Pocket */}
      <path
        d="M54 36H63V47C63 48.5 58.5 51 58.5 51C58.5 51 54 48.5 54 47V36Z"
        fill="#4070a0"
        stroke="#2d5378"
        strokeWidth="0.8"
      />

      {/* Structured Crisp Collar */}
      {/* Back Neck depth */}
      <path
        d="M35 16C40 19 56 19 61 16L56 25C52 23 44 23 40 25L35 16Z"
        fill="#294a6e"
      />
      {/* Left Collar Flap */}
      <path
        d="M33 15.5L46.5 28L40 26.5L34 18L33 15.5Z"
        fill="#5a8ec2"
        stroke="#2d5378"
        strokeWidth="0.9"
      />
      {/* Right Collar Flap */}
      <path
        d="M63 15.5L49.5 28L56 26.5L62 18L63 15.5Z"
        fill="#6197cc"
        stroke="#2d5378"
        strokeWidth="0.9"
      />
      {/* Collar Tie-Notch point */}
      <polygon points="46.5,28 48,31 49.5,28 48,26.5" fill="#254263" />

      {/* Sleeve Cuff Lines */}
      <line x1="14.5" y1="38.5" x2="18.5" y2="41" stroke="#2d5378" strokeWidth="1" />
      <line x1="81.5" y1="38.5" x2="77.5" y2="41" stroke="#2d5378" strokeWidth="1" />
    </svg>
  )
}

export function MutedGreenTShirtIllustration({ size = 76, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      {/* Drop shadow */}
      <ellipse cx="48" cy="87" rx="27" ry="3" fill="#2b2621" opacity="0.09" />

      {/* T-Shirt Body & Short Sleeves */}
      <path
        d="M34 18L13 29L19 45L27 41V83C27 84.5 35 85.5 48 85.5C61 85.5 69 84.5 69 83V41L77 45L83 29L62 18C57 23 39 23 34 18Z"
        fill="#518269"
      />

      {/* Soft Torso Contour / Subtle Fabric Depth */}
      <path
        d="M27 43V83C32 84.2 38 84.8 44 85V43H27Z"
        fill="#3b6650"
        opacity="0.25"
      />
      <path
        d="M69 43V83C64 84.2 58 84.8 52 85V43H69Z"
        fill="#3b6650"
        opacity="0.25"
      />

      {/* Chest Subtle Highlight */}
      <ellipse cx="48" cy="46" rx="14" ry="12" fill="#669c81" opacity="0.32" />

      {/* Ribbed Crew Neck Collar */}
      {/* Back Inner Neck (depth) */}
      <path
        d="M35.5 18.5C40 22.5 56 22.5 60.5 18.5C57 23.5 39 23.5 35.5 18.5Z"
        fill="#2b4737"
      />
      {/* Front Crew Ribband */}
      <path
        d="M34.5 17.5C40 23.5 56 23.5 61.5 17.5C59 25 37 25 34.5 17.5Z"
        fill="#3e6852"
        stroke="#2b4737"
        strokeWidth="0.8"
      />

      {/* Short Sleeve Hem Folds */}
      <path d="M13.5 30L19.5 44" stroke="#355a46" strokeWidth="1" strokeLinecap="round" />
      <path d="M82.5 30L76.5 44" stroke="#355a46" strokeWidth="1" strokeLinecap="round" />

      {/* Bottom Twin-Needle Hem Line */}
      <path
        d="M28 81C35 82.2 61 82.2 68 81"
        stroke="#355a46"
        strokeWidth="0.9"
        strokeDasharray="2 1.5"
      />
    </svg>
  )
}

export function KurtaIllustration({ size = 76, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      <ellipse cx="48" cy="89" rx="25" ry="3" fill="#2b2621" opacity="0.09" />
      {/* Main Kurta Body */}
      <path
        d="M36 16L17 26.5L22 41.5L29 38.5V86H34V73H62V86H67V38.5L74 41.5L79 26.5L60 16H36Z"
        fill="#9c4537"
      />
      {/* Center Placket */}
      <rect x="45" y="22" width="6" height="34" fill="#803428" />
      {/* Buttons */}
      {[28, 36, 44, 52].map((y) => (
        <circle key={y} cx="48" cy={y} r="1.5" fill="#e2b168" />
      ))}
      {/* Nehru Collar */}
      <path d="M38 16H58V22H38Z" fill="#7a2f24" />
      <path d="M44 22L48 24.5L52 22" stroke="#e2b168" strokeWidth="1" />
    </svg>
  )
}

export function SareeIllustration({ size = 76, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      <ellipse cx="48" cy="88" rx="26" ry="3" fill="#2b2621" opacity="0.09" />
      {/* Blouse */}
      <path d="M34 18L21 27L25 36L32 33V42H64V33L71 36L75 27L62 18H34Z" fill="#243f63" />
      {/* Saree Pleats & Pallu Fold */}
      <path d="M62 18L35 52V86H61L71 38L62 18Z" fill="#2b507d" />
      {/* Pleat lines */}
      <line x1="43" y1="52" x2="43" y2="86" stroke="#1d3859" strokeWidth="1" />
      <line x1="51" y1="52" x2="51" y2="86" stroke="#1d3859" strokeWidth="1" />
      {/* Zari Gold Border */}
      <path d="M35 84H61" stroke="#d6a951" strokeWidth="2.5" />
      <line x1="62" y1="18" x2="35" y2="52" stroke="#d6a951" strokeWidth="1.8" />
    </svg>
  )
}

export function DressIllustration({ size = 76, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      <ellipse cx="48" cy="88" rx="27" ry="3" fill="#2b2621" opacity="0.09" />
      {/* Dress Silhouette */}
      <path
        d="M36 17C41 21 55 21 60 17L57 32L63 42H33L39 32L36 17Z"
        fill="#9c4e43"
      />
      {/* Flared A-Line Skirt */}
      <path d="M33 42L18 86H78L63 42H33Z" fill="#aa594e" />
      {/* Belt */}
      <rect x="33" y="40" width="30" height="4" rx="1" fill="#78342b" />
      <circle cx="48" cy="42" r="2.2" fill="#e2b168" />
      {/* Drape Lines */}
      <path d="M38 44L30 86" stroke="#8a4136" strokeWidth="0.8" strokeDasharray="2 1.5" />
      <path d="M58 44L66 86" stroke="#8a4136" strokeWidth="0.8" strokeDasharray="2 1.5" />
    </svg>
  )
}

export function DefaultBagIllustration({ size = 76, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      <ellipse cx="48" cy="87" rx="26" ry="3" fill="#2b2621" opacity="0.09" />
      {/* Boutique Canvas Bag */}
      <path d="M26 34H70L65 85H31L26 34Z" fill="#ded5c5" />
      {/* Bottom fold shading */}
      <path d="M31 82H65L64.5 85H31.5L31 82Z" fill="#c4baa7" />
      {/* Terracotta Handles */}
      <path
        d="M38 34V22C38 17.5 42.5 14 48 14C53.5 14 58 17.5 58 22V34"
        stroke="#9e4738"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Brand Monogram Medallion */}
      <circle cx="48" cy="55" r="7" fill="#9e4738" />
      <circle cx="48" cy="55" r="5" stroke="#f2ece1" strokeWidth="0.8" />
      <text
        x="48"
        y="58"
        textAnchor="middle"
        fontSize="7"
        fontWeight="bold"
        fill="#f2ece1"
        fontFamily="serif"
      >
        AJ
      </text>
    </svg>
  )
}

/**
 * Reusable ProductIllustration component that accepts a product category.
 * Renders the hand-crafted vector illustration within a warm beige rounded-square background.
 */
export default function ProductIllustration({
  category = '',
  size = 88,
  svgSize = 72,
  showContainer = true,
  className = '',
  style = {},
}) {
  const c = (category || '').toLowerCase()

  let illustration = null
  if (/pant|trouser|bottom|jeans|denim|chinos|jogger|cargo/.test(c)) {
    illustration = <DenimJeansIllustration size={svgSize} />
  } else if (/shirt/.test(c) && !/t[ -]?shirt/.test(c)) {
    illustration = <FormalShirtIllustration size={svgSize} />
  } else if (/tee|t[ -]?shirt|top|polo/.test(c)) {
    illustration = <MutedGreenTShirtIllustration size={svgSize} />
  } else if (/kurta|kurtha/.test(c)) {
    illustration = <KurtaIllustration size={svgSize} />
  } else if (/saree|sari|ethnic|traditional/.test(c)) {
    illustration = <SareeIllustration size={svgSize} />
  } else if (/dress|frock|gown|skirt/.test(c)) {
    illustration = <DressIllustration size={svgSize} />
  } else {
    illustration = <DefaultBagIllustration size={svgSize} />
  }

  if (!showContainer) {
    return illustration
  }

  return (
    <div
      className={`product-illustration-box ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: 14,
        background: '#f2ebe0',
        border: '1px solid rgba(220, 212, 198, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
      aria-label={`${category || 'Product'} illustration`}
    >
      {illustration}
    </div>
  )
}
