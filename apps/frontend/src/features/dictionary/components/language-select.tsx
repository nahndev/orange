"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@orange/language";

interface LanguageSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function LanguageSelect({
  id,
  value,
  onValueChange,
  className,
}: LanguageSelectProps) {
  const selected = COUNTRIES.find(({ code }) => code === value);
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next ?? "")}>
      <SelectTrigger id={id}>
        <SelectValue className={className}>
          {selected?.name ?? "Select country"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
