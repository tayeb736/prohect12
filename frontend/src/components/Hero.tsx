import { useState, useEffect, useRef } from 'react';

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      badge: { icon: "fas fa-bolt", text: "Special Offer" },
      title: "Bluetooth Blood Pressure Monitors",
      text: "Medical-grade precision with wireless connectivity. Up to 30% off on premium blood pressure monitors.",
      cta: { link: "#products", text: "Discover Now" }
    },
    {
      badge: { icon: "fas fa-shield-virus", text: "Maximum Protection" },
      title: "Personal Protective Equipment",
      text: "Gloves, masks, gowns & shoe covers compliant with hospital standards. In-stock for fast delivery.",
      cta: { link: "#products", text: "Shop PPE" }
    },
    {
      badge: { icon: "fas fa-microscope", text: "Advanced Diagnostics" },
      title: "Precision Diagnostic Equipment",
      text: "Stethoscopes, otoscopes, portable ultrasounds & pulse oximeters. Reliable tools for accurate diagnostics.",
      cta: { link: "#products", text: "Explore Diagnostics" }
    },
    {
      badge: { icon: "fas fa-fire", text: "Mega Sale" },
      title: "Flash Deals on Surgical Instruments",
      text: "Premium stainless steel surgical tools at unbeatable prices. Limited stock – order now!",
      cta: { link: "#offers", text: "View Deals" }
    },
    {
      badge: { icon: "fas fa-gem", text: "Premium Quality" },
      title: "Lab & Diagnostic Analyzers",
      text: "Professional hematology, chemistry & immunoassay analyzers. Trusted by top laboratories in Algeria.",
      cta: { link: "#products", text: "Shop Lab Equipment" }
    }
  ];

  const slideCount = slides.length;
  const timeoutRef = useRef<number | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = window.setTimeout(
      () => setCurrentSlide((prev) => (prev === slideCount - 1 ? 0 : prev + 1)),
      6000
    );

    return () => {
      resetTimeout();
    };
  }, [currentSlide, slideCount]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slideCount - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  return (
    <section className="hero container" id="heroCarousel">
      <div className="hero__blob hero__blob--1"></div>
      <div className="hero__blob hero__blob--2"></div>
      
      <div 
        className="hero__slides" 
        style={{ transform: `translateX(-${currentSlide * 100}%)`, transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      >
        {slides.map((slide, index) => (
          <div className="hero__slide" key={index}>
            <div className="hero__content" style={{ animationDelay: '0.2s' }}>
              <span className="hero__badge">
                <i className={slide.badge.icon}></i> {slide.badge.text}
              </span>
              <h2 className="hero__title">{slide.title}</h2>
              <p className="hero__text">{slide.text}</p>
              <a href={slide.cta.link} className="hero__cta">
                {slide.cta.text} <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        ))}
      </div>

      <button className="hero__arrow hero__arrow--prev" onClick={prevSlide} aria-label="Previous">
        <i className="fas fa-chevron-left"></i>
      </button>
      <button className="hero__arrow hero__arrow--next" onClick={nextSlide} aria-label="Next">
        <i className="fas fa-chevron-right"></i>
      </button>

      <div className="hero__dots">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            className={`hero__dot ${currentSlide === idx ? 'active' : ''}`} 
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>
      
      <div 
        className="hero__progress" 
        style={{ width: '100%', animation: 'loaderFill 6s linear infinite', animationName: currentSlide >= 0 ? 'loaderFill' : 'none' }}
      ></div>
    </section>
  );
};
