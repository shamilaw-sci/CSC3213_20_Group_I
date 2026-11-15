/** WBS-2.3 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Measurement-driven SVG avatar. */
"use client";

export type AvatarBody = {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  skinColor: string;
  gender: "Female" | "Male" | "Unisex";
};

type AvatarProps = {
  body: AvatarBody;
  garmentSize?: string;
  fitScore?: number | null;
};

type IllustrationProps = {
  chestWidth: number;
  garmentFill: string;
  garmentStroke: string;
  hipsWidth: number;
  neckWidth: number;
  shoulderWidth: number;
  skinColor: string;
  waistWidth: number;
};

const CENTER_X = 110;

const withFallback = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? value : fallback;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function FemaleIllustration({
  chestWidth,
  garmentFill,
  garmentStroke,
  hipsWidth,
  neckWidth,
  shoulderWidth,
  skinColor,
  waistWidth,
}: IllustrationProps) {
  const shoulderLeft = CENTER_X - shoulderWidth / 2;
  const shoulderRight = CENTER_X + shoulderWidth / 2;
  const chestLeft = CENTER_X - chestWidth / 2;
  const chestRight = CENTER_X + chestWidth / 2;
  const waistLeft = CENTER_X - waistWidth / 2;
  const waistRight = CENTER_X + waistWidth / 2;
  const hipLeft = CENTER_X - hipsWidth / 2;
  const hipRight = CENTER_X + hipsWidth / 2;
  const skirtWidth = clamp(hipsWidth + 24, 82, 122);
  const skirtLeft = CENTER_X - skirtWidth / 2;
  const skirtRight = CENTER_X + skirtWidth / 2;
  const leftLegX = CENTER_X - hipsWidth * 0.22;
  const rightLegX = CENTER_X + hipsWidth * 0.22;

  return (
    <g style={{ filter: "drop-shadow(0 8px 9px rgba(76, 29, 149, 0.14))" }}>
      {/* The body is drawn first so the fitted dress sits naturally above it. */}
      <g fill={skinColor} stroke="#c7a382" strokeWidth="1">
        <line x1={leftLegX} y1="216" x2={leftLegX} y2="326" stroke={skinColor} strokeWidth="14" strokeLinecap="round" />
        <line x1={rightLegX} y1="216" x2={rightLegX} y2="326" stroke={skinColor} strokeWidth="14" strokeLinecap="round" />
        <path
          d={`M ${shoulderLeft + 3} 72 Q ${shoulderLeft - 8} 128, ${shoulderLeft - 2} 202`}
          fill="none"
          stroke={skinColor}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M ${shoulderRight - 3} 72 Q ${shoulderRight + 8} 128, ${shoulderRight + 2} 202`}
          fill="none"
          stroke={skinColor}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M ${shoulderLeft} 70
              Q ${chestLeft} 102, ${chestLeft} 120
              Q ${waistLeft} 143, ${waistLeft} 158
              Q ${hipLeft} 180, ${hipLeft + 3} 216
              L ${hipRight - 3} 216
              Q ${hipRight} 180, ${waistRight} 158
              Q ${waistRight} 143, ${chestRight} 120
              Q ${chestRight} 102, ${shoulderRight} 70 Z`}
        />
        <rect x={CENTER_X - neckWidth / 2} y="51" width={neckWidth} height="18" rx="5" />
        <circle cx={CENTER_X} cy="36" r="17" />
      </g>

      {/* Give the bodice a small ease allowance, so the chest remains inside the dress rather than appearing at its edge. */}
      <path
        d={`M ${shoulderLeft + 5} 72
            Q ${chestLeft - 3} 101, ${chestLeft - 2} 121
            L ${waistLeft} 154
            L ${waistRight} 154
            L ${chestRight + 2} 121
            Q ${chestRight + 3} 101, ${shoulderRight - 5} 72
            Q ${CENTER_X} 62, ${shoulderLeft + 5} 72 Z`}
        fill={garmentFill}
        stroke={garmentStroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d={`M ${waistLeft} 153
            Q ${hipLeft - 2} 183, ${skirtLeft} 250
            Q ${CENTER_X} 257, ${skirtRight} 250
            Q ${hipRight + 2} 183, ${waistRight} 153 Z`}
        fill={garmentFill}
        fillOpacity="0.8"
        stroke={garmentStroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d={`M ${waistLeft} 154 L ${waistRight} 154`} stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <ellipse cx={leftLegX} cy="332" rx="9" ry="4.5" fill="#312e81" />
      <ellipse cx={rightLegX} cy="332" rx="9" ry="4.5" fill="#312e81" />
    </g>
  );
}

function MaleIllustration({
  chestWidth,
  garmentFill,
  garmentStroke,
  hipsWidth,
  neckWidth,
  shoulderWidth,
  skinColor,
  waistWidth,
}: IllustrationProps) {
  const shoulderLeft = CENTER_X - shoulderWidth / 2;
  const shoulderRight = CENTER_X + shoulderWidth / 2;
  const chestLeft = CENTER_X - chestWidth / 2;
  const chestRight = CENTER_X + chestWidth / 2;
  const waistLeft = CENTER_X - waistWidth / 2;
  const waistRight = CENTER_X + waistWidth / 2;
  const hipLeft = CENTER_X - hipsWidth / 2;
  const hipRight = CENTER_X + hipsWidth / 2;
  const trouserWidth = clamp(hipsWidth + 8, 62, 88);
  const trouserLeft = CENTER_X - trouserWidth / 2;
  const trouserRight = CENTER_X + trouserWidth / 2;
  const leftLegX = CENTER_X - hipsWidth * 0.23;
  const rightLegX = CENTER_X + hipsWidth * 0.23;

  return (
    <g style={{ filter: "drop-shadow(0 8px 9px rgba(30, 64, 175, 0.14))" }}>
      {/* Broader torso and thicker arms create a separate masculine figure. */}
      <g fill={skinColor} stroke="#c7a382" strokeWidth="1">
        <line x1={leftLegX} y1="205" x2={leftLegX} y2="326" stroke={skinColor} strokeWidth="16" strokeLinecap="round" />
        <line x1={rightLegX} y1="205" x2={rightLegX} y2="326" stroke={skinColor} strokeWidth="16" strokeLinecap="round" />
        <path
          d={`M ${shoulderLeft + 4} 73 Q ${shoulderLeft - 10} 132, ${shoulderLeft - 3} 207`}
          fill="none"
          stroke={skinColor}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={`M ${shoulderRight - 4} 73 Q ${shoulderRight + 10} 132, ${shoulderRight + 3} 207`}
          fill="none"
          stroke={skinColor}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={`M ${shoulderLeft} 70
              Q ${chestLeft} 95, ${chestLeft} 126
              L ${waistLeft} 174
              Q ${hipLeft} 190, ${hipLeft + 2} 210
              L ${hipRight - 2} 210
              Q ${hipRight} 190, ${waistRight} 174
              L ${chestRight} 126
              Q ${chestRight} 95, ${shoulderRight} 70 Z`}
        />
        <rect x={CENTER_X - neckWidth / 2} y="50" width={neckWidth} height="20" rx="5" />
        <circle cx={CENTER_X} cy="35" r="18" />
      </g>

      {/* A small chest ease allowance keeps the body under the shirt overlay. */}
      <path
        d={`M ${shoulderLeft + 4} 72
            L ${shoulderLeft - 8} 87
            L ${shoulderLeft - 2} 113
            L ${chestLeft - 3} 108
            L ${waistLeft} 174
            Q ${CENTER_X} 180, ${waistRight} 174
            L ${chestRight + 3} 108
            L ${shoulderRight + 2} 113
            L ${shoulderRight + 8} 87
            L ${shoulderRight - 4} 72
            Q ${CENTER_X + 12} 65, ${CENTER_X} 78
            Q ${CENTER_X - 12} 65, ${shoulderLeft + 4} 72 Z`}
        fill={garmentFill}
        fillOpacity="0.9"
        stroke={garmentStroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d={`M ${CENTER_X - 12} 68 Q ${CENTER_X} 84, ${CENTER_X + 12} 68`} fill="none" stroke="#c4b5fd" strokeWidth="2" />

      {/* A closed waist/crotch layer prevents the body from showing through. */}
      <path
        d={`M ${trouserLeft} 170
            L ${trouserRight} 170
            L ${trouserRight - 2} 216
            Q ${CENTER_X} 225, ${trouserLeft + 2} 216 Z`}
        fill="#3f36b3"
        stroke="#312e81"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Full-length trouser legs meet at the seam, then separate naturally. */}
      <path
        d={`M ${trouserLeft} 171 L ${CENTER_X} 171 L ${CENTER_X - 2} 220 L ${leftLegX + 8} 326 L ${leftLegX - 10} 326 L ${trouserLeft + 2} 216 Z`}
        fill="#3730a3"
        stroke="#312e81"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d={`M ${CENTER_X} 171 L ${trouserRight} 171 L ${trouserRight - 2} 216 L ${rightLegX + 10} 326 L ${rightLegX - 8} 326 L ${CENTER_X + 2} 220 Z`}
        fill="#4338ca"
        stroke="#312e81"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d={`M ${trouserLeft} 172 Q ${CENTER_X} 178, ${trouserRight} 172`} fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.9" />
      <ellipse cx={leftLegX} cy="332" rx="10" ry="5" fill="#1e1b4b" />
      <ellipse cx={rightLegX} cy="332" rx="10" ry="5" fill="#1e1b4b" />
    </g>
  );
}

/** Measurement-driven SVG preview. It is an illustrative fit guide, not a generated 3D body scan. */
export default function Avatar({ body, garmentSize, fitScore }: AvatarProps) {
  // The existing Unisex selection intentionally uses the male/unisex figure;
  // Female always renders its own illustration and fitted dress.
  const isFemale = body.gender === "Female";
  const height = withFallback(body.height, 170);
  const shoulder = withFallback(body.shoulder, 42);
  const chest = withFallback(body.chest, 92);
  const waist = withFallback(body.waist, 76);
  const hips = withFallback(body.hips, 98);
  const figureScale = clamp(height / 170, 0.9, 1.06);

  const shoulderWidth = clamp(shoulder * (isFemale ? 1.35 : 1.58), isFemale ? 54 : 68, isFemale ? 82 : 98);
  const chestWidth = clamp(chest * (isFemale ? 0.54 : 0.58), isFemale ? 50 : 60, isFemale ? 78 : 90);
  const waistWidth = clamp(waist * (isFemale ? 0.58 : 0.68), isFemale ? 38 : 50, isFemale ? 64 : 76);
  const hipsWidth = clamp(hips * (isFemale ? 0.76 : 0.62), isFemale ? 64 : 56, isFemale ? 102 : 82);
  const neckWidth = clamp(shoulderWidth * (isFemale ? 0.18 : 0.22), 11, isFemale ? 15 : 19);

  const garmentPalette =
    fitScore === undefined || fitScore === null
      ? { fill: "#7c3aed", stroke: "#5b21b6" }
      : fitScore >= 85
        ? { fill: "#10b981", stroke: "#047857" }
        : fitScore >= 65
          ? { fill: "#f59e0b", stroke: "#b45309" }
          : { fill: "#f43f5e", stroke: "#be123c" };

  const illustrationProps: IllustrationProps = {
    chestWidth,
    garmentFill: garmentPalette.fill,
    garmentStroke: garmentPalette.stroke,
    hipsWidth,
    neckWidth,
    shoulderWidth,
    skinColor: body.skinColor,
    waistWidth,
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <svg
        width="240"
        height="370"
        viewBox="0 0 220 360"
        className="block h-auto w-full max-w-[240px] overflow-visible transition-all duration-300"
        role="img"
        aria-label={`${body.gender} measurement-based SVG digital twin preview`}
      >
        <title>{`${body.gender} measurement-based digital twin`}</title>
        <g transform={`translate(${CENTER_X} 330) scale(${figureScale}) translate(${-CENTER_X} -330)`}>
          {isFemale ? <FemaleIllustration {...illustrationProps} /> : <MaleIllustration {...illustrationProps} />}
        </g>
      </svg>
    </div>
  );
}
