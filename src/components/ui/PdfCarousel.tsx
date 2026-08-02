'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseAspectRatio } from '../../lib/utils';

interface PdfCarouselProps {
  images: string[];
  title?: string;
  aspectRatio?: string;
}

export function PdfCarousel({ images, title, aspectRatio }: PdfCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (!images || images.length === 0) return null;

  const resolvedAspect = parseAspectRatio(aspectRatio);

  return (
    <div className="w-full h-full flex flex-col justify-between items-center max-w-full max-h-full min-h-0">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          {title}
        </h2>
      )}
      
      <div className="relative group w-full flex-1 flex items-center justify-center overflow-hidden min-h-0">
        <div 
          className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 max-w-full max-h-full flex items-center justify-center" 
          ref={emblaRef}
          style={resolvedAspect ? { aspectRatio: resolvedAspect, maxHeight: '100%', maxWidth: '100%' } : { maxHeight: '100%', maxWidth: '100%' }}
        >
          <div className="flex touch-pan-y h-full w-full items-center">
            {images.map((src, index) => (
              <div
                key={index}
                className="relative flex-[0_0_100%] min-w-0 h-full w-full flex items-center justify-center p-1"
              >
                <img
                  src={src}
                  alt={`${title || 'Design'} page ${index + 1}`}
                  className="max-w-full max-h-full object-contain rounded-xl bg-gray-50 dark:bg-gray-900"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-black z-20 cursor-pointer shadow-lg"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-black z-20 cursor-pointer shadow-lg"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-2 shrink-0">
        {images.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              index === selectedIndex
                ? 'w-6 h-2 bg-accent'
                : 'w-2 h-2 bg-white/30 hover:bg-white/60'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
