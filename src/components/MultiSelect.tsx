'use client';

import * as React from 'react';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface OptionType {
  label: string;
  value: string;
  description?: string;
}

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  loading?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  label,
  loading = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const triggerWrapperRef = React.useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (open && triggerWrapperRef.current) {
      setTriggerWidth(triggerWrapperRef.current.offsetWidth);
    }
  }, [open]);

  const handleUnselect = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedOptions = options.filter((option) => selected.includes(option.value));

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <label className="text-sm font-medium text-card-foreground">{label}</label>}
      <div ref={triggerWrapperRef} className="w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto min-h-9 px-3 py-2"
            >
            <div className="flex flex-wrap gap-1 flex-1">
              {loading ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="mr-1 mb-1"
                    onClick={(e) => handleUnselect(option.value, e)}
                  >
                    {option.label}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUnselect(option.value, e as any);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => handleUnselect(option.value, e)}
                    >
                      <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-auto max-h-[280px] flex flex-col overflow-hidden"
          align="start"
          sideOffset={4}
          style={{ width: triggerWidth ? `${triggerWidth}px` : undefined }}
        >
          <div
            className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-2"
            style={{
              minHeight: 0,
            }}
            onWheel={(e) => {
              // Ensure wheel events are handled
              e.stopPropagation();
            }}
          >
            {loading ? (
              <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : options.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 rounded-sm hover:bg-accent cursor-pointer select-none"
                  onClick={() => handleToggle(option.value)}
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => handleToggle(option.value)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t p-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  onChange([]);
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {selected.length} item{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}

