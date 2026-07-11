import Link from 'next/link';

const STEPS = [
  { title: 'Request a return', body: 'Contact us within 7 days of delivery with your order number and reason for return.' },
  { title: 'We review', body: 'Our team confirms eligibility and shares pickup or drop-off instructions.' },
  { title: 'Refund or replacement', body: 'Once the item is inspected, we process your refund or send a replacement.' },
];

const FAQ = [
  { q: 'What items are eligible for return?', a: 'Unopened, unused items in original packaging within 7 days of delivery. Perishables and made-to-order items are not eligible.' },
  { q: 'How long do refunds take?', a: 'Refunds to M-Pesa are processed within 3–5 business days after we receive and inspect the returned item.' },
  { q: 'Who pays for return shipping?', a: 'We cover return shipping if the item arrived damaged, defective, or incorrect. Otherwise, return shipping is the customer’s responsibility.' },
  { q: 'Can I exchange instead of refund?', a: 'Yes — let us know when you request the return and we’ll arrange a like-for-like exchange where stock allows.' },
];

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Returns &amp; Refunds</h1>
      <p className="text-gray-500 text-sm mb-10">
        We want you to be happy with your purchase. Here&apos;s how returns work.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {STEPS.map((step, i) => (
          <div key={step.title} className="border rounded-lg p-5">
            <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mb-3">
              {i + 1}
            </div>
            <p className="font-semibold text-sm mb-1">{step.title}</p>
            <p className="text-sm text-gray-600">{step.body}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
      <div className="divide-y border rounded-lg mb-10">
        {FAQ.map((item) => (
          <div key={item.q} className="p-4">
            <p className="font-medium text-sm mb-1">{item.q}</p>
            <p className="text-sm text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-6 bg-gray-50 text-center">
        <p className="font-semibold text-sm mb-1">Need to start a return?</p>
        <p className="text-sm text-gray-600 mb-4">Reach out with your order number and we&apos;ll take it from there.</p>
        <Link
          href="/contact"
          className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
