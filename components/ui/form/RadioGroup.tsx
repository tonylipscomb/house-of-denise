"use client";

import { cn } from "@/lib/cn";

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

type RadioGroupProps = {
  name: string;
  legend: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function RadioGroup({ name, legend, options, value, onChange, className }: RadioGroupProps) {
  return (
    <fieldset className={cn("radio-group", className)}>
      <legend className="field-label">{legend}</legend>
      <div className="radio-group__options">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label key={option.value} htmlFor={id} className="radio-field">
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange?.(option.value)}
                className="radio-field__input"
              />
              <span className="radio-field__content">
                <span className="radio-field__label">{option.label}</span>
                {option.description ? (
                  <span className="radio-field__description">{option.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
