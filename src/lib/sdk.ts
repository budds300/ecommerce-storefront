import Medusa from '@medusajs/js-sdk';


console.log('API URL:', process.env['NEXT_PUBLIC_API_URL']);
console.log('Key present:', !!process.env['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY']);


export const sdk = new Medusa({
  baseUrl: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:9000',
  publishableKey: process.env['NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'] ?? '',
});
