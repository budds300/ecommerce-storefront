const COMMITMENTS = [
  'Semantic HTML and landmark regions so screen readers can navigate the site predictably.',
  'Keyboard-operable navigation, forms, and interactive controls across every page.',
  'Visible focus states and sufficient color contrast for text and interactive elements.',
  'Responsive layouts that adapt to screen size, zoom level, and text scaling without loss of content.',
  'Descriptive alt text for product imagery and icon-only controls.',
];

export default function AccessibilityPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Accessibility Statement</h1>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed">
        Soft Solutions Store is committed to making our site usable by everyone, including
        customers who rely on assistive technology. We follow the Web Content Accessibility
        Guidelines (WCAG) 2.1 Level AA as our baseline standard.
      </p>

      <h2 className="text-base font-semibold mb-3">What we do</h2>
      <ul className="space-y-3 mb-10">
        {COMMITMENTS.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-gray-600">
            <span className="text-gray-900 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 className="text-base font-semibold mb-2">Ongoing work</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-8">
        Accessibility is an ongoing effort. We regularly review our pages and components and
        welcome feedback on areas that need improvement.
      </p>

      <div className="border rounded-lg p-5 bg-gray-50">
        <p className="font-semibold text-sm mb-1">Found an accessibility issue?</p>
        <p className="text-sm text-gray-600">
          Let us know at{' '}
          <a href="mailto:accessibility@softsolutionsstore.co.ke" className="underline hover:text-gray-900">
            accessibility@softsolutionsstore.co.ke
          </a>{' '}
          or via our{' '}
          <a href="/contact" className="underline hover:text-gray-900">
            contact page
          </a>
          , and we&apos;ll work to address it promptly.
        </p>
      </div>
    </div>
  );
}
