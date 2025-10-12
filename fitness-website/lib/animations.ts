/**
 * Lightweight animation utilities to replace heavy framer-motion usage
 * These CSS-based animations are much more performant
 */

// Animation variants for common patterns
export const fadeInUp = {
  initial: { opacity: 0, transform: 'translateY(20px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  transition: 'all 0.6s ease-out'
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: 'opacity 0.6s ease-out'
};

export const slideInLeft = {
  initial: { opacity: 0, transform: 'translateX(-20px)' },
  animate: { opacity: 1, transform: 'translateX(0px)' },
  transition: 'all 0.6s ease-out'
};

export const slideInRight = {
  initial: { opacity: 0, transform: 'translateX(20px)' },
  animate: { opacity: 1, transform: 'translateX(0px)' },
  transition: 'all 0.6s ease-out'
};

export const scaleIn = {
  initial: { opacity: 0, transform: 'scale(0.9)' },
  animate: { opacity: 1, transform: 'scale(1)' },
  transition: 'all 0.6s ease-out'
};

// CSS classes for animations (to be added to globals.css)
export const animationClasses = {
  fadeInUp: 'animate-fade-in-up',
  fadeIn: 'animate-fade-in',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  scaleIn: 'animate-scale-in',
  stagger: 'animate-stagger'
};

// Intersection Observer hook for triggering animations
import React from 'react';

export const useInView = (threshold = 0.1) => {
  if (typeof window === 'undefined') return { ref: null, inView: true };
  
  const ref = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
};

// Stagger animation utility
export const staggerChildren = (delay = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: delay
    }
  }
});

// Performance-optimized motion component
export const MotionDiv = React.memo(({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  animation?: keyof typeof animationClasses;
  delay?: number;
  className?: string;
  [key: string]: any;
}) => {
  const { ref, inView } = useInView();
  
  return React.createElement(
    'div',
    {
      ref: ref,
      className: `${className} ${inView ? animationClasses[animation] : 'opacity-0'}`,
      style: {
        animationDelay: `${delay}s`,
        ...(props.style || {})
      },
      ...props
    },
    children
  );
});

MotionDiv.displayName = 'MotionDiv';
