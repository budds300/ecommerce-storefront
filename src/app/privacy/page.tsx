const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly — name, email, phone number, and delivery address — when you create an account, place an order, or contact support. We also collect order and payment metadata (not full card/M-Pesa credentials) needed to process transactions.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to process orders, provide customer support, send order and delivery updates, and improve our products and services. We do not sell your personal information to third parties.',
  },
  {
    title: '3. Payment Information',
    body: 'M-Pesa payments are processed through our licensed payment partner. We never store your M-Pesa PIN or full payment credentials on our servers.',
  },
  {
    title: '4. Cookies',
    body: 'We use cookies and local storage to keep your cart, session, and preferences intact between visits. You can clear these at any time through your browser settings.',
  },
  {
    title: '5. Data Sharing',
    body: 'We share data with delivery partners and payment processors strictly to fulfil your order. These partners are contractually required to protect your data.',
  },
  {
    title: '6. Your Rights',
    body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting our support team.',
  },
  {
    title: '7. Contact',
    body: 'Questions about this policy can be sent to privacy@softsolutionsstore.co.ke.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
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
