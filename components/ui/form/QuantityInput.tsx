"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type QuantityInputProps = {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
};

export function QuantityInput({
  id,
  label,
  value,
  min = 1,
  max = 99,
  onChange,
  className
}: QuantityInputProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className={cn("quantity-input", className)}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <button type="button" className="quantity-input__btn" onClick={decrease} aria-label="Decrease quantity">
        <Minus size={16} />
      </button>
      <input
        id={id}
        type="number"
        className="quantity-input__value"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <button type="button" className="quantity-input__btn" onClick={increase} aria-label="Increase quantity">
        <Plus size={16} />
      </button>
    </div>
  );
}
