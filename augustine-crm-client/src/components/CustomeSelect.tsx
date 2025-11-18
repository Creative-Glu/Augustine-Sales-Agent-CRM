import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface OptionType {
  label: string;
  value: string;
}

interface Props {
  optionsData: OptionType[];
  className?: string;
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
  value: string;
  loading?: boolean;
}

export function CustomeSelect({
  optionsData,
  className = '',
  label,
  placeholder,
  onChange,
  value,
  loading = false,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-card-foreground">{label}</label>

      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger className={`w-full cursor-pointer ${className}`}>
          {loading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>

        <SelectContent className="cursor-pointer">
          <SelectGroup className="cursor-pointer">
            {loading && (
              <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            )}

            {!loading &&
              optionsData?.map((item: OptionType, idx: number) => (
                <SelectItem className="cursor-pointer" key={idx} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
