"use client";

export default function Avatar({ body }) {
  const neckWidth = 24 * (body.shoulder / 38) * 0.9;

  const shoulderWidth = body.shoulder * 1.5;
  const chestWidth = body.chest * 0.5;
  const waistWidth = body.waist * 0.7;
  const hipsWidth = body.hips * 0.7;

  const baseHeight = 340;
  const hScale = body.height / 170;
  const avatarHeight = baseHeight * hScale;
  const shirtHipWidth = hipsWidth + 20;

  return (
    <div className="flex justify-center items-center">
      <svg
        width="220"
        height={avatarHeight}
        viewBox="0 0 220 340"
        className="transition-all duration-300"
      >
        {/* Center Line */}
        <line
          x1="110"
          y1="0"
          x2="110"
          y2="340"
          stroke="#e2e8f0"
          strokeWidth="0.5"
          strokeDasharray="3 3"
        />

        {/* Head */}
        <circle
          cx="110"
          cy="42"
          r="16"
          fill={body.skinColor}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* Neck */}
        <rect
          x={110 - neckWidth / 2}
          y="58"
          width={neckWidth}
          height="12"
          fill={body.skinColor}
          stroke="#cbd5e1"
          strokeWidth="0.5"
        />

        {/* Body */}
        <path
          d={`
            M ${110 - shoulderWidth / 2} 70
            Q ${110 - chestWidth / 2} 115, ${110 - waistWidth / 2} 150
            Q ${110 - hipsWidth / 2} 185, ${110 - hipsWidth / 2.1} 220
            L ${110 + hipsWidth / 2.1} 220
            Q ${110 + hipsWidth / 2} 185, ${110 + waistWidth / 2} 150
            Q ${110 + chestWidth / 2} 115, ${110 + shoulderWidth / 2} 70
            Z
          `}
          fill={body.skinColor}
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

      {/* Left Leg */}
        <line
          x1={110 - hipsWidth / 4}
          y1="220"
          x2={110 - hipsWidth / 4}
          y2="320"
          stroke={body.skinColor}
          strokeWidth="13"
          strokeLinecap="round"
        />

        {/* Right Leg */}
        <line
          x1={110 + hipsWidth / 4}
          y1="220"
          x2={110 + hipsWidth / 4}
          y2="320"
          stroke={body.skinColor}
          strokeWidth="13"
          strokeLinecap="round"
        />
        {/* Garment Overlay */}

<path
  d={`
    M ${110 - shoulderWidth / 2} 75

    Q ${110 - chestWidth / 2} 115,
      ${110 - waistWidth / 2} 160
Q ${110 - shirtHipWidth / 2} 200,
  ${110 - shirtHipWidth / 2} 260

L ${110 + shirtHipWidth / 2} 260

Q ${110 + shirtHipWidth / 2} 200,
  ${110 + waistWidth / 2} 160

    Q ${110 + chestWidth / 2} 115,
      ${110 + shoulderWidth / 2} 75

    Z
  `}
  fill="#2563eb"
  opacity="0.55"
/>
        {/* Left Arm */}
        <path
          d={`
            M ${110 - shoulderWidth / 2} 70
            Q ${100 - shoulderWidth / 2} 120,
              ${100 - shoulderWidth / 2} 180
          `}
          stroke={body.skinColor}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right Arm */}
        <path
          d={`
            M ${110 + shoulderWidth / 2} 70
            Q ${120 + shoulderWidth / 2} 120,
              ${120 + shoulderWidth / 2} 180
          `}
          stroke={body.skinColor}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        
      </svg>
    </div>
  );
}