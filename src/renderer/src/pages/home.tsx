import { ProductFooter } from '@/components/product-footer'
import { APP_NAME, APP_URL } from '@/lib/product'

/** Signed-in home: welcome copy with product credit. */
export function HomePage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background font-sans text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <h1 className="text-center text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Welcome to our app
        </h1>
        <a
          href={APP_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 text-center text-base text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-lg"
        >
          courtesy of {APP_NAME}
        </a>
      </div>
      <div className="flex justify-center pb-6">
        <ProductFooter />
      </div>
    </div>
  )
}
