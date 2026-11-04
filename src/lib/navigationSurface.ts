export function getNavigationSurface(contactTop: number, headerHeight: number) {

  return { boundary: Math.max(0, Math.min(Math.max(0, headerHeight), contactTop)) }
}
