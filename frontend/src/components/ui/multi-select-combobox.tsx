import { Check, X } from 'lucide-react'
import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface MultiSelectComboboxProps {
  allTags: Array<string>
  selectedTags: Array<string>
  onTagsChange: (tags: Array<string>) => void
  placeholder?: string
}

export function MultiSelectCombobox({
  allTags,
  selectedTags,
  onTagsChange,
  placeholder = 'Select or create tags...',
}: MultiSelectComboboxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  // Effect to handle closing the suggestion list when clicking outside
  const commandRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag])
    }
    setInputValue('')
    inputRef.current?.focus()
  }

  const handleDeselect = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault()
      const newTag = inputValue.trim()
      handleSelect(newTag)
    }
    if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      e.preventDefault()
      handleDeselect(selectedTags[selectedTags.length - 1])
    }
  }

  const availableOptions = allTags.filter((tag) => !selectedTags.includes(tag))

  return (
    <Command
      ref={commandRef}
      className="relative overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-2 py-1 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => handleDeselect(tag)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder={selectedTags.length > 0 ? '' : placeholder}
            className="ml-1 h-7 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            style={{ minWidth: '120px' }}
          />
        </div>
      </div>

      <div className="relative mt-2">
        {open && availableOptions.length > 0 ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandGroup>
                {availableOptions.map((tag) => (
                  <CommandItem key={tag} onSelect={() => handleSelect(tag)}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedTags.includes(tag)
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>

      {/* Separate logic for showing "create new" prompt */}
      {open && inputValue.trim().length > 0 && availableOptions.length === 0 ? (
        <div className="absolute top-full z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <CommandList>
            <CommandEmpty>
              Press Enter to create "{inputValue.trim()}"
            </CommandEmpty>
          </CommandList>
        </div>
      ) : null}
    </Command>
  )
}
