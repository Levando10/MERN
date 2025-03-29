import React from 'react'

const Logo = ({ width = 170, height = 50 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Nền */}
      <rect width="200" height="100" fill="white" />

      {/* Biểu tượng */}
      <circle cx="40" cy="50" r="30" fill="red" />
      <rect x="70" y="35" width="20" height="30" fill="red" />
      <rect x="95" y="25" width="20" height="50" fill="red" />

      {/* Văn bản */}
      <text
        x="120"
        y="60"
        fontFamily="Arial, sans-serif"
        fontSize="30"
        fill="red"
        fontWeight="bold"
      >
        TechShop
      </text>
    </svg>
  );
};

export default Logo;

