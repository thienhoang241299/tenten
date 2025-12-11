import React from "react";

export default function VerticalSpinVisual({
  items = [],
  extendedItems = [],
  translateY = 0,
  itemHeight = 80,
  resultIndex = 0,
  spinning = false,
}) {
  const wheelStyle = {
    transform: `translateY(${translateY}px)`,
    transition: spinning
      ? `transform 5000ms cubic-bezier(0.0,0.0,0.2,1)`
      : "none",
  };

  return (
    <div className="relative w-80 h-60 border-4 border-gray-400 rounded-lg overflow-hidden shadow-lg bg-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        className="text-red-600 size-10 absolute top-12 left-[-20px] right-0 transform -translate-y-1/2 z-10  pointer-events-none font-extrabold text-sm"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M20.05 17.65a3 3 0 0 0 1.2-2.4v-11a3 3 0 0 0-3-3h-12a3 3 0 0 0-3 3v11a3 3 0 0 0 1.2 2.4l6 4.5a3 3 0 0 0 3.6 0z"
          clipRule="evenodd"
          transform="rotate(270 12 12)"
        />
      </svg>
      <div className="wheel" style={wheelStyle}>
        {extendedItems.map((item, index) => {
          const key = `${Math.floor(index / items.length)}_${
            index % items.length
          }`;
          const isResult = index % items.length === resultIndex && !spinning;
          return (
            <div
              key={key}
              style={{ height: `${itemHeight}px` }}
              className={`flex items-center justify-center text-center text-lg font-semibold text-white 
                bg-gray-600 mb-1 rounded-md shadow-md p-2 uppercase transition-colors duration-150
                ${
                  isResult
                    ? "bg-yellow-500 text-gray-900 shadow-xl scale-105"
                    : ""
                }`}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
