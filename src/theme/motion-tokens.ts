/**
 * Comprehensive Website Motion & Animation System for GundamDev
 * GPU-friendly (transform & opacity only), responsive, performance-optimized,
 * and fully compliant with prefers-reduced-motion.
 */

export const DURATIONS = {
  instant: 0.1,  // ~100ms for state feedback & micro-interactions
  fast: 0.18,    // ~180ms for tab & file switching
  base: 0.28,    // ~280ms for bottom sheets & page reveals
  slow: 0.45,    // ~450ms for scene transitions & welcome sequence
} as const;

export const EASINGS = {
  standard: [0.16, 1, 0.3, 1] as const,     // Custom fluid decelerate
  decelerate: [0.0, 0.0, 0.2, 1] as const, // Entrances
  accelerate: [0.4, 0.0, 1, 1] as const,   // Exits
};

export const MOTION_VARIANTS = {
  // Page reveal with subtle 8px translate
  fadeUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: DURATIONS.base, ease: EASINGS.standard }
  },

  // Horizontal view slide for section switching
  slideSection: {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -12 },
    transition: { duration: DURATIONS.fast, ease: EASINGS.standard }
  },

  // Bottom Sheet reveal (Mobile UI)
  bottomSheet: {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
    transition: { duration: DURATIONS.base, ease: EASINGS.decelerate }
  },

  // Modal zoom & fade
  modalZoom: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: DURATIONS.fast, ease: EASINGS.standard }
  },

  // Staggered child reveals (Project list, file list)
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.01
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATIONS.fast, ease: EASINGS.decelerate }
  },

  // File content switch flash
  fileSwitch: {
    initial: { opacity: 0.4 },
    animate: { opacity: 1 },
    transition: { duration: DURATIONS.fast, ease: EASINGS.standard }
  },

  // Status & error state alerts
  errorShake: {
    initial: { opacity: 0, x: -6 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: DURATIONS.fast, ease: EASINGS.standard }
  },

  // Welcome sequence specific choreography
  welcomeUsername: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATIONS.slow, delay: 0.12, ease: EASINGS.standard }
  },
  
  welcomeSubtext: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: DURATIONS.base, delay: 0.3, ease: EASINGS.standard }
  }
};
