// pages/articles/[id].tsx
// Markdown表示（画像中央寄せ＋レスポンシブ対応＋原寸超え防止）
// 投稿更新日とタグ表示に対応（Strapi v5構造対応）
// インラインコードに黄色背景＋黒文字対応済み（CSSで補強）
// モーダルウィンドウ・原寸大対応
// ER図表示対応（Mermaid導入）
// 求人バナー表示対応
// SNSシェアボタン表示対応

import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { HTMLAttributes, DetailedHTMLProps } from 'react';

const Mermaid = dynamic(() => import('../../components/Mermaid'), { ssr: false });

function getShareUrl(base: string, url: string, title?: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = title ? encodeURIComponent(title) : '';
  switch (base) {
    case 'twitter':
      return `https://twitter.com/share?url=${encodedUrl}&text=${encodedTitle}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'line':
      return `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
    case 'hatena':
      return `https://b.hatena.ne.jp/entry/panel/?url=${encodedUrl}`;
    default:
      return '#';
  }
}

type Tag = {
  id: number;
  name: string;
};

type Article = {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  tags?: Tag[];
  thumbnailUrl?: string | null;
};

type Props = {
  article: Article | null;
};

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  inline?: boolean;
  children?: React.ReactNode;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, children, className = '', ...props }) => {
  if (inline) {
    return (
      <code
        {...props}
        style={{
          backgroundColor: '#fef08a',
          color: '#1f2937',
          padding: '0.2rem 0.4rem',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
        }}
      >
        {children}
      </code>
    );
  }
  if ((className || '').trim() === 'language-mermaid') {
    return <Mermaid chart={String(children).trim()} />;
  }
  return (
    <code className={`${className} text-sm font-mono`} {...props}>
      {children}
    </code>
  );
};

export default function ArticleDetail({ article }: Props) {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    setUrl(window.location.href);
    const buttons = document.querySelectorAll('.copy-button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement?.querySelector('code')?.textContent;
        if (code) {
          navigator.clipboard.writeText(code);
          btn.textContent = '✅ Copied!';
          setTimeout(() => {
            btn.textContent = '📋 Copy';
          }, 1500);
        }
      });
    });
    const scriptId = 'engage-widget-script';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();
    const script = document.createElement('script');
    script.src = 'https://en-gage.net/common_new/company_script/recruit/widget.js?v=74abd4d08c3f541ffc47d90ca4e4bec1babf87cd5ec5620798da6c97ecc886c7';
    script.id = scriptId;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (!article) return <p>記事が見つかりません</p>;

  const { title, content, updatedAt, tags, thumbnailUrl } = article;

  return (
    <main className="px-6 sm:px-8 lg:px-12 py-10 max-w-3xl mx-auto relative">
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center cursor-zoom-out"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="拡大画像"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
      <div className="fixed top-0 left-0 w-full bg-white border-b z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:text-gray-700 text-lg font-semibold transition-colors">
            📝 レイズクロス Tech Blog
          </Link>
          <div className="flex gap-4 mt-1">
            <a href={getShareUrl('twitter', url, title)} target="_blank" rel="noopener noreferrer">
              <img src="/icons/x.svg" alt="X" className="w-8 h-8" />
            </a>
            <a href={getShareUrl('facebook', url)} target="_blank" rel="noopener noreferrer">
              <img src="/icons/facebook.svg" alt="Facebook" className="w-8 h-8" />
            </a>
            <a href={getShareUrl('line', url)} target="_blank" rel="noopener noreferrer">
              <img src="/icons/line.svg" alt="LINE" className="w-8 h-8" />
            </a>
            <a href={getShareUrl('hatena', url)} target="_blank" rel="noopener noreferrer">
              <img src="/icons/hatena.svg" alt="はてなブックマーク" className="w-8 h-8" />
            </a>
          </div>
        </div>
      </div>
      <div className="h-14" />
      <article>
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">{title}</h1>
          {Array.isArray(tags) && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">投稿更新日: {new Date(updatedAt).toLocaleString()}</p>
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="記事のサムネイル"
              className="mx-auto my-6 rounded shadow-md w-auto h-auto max-w-full"
            />
          )}
        </header>
        <section className="prose prose-neutral prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ src, alt }) => (
                <img
                  src={src ?? ''}
                  alt={alt ?? '画像'}
                  className="mx-auto my-6 rounded shadow-md w-auto h-auto max-w-full cursor-zoom-in"
                  onClick={() => src && setModalImage(src)}
                />
              ),
              code: CodeBlock,
              pre: ({ children }) => (
                <div className="relative my-6 bg-gray-900 text-white rounded-lg overflow-auto">
                  <button className="copy-button absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">
                    📋 Copy
                  </button>
                  <pre className="p-4 text-sm">{children}</pre>
                </div>
              ),
              a: ({ href, children, ...props }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" {...props}>
                  {children}
                </a>
              ),
              table: ({ children }) => <table className="table-auto border border-gray-300 w-full text-sm">{children}</table>,
              thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
              th: ({ children }) => <th className="border px-4 py-2 text-left font-semibold">{children}</th>,
              td: ({ children }) => <td className="border px-4 py-2">{children}</td>,
            }}
          >
            {content}
          </ReactMarkdown>
        </section>
      </article>
      <div className="mt-12 flex justify-center">
        <Link href="/">
          <button className="text-sm px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition">
            ← 記事一覧に戻る
          </button>
        </Link>
      </div>
      <div className="mt-16">
        <p className="text-center text-gray-700 text-base font-medium">
          合同会社raisexでは一緒に働く仲間を募集中です。
        </p>
        <p className="text-center text-gray-600 text-sm mt-1">
          ご興味のある方は以下の採用情報をご確認ください。
        </p>
        <div className="flex justify-center mt-4">
          <a
            href=""
            className="engage-recruit-widget"
            data-height="300"
            data-width="500"
            data-url="https://en-gage.net/raisex_jobs/widget/?banner=1"
            target="_blank"
          />
        </div>
      </div>
      <footer className="text-center text-gray-400 text-sm mt-12">
        © 2024 raisex, LLC. All rights reserved.
      </footer>
    </main>
  );
}

