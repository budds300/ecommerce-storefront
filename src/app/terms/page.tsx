const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By using Soft Solutions Store, you agree to these terms. If you do not agree, please do not use our services.',
  },
  {
    title: '2. Orders & Pricing',
    body: 'All prices are listed in Kenyan Shillings (KES) and include applicable taxes unless stated otherwise. We reserve the right to correct pricing errors and cancel orders placed at an incorrect price before dispatch.',
  },
  {
    title: '3. Payment',
    body: 'We accept M-Pesa and Cash on Delivery. Orders paid via M-Pesa are confirmed once payment is received; Cash on Delivery orders require email verification before dispatch.',
  },
  {
    title: '4. Shipping & Delivery',
    body: 'Delivery timelines and costs vary by city and are shown at checkout. Risk of loss passes to the customer upon delivery to the address provided.',
  },
  {
    title: '5. Returns',
    body: 'See our Returns & Refunds policy for eligibility, timelines, and process.',
  },
  {
    title: '6. Account Responsibility',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'Soft Solutions Store is not liable for indirect or consequential damages arising from use of our products or services, to the extent permitted by law.',
  },
  {
    title: '8. Changes to These Terms',
    body: 'We may update these terms from time to time. Continued use of the site after changes constitutes acceptance of the revised terms.',
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-gray-400 text-xs mb-10">Last updated: July 2026</p>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-semibold mb-2">{section.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
