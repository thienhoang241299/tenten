import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import VerticalSpinVisual from "./VerticalSpinVisual";

const DEFAULT_ITEMS = [
  "Ngửi chân 30s",
  "thụt xì dầu loăng quăng 15 cái",
  "hát bằng tiếng động vật",
  "nhảy bài 2p hơn",
  "búng mỏ 30 cái",
  "làm theo yêu cầu (yc chấp nhận được)",
  "điện giật 30s",
  "uống 1 ly nước",
  "im lặng 1p",
  "làm mặt xấu ngồi cười 1 phút",
];

const ITEM_HEIGHT_PX = 80;
const SPIN_DURATION_MS = 5000;
const FULL_ROLLS = 5;

const SpinWheelControlled = forwardRef(function SpinWheelControlled(
  {
    items = DEFAULT_ITEMS,
    onSpinStart = () => {},
    onSpinEnd = () => {},
    itemHeight = ITEM_HEIGHT_PX,
  },
  ref
) {
  const [spinning, setSpinning] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [resultIndex, setResultIndex] = useState(0);
  const [result, setResult] = useState(null);

  const extendedItems = useMemo(() => Array(7).fill(items).flat(), [items]);

  useImperativeHandle(
    ref,
    () => ({
      // spin(): optional param targetIndex (if you want deterministic result from backend)
      spin: (targetIndex = null) => {
        if (spinning) return;

        const chosenIndex =
          typeof targetIndex === "number" &&
          targetIndex >= 0 &&
          targetIndex < items.length
            ? targetIndex
            : Math.floor(Math.random() * items.length);

        const selectedItem = items[chosenIndex];
        setResultIndex(chosenIndex);

        const totalItems = items.length;
        const targetOffset = FULL_ROLLS * totalItems * itemHeight;
        const resultOffset = chosenIndex * itemHeight;
        const targetTranslateY = targetOffset + resultOffset;

        setSpinning(true);
        setResult(null);
        // trigger transform on next frame
        requestAnimationFrame(() => {
          setTranslateY(-targetTranslateY);
        });

        onSpinStart();

        setTimeout(() => {
          setSpinning(false);
          setResult(selectedItem);
          setTranslateY(-resultOffset); // normalize to avoid huge translate
          onSpinEnd({ key: selectedItem, index: chosenIndex });
        }, SPIN_DURATION_MS);
      },
    }),
    [items, itemHeight, onSpinStart, onSpinEnd, spinning]
  );

  return (
    <div className="flex flex-col items-center p-4 bg-transparent">
      <VerticalSpinVisual
        items={items}
        extendedItems={extendedItems}
        translateY={translateY}
        itemHeight={itemHeight}
        resultIndex={resultIndex}
        spinning={spinning}
      />
      {/* Optional: display result inside controlled component */}
      {/* {result && (
        <div className="mt-4 p-3 bg-lime-100 border-l-4 border-lime-600 text-lime-800 font-bold text-lg rounded shadow-sm">
          🎉 {result}
        </div>
      )} */}
    </div>
  );
});

export default SpinWheelControlled;
export { ITEM_HEIGHT_PX, SPIN_DURATION_MS };
