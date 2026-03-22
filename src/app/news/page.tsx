import { getNews } from '@/lib/dropbox';

export const revalidate = 3600;

export default async function NewsPage() {
  const newsItems = await getNews();

  return (
    <section>
      <div className="section-wrapper pt-24 pb-24">
        {newsItems.length > 0 && (
          <div className="max-w-3xl">
            <div className="space-y-0">
              {newsItems.map((item, index) => (
                <article
                  key={index}
                  className="group py-6 border-b border-lab-200 first:border-t hover:bg-lab-100/50 -mx-4 px-4 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <time className="text-sm font-mono text-lab-400 shrink-0 pt-0.5">
                      {item.date}
                    </time>
                    <div className="flex-1">
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-1">
                          {item.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-lab-100 text-lab-500 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                          className="text-base font-semibold text-lab-900 group-hover:text-lab-700 transition-colors hover:underline">
                          {item.title}
                        </a>
                      ) : (
                        <h3 className="text-base font-semibold text-lab-900 group-hover:text-lab-700 transition-colors">
                          {item.title}
                        </h3>
                      )}
                      {item.description && (
                        <p className="mt-1 text-sm text-lab-500 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
