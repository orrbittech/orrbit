import { Calculator, Folder, Globe, Mail, Wallet, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEFT_ITEMS = [
  { id: 'left-folder', Icon: Folder, className: 'left-[2%] top-[12%] size-16 -rotate-12' },
  { id: 'left-wallet', Icon: Wallet, className: 'left-[6%] top-[38%] size-14 rotate-6' },
  { id: 'left-mail', Icon: Mail, className: 'left-[1%] top-[62%] size-12 -rotate-6' },
  { id: 'left-calculator', Icon: Calculator, className: 'left-[8%] bottom-[10%] size-14 rotate-12' }
] as const

const RIGHT_ITEMS = [
  { id: 'right-globe', Icon: Globe, className: 'right-[3%] top-[14%] size-14 rotate-12' },
  { id: 'right-card', Icon: CreditCard, className: 'right-[7%] top-[40%] size-16 -rotate-6' },
  { id: 'right-folder', Icon: Folder, className: 'right-[1%] top-[64%] size-12 rotate-6' },
  { id: 'right-wallet', Icon: Wallet, className: 'right-[8%] bottom-[12%] size-14 -rotate-12' }
] as const

/**
 * Grayscale floating icons that frame the landing content, cropped by the viewport edges.
 */
export function LandingDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
      {[...LEFT_ITEMS, ...RIGHT_ITEMS].map(({ id, Icon, className }) => (
        <div
          key={id}
          className={cn(
            'absolute flex items-center justify-center rounded-2xl border border-black/10 bg-white text-neutral-400 shadow-sm',
            className
          )}
        >
          <Icon className="size-[55%] stroke-[1.5]" />
        </div>
      ))}
    </div>
  )
}
