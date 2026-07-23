/**
 * Position Locking Utility
 * Manages position throughout the onboarding flow
 * Position is set once at /welcome-center and cannot be changed
 */

export interface PositionLock {
  position: string
  applicantId: string
  lockedAt: number
}

/**
 * Get locked position from localStorage
 * Returns null if not set
 */
export function getLockedPosition(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('position')
  } catch {
    return null
  }
}

/**
 * Get locked applicant ID from localStorage
 * Returns null if not set
 */
export function getLockedApplicantId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('applicant_id')
  } catch {
    return null
  }
}

/**
 * Set position lock (called once at /welcome-center)
 * Should not be overwritten during flow
 */
export function setPositionLock(position: string, applicantId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('position', position)
    localStorage.setItem('applicant_id', applicantId)
    localStorage.setItem('position_locked_at', new Date().toISOString())
  } catch {
    console.error('Failed to set position lock')
  }
}

/**
 * Validate position matches URL param
 * Used on each page to ensure position wasn't switched
 * Returns true if position is valid and matches
 */
export function validatePositionLock(urlPosition: string | null): boolean {
  const storedPosition = getLockedPosition()
  
  // If no URL position provided, validation fails
  if (!urlPosition) return false
  
  // If no stored position, this is first page (allow it)
  if (!storedPosition) return true
  
  // Position must match URL param
  return decodeURIComponent(urlPosition) === storedPosition
}

/**
 * Clear position lock (call on logout or restart)
 */
export function clearPositionLock(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('position')
    localStorage.removeItem('applicant_id')
    localStorage.removeItem('position_locked_at')
  } catch {
    console.error('Failed to clear position lock')
  }
}

/**
 * Check if position lock is still valid
 * (can optionally set expiration time in hours)
 */
export function isPositionLockValid(maxAgeHours: number = 24): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const lockedAt = localStorage.getItem('position_locked_at')
    if (!lockedAt) return false
    
    const lockTime = new Date(lockedAt).getTime()
    const now = new Date().getTime()
    const ageHours = (now - lockTime) / (1000 * 60 * 60)
    
    return ageHours < maxAgeHours
  } catch {
    return false
  }
}

/**
 * Get position for display (decoded from URL if needed)
 */
export function getDisplayPosition(urlPosition: string | null): string | null {
  if (!urlPosition) return getLockedPosition()
  return decodeURIComponent(urlPosition)
}
