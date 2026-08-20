import React from 'react';

export const ZaloIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Blue Speech Bubble */}
      <path
        d="M24 4C12.9543 4 4 12.0589 4 22C4 25.86 5.21523 29.4357 7.30058 32.3831L5.05025 39.8832C4.77095 40.8142 5.68579 41.729 6.61679 41.4497L14.1169 39.1994C17.0643 41.2848 20.64 42.5 24.5 42.5C35.5457 42.5 44.5 34.4411 44.5 24.5C44.5 14.5589 35.5457 4 24 4Z"
        fill="#0068FF"
      />
      {/* White Speech Bubble Inner */}
      <path
        d="M24 7C14.6112 7 7 13.7157 7 22C7 25.26 8.03 28.27 9.8 30.74L8.1 36.41C7.88 37.14 8.56 37.82 9.29 37.6L14.96 35.9C17.43 37.67 20.44 38.7 23.7 38.7C33.0888 38.7 40.7 31.9843 40.7 23.7C40.7 15.4157 33.0888 7 24 7Z"
        fill="white"
      />
      {/* "Zalo" Text in Zalo Blue */}
      <text
        x="23.5"
        y="26.5"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#0068FF"
        fontSize="13.5"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="-0.5px"
      >
        Zalo
      </text>
    </svg>
  );
};
