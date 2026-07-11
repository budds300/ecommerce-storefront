'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent — we'll get back to you within 24 hours.");
      setName('');
      setEmail('');
      setMessage('');
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Contact Us</h1>
      <p className="text-gray-500 text-sm mb-10 max-w-xl">
        Have a question about an order, a product, or anything else? Send us a message and our
        team will respond within one business day.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
        </form>

        <div className="space-y-6">
          <div className="border rounded-lg p-5">
            <p className="font-semibold text-sm mb-1">Customer Support</p>
            <p className="text-sm text-gray-600">support@softsolutionsstore.co.ke</p>
            <p className="text-sm text-gray-600">+254 700 000 000</p>
          </div>
          <div className="border rounded-lg p-5">
            <p className="font-semibold text-sm mb-1">Hours</p>
            <p className="text-sm text-gray-600">Mon–Fri: 8:00 AM – 6:00 PM</p>
            <p className="text-sm text-gray-600">Sat: 9:00 AM – 2:00 PM</p>
          </div>
          <div className="border rounded-lg p-5">
            <p className="font-semibold text-sm mb-1">Order Help</p>
            <p className="text-sm text-gray-600">
              Already placed an order? Use{' '}
              <a href="/track" className="underline hover:text-gray-900">
                Track Order
              </a>{' '}
              for real-time status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
