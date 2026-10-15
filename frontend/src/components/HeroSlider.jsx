import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Zap, ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { fetchPublicSliders } from '../api/client';
import { useSiteSettings } from '../context/SiteSettingsContext';

const DEFAULT_SLIDES = [
  {
    id: 4,
    title: "PB08 TAXI — 24/7 Premium Cabs in Punjab",
    subtitle: "Reliable, Safe & Air-Conditioned Rides at Affordable Fixed Rates",
    image_url: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1080&q=70"
  },
  {
    id: 5,
    title: "Airport Pickups & Outstation Journeys",
    subtitle: "Direct transfers to Amritsar, Chandigarh & Delhi Airports with On-Time Guarantee",
    image_url: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1080&q=70"
  },
  {
    id: 6,
    title: "Verified Drivers & Sanitized Fleet",
    subtitle: "Instant WhatsApp Confirmation & Dedicated Customer Support",
    image_url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1080&q=70"
  }
];

const getInitialSlides = () => {
  try {
    const cached = localStorage.getItem('pb08_sliders_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_SLIDES;
};

const getResponsiveSrcSet = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) return undefined;
  const baseUrl = url.split('?')[0];
  return `${baseUrl}?auto=format&fit=crop&w=640&q=70 640w, ${baseUrl}?auto=format&fit=crop&w=1080&q=70 1080w, ${baseUrl}?auto=format&fit=crop&w=1600&q=75 1600w`;
};

