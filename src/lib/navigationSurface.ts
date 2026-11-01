export function getNavigationSurface(contactTop: number, headerHeight: number) {
  // The section edge reveals cream spatially; neither palette is colour-mixed.
  return { boundary: Math.max(0, Math.min(Math.max(0, headerHeight), contactTop)) }
}
