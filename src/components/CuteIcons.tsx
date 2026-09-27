import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// Cute chubby white pigeon
export const PigeonIcon: React.FC<IconProps> = ({ className = '', size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M5 14.5C5 18 8 20.5 12.5 20.5C16.5 20.5 19.5 18 19.5 14C19.5 11 18 8.5 16 6.5C15 5.5 14 3.5 12 3C10.5 2.6 8.5 3.5 8 5C7.2 7 7.5 9 6.5 10.5C5.5 11.8 5 13.2 5 14.5Z"
      fill="#F8FAFC"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M5 15L2 14C1.5 13.8 1.8 12.5 2.5 12.2L6 11.5"
      fill="#E2E8F0"
      stroke="#27272A"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 12C9.5 10.5 12 10.5 13.5 12C15 13.5 14.5 16.5 12.5 17C10.5 17.5 8 16 8.5 12Z"
      fill="#E2E8F0"
      stroke="#27272A"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="5.8" r="1.2" fill="#27272A" />
    <circle cx="9.7" cy="5.5" r="0.4" fill="#FFFFFF" />
    <path
      d="M7.8 6.5L5.2 6.8C4.9 6.8 4.8 7.3 5.1 7.5L7.5 8.2"
      fill="#FB923C"
      stroke="#27272A"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M11 20.5V22.5M14 20.5V22.5" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Cute puffy yellow star
export const StarIcon: React.FC<IconProps> = ({ className = '', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12 2.5L14.8 8.2C15 8.6 15.4 8.9 15.9 9L21.8 9.8C22.6 9.9 22.9 10.9 22.3 11.5L18 15.6C17.7 15.9 17.5 16.4 17.6 16.9L18.6 22.8C18.7 23.6 17.9 24.2 17.2 23.8L12.4 20.7C12 20.4 11.5 20.4 11.1 20.7L6.3 23.8C5.6 24.2 4.8 23.6 4.9 22.8L5.9 16.9C6 16.4 5.8 15.9 5.5 15.6L1.2 11.5C0.6 10.9 0.9 9.9 1.7 9.8L7.6 9C8.1 8.9 8.5 8.6 8.7 8.2L11.5 2.5C11.6 2.2 11.8 2.2 12 2.5Z"
      fill="#FEF08A"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse cx="10" cy="8" rx="1.2" ry="1.8" transform="rotate(-20 10 8)" fill="#FFFFFF" />
  </svg>
);

// Cute puffy lime/cyan diamond
export const DiamondIcon: React.FC<IconProps> = ({ className = '', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12 2.5L20.5 12L12 21.5L3.5 12L12 2.5Z"
      fill="#A7F3D0"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse cx="10" cy="8" rx="1" ry="1.6" transform="rotate(-25 10 8)" fill="#FFFFFF" />
  </svg>
);

// Cute seeds / feeding bread icon
export const SeedsIcon: React.FC<IconProps> = ({ className = '', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M4.5 11C4.5 7.5 7.5 5 12 5C16.5 5 19.5 7.5 19.5 11C19.5 15.5 17.5 18 12 18C6.5 18 4.5 15.5 4.5 11Z"
      fill="#FEF08A"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M8.5 8.5C9 10 9 12 8.5 13.5M12 8C12.5 9.5 12.5 12 12 13.5M15.5 8.5C16 10 16 12 15.5 13.5" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="8" cy="20.5" r="1.1" fill="#F97316" stroke="#27272A" strokeWidth="1" />
    <circle cx="12" cy="21.5" r="1.3" fill="#F97316" stroke="#27272A" strokeWidth="1" />
    <circle cx="16" cy="20" r="1" fill="#F97316" stroke="#27272A" strokeWidth="1" />
  </svg>
);

// Dawn: Rising sun over horizon
export const DawnIcon: React.FC<IconProps> = ({ className = '', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M6 14C6 10.6863 8.68629 8 12 8C15.3137 8 18 10.6863 18 14H6Z"
      fill="#FED7AA"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M12 4V6M5.5 7L7 8.5M18.5 7L17 8.5" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 14H21M5 18H19" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Noon: Bright sun
export const NoonIcon: React.FC<IconProps> = ({ className = '', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="5" fill="#FEF08A" stroke="#27272A" strokeWidth="2" />
    <path
      d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5M5.3 5.3L7 7M17 17L18.7 18.7M5.3 18.7L7 17M17 7L18.7 5.3"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="10" cy="10" r="1" fill="#FFFFFF" />
  </svg>
);

// Sunset: Sinking orange sun with dusk lines
export const SunsetIcon: React.FC<IconProps> = ({ className = '', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M6 14C6 10.6863 8.68629 8 12 8C15.3137 8 18 10.6863 18 14H6Z"
      fill="#FB923C"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M12 3V5M6 6L7.5 7.5M18 6L16.5 7.5" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 14H21M5 17H19M7 20H17" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Twilight: Crescent moon with twinkling star
export const TwilightIcon: React.FC<IconProps> = ({ className = '', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M13.5 3C9 3.5 5.5 7 5.5 12C5.5 17 9.5 21 15 21C17.5 21 19.5 19.8 20.8 18.2C14.8 18 10.5 14 11 8C11.3 5.8 12.2 4.2 13.5 3Z"
      fill="#BAE6FD"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M19 4L19.8 6.2L22 7L19.8 7.8L19 10L18.2 7.8L16 7L18.2 6.2L19 4Z"
      fill="#FEF08A"
      stroke="#27272A"
      strokeWidth="1.2"
    />
  </svg>
);

// Scatter: Retro diamond sparkles
export const ScatterIcon: React.FC<IconProps> = ({ className = '', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M11 2L12.5 8.5L19 10L12.5 11.5L11 18L9.5 11.5L3 10L9.5 8.5L11 2Z"
      fill="#FED7AA"
      stroke="#27272A"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 15L19.2 17.5L22 18.2L19.2 19L18.5 21.5L17.8 19L15 18.2L17.8 17.5L18.5 15Z"
      fill="#FEF08A"
      stroke="#27272A"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <circle cx="5" cy="5" r="1.5" fill="#7DD3FC" stroke="#27272A" strokeWidth="1" />
  </svg>
);

// Follow Birdie: Retro camera with focus
export const FollowBirdieIcon: React.FC<IconProps> = ({ className = '', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect x="3" y="6" width="18" height="15" rx="3.5" fill="#E0F2FE" stroke="#27272A" strokeWidth="2" />
    <path d="M7 6V4C7 3.5 7.5 3 8 3H11C11.5 3 12 3.5 12 4V6" fill="#38BDF8" stroke="#27272A" strokeWidth="1.8" />
    <circle cx="17.5" cy="9" r="1.2" fill="#FB923C" stroke="#27272A" strokeWidth="1" />
    <circle cx="12" cy="13.5" r="3.5" fill="#FACC15" stroke="#27272A" strokeWidth="1.8" />
    <circle cx="12" cy="13.5" r="1.5" fill="#27272A" />
  </svg>
);

// Reset Camera View: Retro circular arrow
export const ResetViewIcon: React.FC<IconProps> = ({ className = '', size = 15, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C14.5 4 16.7 5.2 18.2 7"
      stroke="#27272A"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M14.5 7.5H19V3"
      stroke="#27272A"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2" fill="#BEF264" stroke="#27272A" strokeWidth="1.5" />
  </svg>
);

// Audio Volume On
export const VolumeIcon: React.FC<IconProps> = ({ className = '', size = 15, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M10 6L6 9.5H3C2.5 9.5 2 10 2 10.5V13.5C2 14 2.5 14.5 3 14.5H6L10 18C10.6 18.5 11.5 18 11.5 17.2V6.8C11.5 6 10.6 5.5 10 6Z"
      fill="#BAE6FD"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M15 9C16 10 16.5 11 16.5 12C16.5 13 16 14 15 15" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 6.5C20 8.5 21 10.2 21 12C21 13.8 20 15.5 18 17.5" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Audio Volume Muted
export const VolumeMutedIcon: React.FC<IconProps> = ({ className = '', size = 15, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M10 6L6 9.5H3C2.5 9.5 2 10 2 10.5V13.5C2 14 2.5 14.5 3 14.5H6L10 18C10.6 18.5 11.5 18 11.5 17.2V6.8C11.5 6 10.6 5.5 10 6Z"
      fill="#E2E8F0"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M16 9.5L21 14.5M21 9.5L16 14.5" stroke="#F43F5E" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// Guide / Handbook: Retro open book
export const GuideBookIcon: React.FC<IconProps> = ({ className = '', size = 15, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M4 19.5C6.5 18.5 9.5 18.5 12 20V5.5C9.5 4 6.5 4 4 5V19.5Z"
      fill="#FED7AA"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M20 19.5C17.5 18.5 14.5 18.5 12 20V5.5C14.5 4 17.5 4 20 5V19.5Z"
      fill="#FFFBEB"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M12 5.5V12L10.5 10.5L9 12V5" fill="#38BDF8" stroke="#27272A" strokeWidth="1.2" />
  </svg>
);

// Retro Window Close Button
export const WindowCloseIcon: React.FC<IconProps> = ({ className = '', size = 12, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// --- SCENERY ICONS ---

// 1. Forest Scenery: Cute Pine & Oak Trees
export const ForestIcon: React.FC<IconProps> = ({ className = '', size = 20, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Left Pine */}
    <path
      d="M9 2.5L3.5 11.5H6.5L2.5 17.5H15.5L11.5 11.5H14.5L9 2.5Z"
      fill="#86EFAC"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <rect x="7.5" y="17.5" width="3" height="4.5" rx="0.5" fill="#78350F" stroke="#27272A" strokeWidth="1.6" />
    {/* Right rounded deciduous tree */}
    <path
      d="M17 8C19.2 8 21 9.8 21 12C21 14.2 19.5 15.8 17 15.8C15 15.8 13.5 14.2 13.5 12C13.5 9.8 14.8 8 17 8Z"
      fill="#BEF264"
      stroke="#27272A"
      strokeWidth="2"
    />
    <rect x="15.5" y="15.8" width="3" height="6.2" rx="0.5" fill="#78350F" stroke="#27272A" strokeWidth="1.6" />
  </svg>
);

// 2. Beach Scenery: Palm Tree & Island Waves
export const BeachIcon: React.FC<IconProps> = ({ className = '', size = 20, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Sun */}
    <circle cx="6" cy="6" r="3.2" fill="#FDE047" stroke="#27272A" strokeWidth="1.8" />
    {/* Sand mound */}
    <path
      d="M1.5 19.5C5.5 17 12 17 22.5 19.5V22.5H1.5V19.5Z"
      fill="#FDE68A"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Palm Trunk */}
    <path
      d="M13.5 18C14.2 13.5 15.2 10.5 18 8.5"
      stroke="#92400E"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Palm Fronds */}
    <path
      d="M18 8.5C14.5 7 11.5 7.5 10 9.5M18 8.5C20.5 6.5 23 7 23.5 8.5M18 8.5C19.8 10.8 21.8 12.2 23 13.5M18 8.5C16 10.5 14.5 12.5 14.5 14.5"
      stroke="#22C55E"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

// 3. Ancient Rome & Fountain Scenery: Classical ancient Roman temple pediment, fluted columns & grand stone fountain
export const AncientRomeIcon: React.FC<IconProps> = ({ className = '', size = 20, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Classical Roman Temple Pediment */}
    <path
      d="M12 2L2.5 6.8V8.5H21.5V6.8L12 2Z"
      fill="#FED7AA"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="5.2" r="1.1" fill="#F59E0B" />
    {/* Roman Classical Columns */}
    <line x1="5.2" y1="8.5" x2="5.2" y2="15" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
    <line x1="9.6" y1="8.5" x2="9.6" y2="15" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
    <line x1="14.4" y1="8.5" x2="14.4" y2="15" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.8" y1="8.5" x2="18.8" y2="15" stroke="#27272A" strokeWidth="2" strokeLinecap="round" />
    {/* Grand Ancient Roman Fountain Basin in Foreground */}
    <path
      d="M3.5 16.5C3.5 19.8 7 21.5 12 21.5C17 21.5 20.5 19.8 20.5 16.5H3.5Z"
      fill="#38BDF8"
      stroke="#27272A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Fountain Center Pillar & Water Spurt */}
    <rect x="10.8" y="13.5" width="2.4" height="4" fill="#FED7AA" stroke="#27272A" strokeWidth="1.5" />
    <ellipse cx="12" cy="13.5" rx="3.2" ry="1.2" fill="#BAE6FD" stroke="#27272A" strokeWidth="1.6" />
    {/* Water Plumes Jet */}
    <path
      d="M12 13.5V9.5M12 11C10.5 11 9.2 12.2 9.2 13.5M12 11C13.5 11 14.8 12.2 14.8 13.5"
      stroke="#0284C7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const RomeFountainIcon = AncientRomeIcon;
export const AncientRomeFountainIcon = AncientRomeIcon;
export const FountainIcon = AncientRomeIcon;

// Chevron Down
export const ChevronDownIcon: React.FC<IconProps> = ({ className = '', size = 14, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M6 9L12 15L18 9" stroke="#27272A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Chevron Up
export const ChevronUpIcon: React.FC<IconProps> = ({ className = '', size = 14, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M18 15L12 9L6 15" stroke="#27272A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Minus
export const MinusIcon: React.FC<IconProps> = ({ className = '', size = 12, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M5 12H19" stroke="#27272A" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Plus
export const PlusIcon: React.FC<IconProps> = ({ className = '', size = 12, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M12 5V19M5 12H19" stroke="#27272A" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