export default function HeroSlider({ onOpenBooking }) {
  const { settings } = useSiteSettings();
  const [slides, setSlides] = useState(getInitialSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const phone = settings?.support_phone || '+91 98765 43210';
  const telLink = `tel:${phone.replace(/\s+/g, '')}`;

  useEffect(() => {
    fetchPublicSliders()
      .then((data) => {
        if (data && data.length > 0) {
          setSlides((prev) => {
            const prevStr = JSON.stringify(prev);
            const dataStr = JSON.stringify(data);
            if (prevStr === dataStr) return prev;
            try {
              localStorage.setItem('pb08_sliders_cache', dataStr);
            } catch (e) {}
            return data;
          });
        }
      })
      .catch((err) => {
        console.warn("Using fallback slides:", err);
      });
  }, []);

  const transitionEffect = settings?.slider_transition_effect || 'fade';
  const fadeDuration = Number(settings?.slider_fade_duration) || 1000;
  const autoplayInterval = Number(settings?.slider_autoplay_interval) || 5500;
  const overlayOpacity = settings?.slider_overlay_opacity !== undefined ? Number(settings.slider_overlay_opacity) : 55;
  const overlayColor = settings?.slider_overlay_color || '#000000';

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);

    return () => clearInterval(timerRef.current);
  }, [slides.length, isPaused, autoplayInterval]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0] || DEFAULT_SLIDES[0];

  return (
    <section 
      id="home"
      className="relative w-full h-[640px] sm:h-[700px] lg:h-[760px] overflow-hidden bg-black select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with customizable fade in / fade out */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        let transformClass = 'scale-100';
        if (transitionEffect === 'zoom-fade') {
          transformClass = isCurrent ? 'scale-100' : 'scale-110 pointer-events-none';
        } else if (transitionEffect === 'slide') {
          transformClass = isCurrent ? 'translate-x-0' : idx < currentIndex ? '-translate-x-full pointer-events-none' : 'translate-x-full pointer-events-none';
        } else {
          transformClass = isCurrent ? 'scale-100' : 'scale-100 pointer-events-none';
        }

        return (
          <div
            key={slide.id || idx}
            style={{ 
              transitionDuration: `${fadeDuration}ms`,
              transitionProperty: 'opacity, transform'
            }}
            className={`absolute inset-0 ease-in-out ${
              isCurrent ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            } ${transformClass}`}
          >
            <img
              src={slide.image_url}
              srcSet={getResponsiveSrcSet(slide.image_url)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1600px"
              alt={slide.title}
              width="1600"
              height="900"
              fetchpriority={idx === 0 ? "high" : "low"}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-full object-cover object-center filter brightness-95 text-transparent text-[0px]"
            />
            {/* Admin Customizable Color & Darkness Overlay Layer */}
            <div 
              className="absolute inset-0 transition-colors duration-500" 
              style={{
                backgroundColor: overlayColor,
                opacity: overlayOpacity / 100,
              }}
            />
            {/* Directional Vignettes with Chosen Overlay Color for Text Readability */}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{
                background: `linear-gradient(to top, ${overlayColor} 0%, rgba(0,0,0,0.4) 60%, transparent 100%)`,
                opacity: Math.min(1, (overlayOpacity / 100) * 0.85 + 0.15),
              }}
            />
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{
                background: `linear-gradient(to right, ${overlayColor} 0%, rgba(0,0,0,0.5) 45%, transparent 100%)`,
                opacity: Math.min(1, (overlayOpacity / 100) * 0.75 + 0.2),
              }}
            />
          </div>
        );
      })}

      {/* Taxi checkered yellow top & bottom stripe accents */}
      <div className="absolute top-0 left-0 right-0 h-2 taxi-checker opacity-90 z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-2 taxi-checker opacity-90 z-10" />

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6 pt-12">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-taxi-yellow/15 border border-taxi-yellow/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-taxi-yellow text-xs sm:text-sm font-bold tracking-wide">
            <Zap className="w-4 h-4 fill-taxi-yellow text-taxi-yellow" />
            <span>PUNJAB'S PREMIER 24/7 TAXI NETWORK.</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
            {currentSlide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-zinc-300 font-medium max-w-2xl leading-relaxed">
            {currentSlide.subtitle || "Fast dispatch, experienced verified drivers, and instant WhatsApp booking confirmation."}
          </p>

          {/* Key Quick Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm font-semibold text-zinc-300">
            <div className="flex items-center space-x-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-taxi-yellow" />
              <span>Verified Chauffeurs.</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-taxi-yellow" />
              <span>24/7 Available.</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-taxi-yellow" />
              <span>All India Permits.</span>
            </div>
          </div>

          {/* Prominent Action Call-to-action */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            
            {/* EXACT TEXT REQUIRED: "One Click Book Your Ride" */}
            <button
              onClick={onOpenBooking}
              className="group relative inline-flex items-center justify-center bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-black text-lg sm:text-xl px-8 py-4 sm:py-5 rounded-2xl shadow-xl shadow-taxi-yellow/30 hover:shadow-taxi-yellow/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 border-2 border-yellow-300 animate-glow-pulse"
            >
              <span className="flex items-center space-x-3">
                <span className="tracking-tight">One Click Book Your Ride</span>
                <ArrowRight className="w-6 h-6 stroke-[3] group-hover:translate-x-1.5 transition-transform" />
              </span>
            </button>

            <a
              href={telLink}
              className="inline-flex items-center justify-center bg-zinc-900/90 hover:bg-zinc-800 text-white font-bold text-base px-6 py-4 rounded-2xl border border-zinc-700 transition-colors"
            >
              Call 24/7: {phone}.
            </a>

          </div>

          <p className="text-xs text-zinc-400 font-medium">
            * Instant WhatsApp confirmation sent straight to your phone. No advance payment required.
          </p>

        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 hover:bg-taxi-yellow text-white hover:text-black border border-white/20 hover:border-taxi-yellow flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 hover:bg-taxi-yellow text-white hover:text-black border border-white/20 hover:border-taxi-yellow flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="p-2 flex items-center justify-center min-w-[36px] min-h-[36px] transition-all"
              >
                <span
                  className={`block transition-all duration-300 rounded-full ${
                    i === currentIndex
                      ? 'w-7 h-2.5 bg-taxi-yellow'
                      : 'w-2.5 h-2.5 bg-zinc-500 hover:bg-zinc-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
