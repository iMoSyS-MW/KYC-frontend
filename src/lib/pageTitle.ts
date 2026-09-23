export function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'KYC Form Selection'
  if (pathname === '/kyc/group') return 'Group KYC Form'
  if (pathname === '/kyc/corporate') return 'Corporate KYC Form'
  if (pathname === '/kyc/individual') return 'Individual KYC Form'
  if (pathname.startsWith('/kyc/update/individual')) return 'Update Individual KYC'
  if (pathname.startsWith('/kyc/update/group')) return 'Update Group KYC'
  if (pathname.startsWith('/kyc/update/corporate')) return 'Update Corporate KYC'
  return 'KYC Form Selection'
}
