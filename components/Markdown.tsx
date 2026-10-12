import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          // 위챗 미니프로그램용 wxml / wxss 코드블록도 색이 입혀지도록 별칭을 지정합니다.
          [rehypeHighlight, { aliases: { xml: ['wxml'], css: ['wxss'] } }],
        ]}
        components={{
          // public/ 아래 이미지를 `/images/a.png` 로 적으면 basePath를 붙여줍니다.
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={typeof src === 'string' && src.startsWith('/') ? `${basePath}${src}` : src}
              alt={alt ?? ''}
              loading="lazy"
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
