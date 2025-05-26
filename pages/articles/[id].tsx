// pages/articles/[id].tsx
// Markdown表示（画像中央寄せ＋レスポンシブ対応＋原寸超え防止）
// 投稿更新日とタグ表示に対応（Strapi v5構造対応）
// インラインコードに黄色背景＋黒文字対応済み（CSSで補強）
// モーダルウィンドウ・原寸大対応
// ER図表示対応（Mermaid導入）
// 求人バナー表示対応
// SNSシェアボタン表示対応
// SSR 詳細ページ (Strapi v5 構造完全対応)

import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Mermaid = dynamic(() => import('../../components/Mermaid'), { ssr: false })

function getShareUrl(base: string, url: string, title?: string) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = title ? encodeURIComponent(title) : ''
  switch (base) {
    case 'twitter':
      return `https://twitter.com/share?url=${encodedUrl}&text=${encodedTitle}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    case 'line':
      return `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
    case 'hatena':
      return `https://b.hatena.ne.jp/entry/panel/?url=${encodedUrl}`
    default:
      return '#'
  }
}

export default function ArticleDetail({ article }: { article: any }) {
  const [modalImage, setModalImage] = useState<string | null>(null)
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(window.location.href)
    document.querySelectorAll('.copy-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement?.querySelector('code')?.textContent
        if (code) {
          navigator.clipboard.writeText(code)
          btn.textContent = '✅ Copied!'
          setTimeout(() => {
            btn.textContent = '📋 Copy'
          }, 1500)
        }
      })
    })
    const script = document.createElement('script')
    script.id = 'engage-widget-script'
    script.src = 'https://en-gage.net/common_new/company_script/recruit/widget.js?v=vercel'
    script.async = true
    document.body.appendChild(script)
  }, [])

  if (!article) return <p>記事が見つかりません</p>

  const { title, content, updatedAt, tags, thumbnailUrl } = article

  return (
    <main className="px-6 sm:px-8 lg:px-12 py-10 max-w-3xl mx-auto relative">
      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center cursor-zoom-out" onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="拡大画像" className="max-w-full max-h-full rounded-lg shadow-lg" />
        </div>
      )}

      <div className="fixed top-0 left-0 w-full bg-white border-b z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:text-gray-700 text-lg font-semibold">📝 レイズクロス Tech Blog</Link>
          <div className="flex gap-4 mt-1">
            <a href={getShareUrl('twitter', url, title)} target="_blank" rel="noopener noreferrer"><img src="/icons/x.svg" alt="X" className="w-8 h-8" /></a>
            <a href={getShareUrl('facebook', url)} target="_blank" rel="noopener noreferrer"><img src="/icons/facebook.svg" alt="Facebook" className="w-8 h-8" /></a>
            <a href={getShareUrl('line', url)} target="_blank" rel="noopener noreferrer"><img src="/icons/line.svg" alt="LINE" className="w-8 h-8" /></a>
            <a href={getShareUrl('hatena', url)} target="_blank" rel="noopener noreferrer"><img src="/icons/hatena.svg" alt="はてな" className="w-8 h-8" /></a>
          </div>
        </div>
      </div>
      <div className="h-14" />

      <article>
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">{title}</h1>
          {Array.isArray(tags) && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag: any) => (
                <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">{tag.name}</span>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">投稿更新日: {new Date(updatedAt).toLocaleString()}</p>
          {thumbnailUrl && <img src={thumbnailUrl} alt="サムネイル" className="mx-auto my-6 rounded shadow-md max-w-full h-auto" />}
        </header>

        <section className="prose prose-neutral prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ src, alt }) => (
                <img src={src ?? ''} alt={alt ?? '画像'} className="mx-auto my-6 rounded shadow-md max-w-full cursor-zoom-in" onClick={() => src && setModalImage(src)} />
              ),
              code: ({ inline, children }) => (
                inline ? (
                  <code className="bg-yellow-200 text-black px-1 rounded text-sm">{children}</code>
                ) : (
                  <code className="text-sm font-mono">{children}</code>
                )
              ),
              pre: ({ children }) => (
                <div className="relative my-6 bg-gray-900 text-white rounded-lg overflow-auto">
                  <button className="copy-button absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">📋 Copy</button>
                  <pre className="p-4 text-sm">{children}</pre>
                </div>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </section>
      </article>

      <div className="mt-12 flex justify-center">
        <Link href="/">
          <button className="text-sm px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">← 記事一覧に戻る</button>
        </Link>
      </div>

      <footer className="text-center text-gray-400 text-sm mt-12">
        © 2024 raisex, LLC. All rights reserved.
      </footer>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const { id } = context.params ?? {}
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  console.log('⚡ getServerSideProps 呼び出し')
  console.log('🌐 NEXT_PUBLIC_API_URL =', apiUrl)
  console.log('🔎 記事ID =', id)

  if (!id || typeof id !== 'string' || !apiUrl) return { props: { article: null } }

  try {
    const fetchUrl = `${apiUrl}/api/articles?filters[documentId][$eq]=${id}&populate=*`
    console.log('📡 Fetching from:', fetchUrl)
    const res = await fetch(fetchUrl)
    const json = await res.json()

    console.log('📦 JSON length:', json.data?.length)
    if (!json.data?.[0]) return { props: { article: null } }

    const item = json.data[0]
    console.log('🧪 json.data[0]:', JSON.stringify(item, null, 2))

    const thumbnailUrl = item.thumbnail?.[0]?.formats?.medium?.url || item.thumbnail?.[0]?.url || null

    return {
      props: {
        article: {
          id: item.id,
          title: item.title,
          content: item.content,
          updatedAt: item.updatedAt,
          publishedAt: item.publishedAt,
          tags: item.tags || [],
          thumbnailUrl,
        },
      },
    }
  } catch (err) {
    console.error('❌ 記事取得エラー:', err)
    return { props: { article: null } }
  }
}