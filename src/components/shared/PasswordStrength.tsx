'use client';

import { Check, X } from 'lucide-react';
import { PASSWORD_RULES, getPasswordStrength } from '@/lib/password';
import { cn } from '@/lib/utils';

export default function PasswordStrength({ password }: { password: string }) {
  const { passed, total } = getPasswordStrength(password);

  const barColor =
    passed <= 2 ? 'bg-red-500' : passed <= 4 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < passed ? barColor : 'bg-gray-200',
            )}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-0.5">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li
              key={rule.id}
              className={cn(
                'flex items-center gap-1.5 text-xs',
                met ? 'text-green-600' : 'text-gray-400',
              )}
            >
              {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
