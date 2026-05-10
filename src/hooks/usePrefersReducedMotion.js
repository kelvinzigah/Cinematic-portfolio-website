export function useMotionPreference() {
  return { reduced: false, override: "motion", systemReduced: false };
}

export default function usePrefersReducedMotion() {
  return false;
}