export const getStaticPaths = async () => {
  console.log('🔍 getStaticPaths() API URL:', process.env.NEXT_PUBLIC_API_URL); // ← この行を追加
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles?fields=documentId&pagination[pageSize]=100`);
    const json = await res.json();
    const paths = Array.isArray(json.data)
      ? json.data.map((item: any) => ({ params: { id: item.documentId } }))
      : [];
    return { paths, fallback: false };
  } catch (err) {
    console.error('getStaticPaths エラー:', err);
    return { paths: [], fallback: false };
  }
};

export const getStaticProps: GetStaticProps<Props> = async (context: GetStaticPropsContext) => {
  console.log('🔍 [id].tsx getStaticProps() API URL:', process.env.NEXT_PUBLIC_API_URL); // ← 追加
  const { id } = context.params ?? {};
  if (typeof id !== 'string') {
    return { props: { article: null } };
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles?filters[documentId][$eq]=${id}&populate[tags]=true&populate[thumbnail]=true`);
    const json = await res.json();
    if (!json.data || json.data.length === 0) {
      return { props: { article: null } };
    }
    const item = json.data[0];
    const attributes = item.attributes || {};
    const title = attributes.title ?? null;
    const content = attributes.content ?? '';
    const publishedAt = attributes.publishedAt ?? null;
    const updatedAt = attributes.updatedAt ?? null;
    if (!title || !publishedAt || !updatedAt) {
      return { props: { article: null } };
    }
    const tagList = Array.isArray(attributes.tags?.data)
      ? attributes.tags.data.map((tag: any) => ({ id: tag.id, name: tag.attributes?.name || '' }))
      : [];
    const rawUrl = attributes.thumbnail?.data?.attributes?.url;
    const thumbnailUrl = rawUrl ? `${process.env.NEXT_PUBLIC_API_URL}${rawUrl}` : null;
    return {
      props: {
        article: {
          id: item.id,
          title,
          content,
          publishedAt,
          updatedAt,
          tags: tagList,
          thumbnailUrl,
        },
      },
    };
  } catch (err) {
    console.error('記事取得エラー:', err);
    return { props: { article: null } };
  }
};