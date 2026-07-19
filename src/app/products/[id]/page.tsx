import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sdk } from '@/lib/sdk';
import { getRegionId } from '@/lib/region';
import { getStockStatus } from '@/lib/stock';
import { ProductDetail } from './ProductDetail';

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://store.softsolutions.co.ke';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const regionId = await getRegionId();
  return sdk.store.product
    .retrieve(id, {
      fields:
        'id,title,description,thumbnail,handle,*variants,*variants.calculated_price,+variants.inventory_quantity,*categories,*images,*type',
      ...(regionId ? { region_id: regionId } : {}),
    } as Record<string, unknown>)
    .then(({ product }) => product)
    .catch(() => null);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: 'Product not found' };
  }

  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.title} online in Kenya. Fast delivery, pay with M-Pesa or cash on delivery.`;
  const image = product.thumbnail ?? product.images?.[0]?.url;

  return {
    title: product.title,
    description,
    alternates: { canonical: `${SITE_URL}/products/${product.id}` },
    openGraph: {
      title: product.title,
      description,
      type: 'website',
      url: `${SITE_URL}/products/${product.id}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const variant = product.variants?.[0];
  const { inStock } = getStockStatus(variant);
  const price = variant?.calculated_price?.calculated_amount;
  const currency = variant?.calculated_price?.currency_code?.toUpperCase();
  const images = product.images?.length
    ? product.images.map((img) => img.url)
    : product.thumbnail
      ? [product.thumbnail]
      : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ?? undefined,
    image: images,
    sku: variant?.sku ?? undefined,
    brand: { '@type': 'Brand', name: 'Soft Solutions Store' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.id}`,
      priceCurrency: currency ?? 'KES',
      price: price ?? undefined,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail initialProduct={product} />
    </>
  );
}
