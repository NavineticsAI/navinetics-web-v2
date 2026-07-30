import { Moon, Sun } from 'lucide-react';
import { cn } from '../lib/cn.js';
import { useTheme } from '../lib/theme.jsx';

/** Two real buttons with aria-pressed, not a styled div. */
export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme();
  const options = [
    { id: 'light', Icon: Sun, label: 'Light theme' },
    { id: 'dark', Icon: Moon, label: 'Dark theme' },
  ];

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={cn('nn-glass inline-flex gap-0.5 rounded-full p-0.5 [--gb:18px]', className)}
    >
      {options.map(({ id, Icon, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={theme === id}
          aria-label={label}
          onClick={() => setTheme(id)}
          className={cn(
            'grid h-7 w-8 cursor-pointer place-items-center rounded-full',
            'transition-[background-color,color] duration-200 ease-out',
            theme === id ? 'bg-action text-on-action' : 'text-ink-3 hover:text-ink',
          )}
        >
          <Icon size={14} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
