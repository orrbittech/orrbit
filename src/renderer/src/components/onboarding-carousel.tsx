import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LandingDecor } from '@/components/landing-decor'
import { ProductFooter } from '@/components/product-footer'
import { Button } from '@/components/ui/button'
import { ONBOARDING_SLIDES } from '@/lib/onboarding'
import { cn } from '@/lib/utils'

const SIGN_IN_PATH = '/sign-in'

/**
 * Clamps a slide index to the onboarding deck.
 * @param index Requested slide.
 */
function clampSlide(index: number): number {
  return Math.max(0, Math.min(ONBOARDING_SLIDES.length - 1, index))
}

/**
 * True when a keyboard event came from a text field.
 * @param target Event target.
 */
function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
}

/** Four-slide marketing carousel. Skip and the last action go to sign-in. */
export function OnboardingCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const isLast = index === ONBOARDING_SLIDES.length - 1

  const scrollToSlide = useCallback((nextIndex: number) => {
    const scroller = scrollerRef.current
    const clamped = clampSlide(nextIndex)
    if (!scroller) {
      setIndex(clamped)
      return
    }
    scroller.scrollTo({ left: scroller.clientWidth * clamped, behavior: 'smooth' })
    setIndex(clamped)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.altKey || event.ctrlKey || isTypingTarget(event.target)) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollToSlide(index + 1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollToSlide(index - 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [index, scrollToSlide])

  useEffect(() => {
    function onResize() {
      const scroller = scrollerRef.current
      if (!scroller) return
      scroller.scrollTo({ left: scroller.clientWidth * index, behavior: 'auto' })
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [index])

  /**
   * Keeps the active dot aligned with the snapped slide while the user scrolls.
   */
  function handleScroll() {
    const scroller = scrollerRef.current
    if (!scroller || scroller.clientWidth === 0) return
    setIndex(clampSlide(Math.round(scroller.scrollLeft / scroller.clientWidth)))
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-background bg-[radial-gradient(ellipse_at_center,_#ffffff_0%,_#f4f4f5_72%)] font-sans text-foreground dark:bg-[radial-gradient(ellipse_at_center,_#171717_0%,_#0a0a0a_72%)]">
      <LandingDecor />

      <Link
        to={SIGN_IN_PATH}
        className="absolute right-5 top-5 z-20 inline-flex items-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Skip
      </Link>

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 py-20">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex w-full max-w-lg snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label="Onboarding"
        >
          {ONBOARDING_SLIDES.map((slide, slideIndex) => (
            <section
              key={slideIndex}
              className="w-full shrink-0 snap-center px-2 text-center"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${ONBOARDING_SLIDES.length}`}
            >
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                {slide.title}
              </h1>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                {slide.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2" role="tablist" aria-label="Slides">
          {ONBOARDING_SLIDES.map((slide, slideIndex) => (
            <button
              key={slideIndex}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={slide.title}
              onClick={() => scrollToSlide(slideIndex)}
              className={cn(
                'size-2 rounded-full transition-colors',
                slideIndex === index ? 'bg-foreground' : 'bg-muted-foreground/40 hover:bg-muted-foreground/70'
              )}
            />
          ))}
        </div>

        <div className="mt-8 flex w-full max-w-sm gap-3">
          <Button
            type="button"
            size="lg"
            variant="secondary"
            disabled={index === 0}
            onClick={() => scrollToSlide(index - 1)}
            className="h-12 flex-1 rounded-full text-base font-medium"
          >
            Back
          </Button>
          {isLast ? (
            <Button
              asChild
              size="lg"
              className="h-12 flex-1 rounded-full bg-foreground text-base font-medium text-background hover:bg-foreground/90"
            >
              <Link to={SIGN_IN_PATH}>Get started</Link>
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={() => scrollToSlide(index + 1)}
              className="h-12 flex-1 rounded-full bg-foreground text-base font-medium text-background hover:bg-foreground/90"
            >
              Next
            </Button>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center">
        <ProductFooter />
      </div>
    </div>
  )
}
