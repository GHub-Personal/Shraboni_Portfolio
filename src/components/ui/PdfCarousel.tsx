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
    <div className="w-full h-full flex flex-col justify-center items-center max-w-full max-h-full">
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          {title}
        </h2>
      )}
      
      <div className="relative group w-full h-full flex items-center justify-center overflow-hidden">
        <div 
          className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 max-w-full" 
          ref={emblaRef}
          style={{ aspectRatio: resolvedAspect, maxHeight: '100%' }}
        >
          <div className="flex touch-pan-y h-full w-full">
            {images.map((src, index) => (
              <div
                key={index}
                className="relative flex-[0_0_100%] min-w-0 h-full w-full"
              >
                <img
                  src={src}
                  alt={`${title || 'Design'} page ${index + 1}`}
                  className="w-full h-full object-contain bg-gray-50 dark:bg-gray-900"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg text-gray-800 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-white dark:hover:bg-black z-20"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg text-gray-800 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-white dark:hover:bg-black z-20"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-3 mt-6">
        {images.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex
                ? 'w-8 h-2.5 bg-blue-600 dark:bg-blue-400'
                : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
