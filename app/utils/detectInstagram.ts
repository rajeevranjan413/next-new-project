export function isInstagramBrowser(userAgent: string): boolean {
  // Check for Instagram in-app browser indicators
  return /Instagram|FBAN\/FBIOS|FBAN\/FB4A|FB4A|FB_IAB/.test(userAgent);
}
