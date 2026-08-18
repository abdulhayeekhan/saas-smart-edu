export const base_path ='/'
export const img_path ='/'
export const CompanyName = 'Smart Edu'
export const defaultRegionLogoPath = '/Uploads/RegionLogos/13082026103654-52d71101.png'
export const getRegionLogoUrl = (logoPath?: string | null) => {
  const path = logoPath || defaultRegionLogoPath
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${process.env.REACT_APP_API_BASE_URL || ''}${cleanPath}`
}
export const Companylogo = 'assets/img/logo-smart-edu.svg'
export const CompnayIcon = 'assets/img/logo-small.svg'
export const BrandName = 'DAR-E-ARQAM SCHOOL'
export const CompanyWhiteLogo = 'assets/img/logo-dark.svg'
export const CoverPhoto = 'assets/img/logo-smart-edu.svg'
export const Copyright = 'Smart Edu'
export const CurrYear = new Date().getFullYear();
export const PoweredBy = 'Dev Prism Pvt ltd.'
export const SmartEduUrl = 'https://smartedu.site/'
export const DevPrismUrl = 'https://devprism.site/'
export const feeTermsConditions = `1. Fee paid after the due date is subject to a fine.
2. Name would be struck off on non-payment.
3. Ensuring the timely receipt of fee voucher is the responsibility of parents.
4. Parents must retain their copy for future reference.
5. Fee once paid is non-transferable and non-refundable.
6. Fee will be accepted through HBL Connect / 1-Link.
7. Fee will be increased every academic year.
8. We reserve all legal rights and remedies.`;