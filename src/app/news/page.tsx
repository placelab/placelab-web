import InstagramFeed from '@/components/InstagramFeed';

export const revalidate = 3600;

export default function NewsPage() {
  return (
    <section>
      <div className="section-wrapper pt-24 pb-24">
        <InstagramFeed />
      </div>
    </section>
  );
}
