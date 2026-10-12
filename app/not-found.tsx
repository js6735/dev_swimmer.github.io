import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="empty">
      <h1 className="post-title">페이지를 찾을 수 없습니다</h1>
      <p>
        주소가 바뀌었거나 비공개로 전환된 글일 수 있습니다. <Link href="/">글 목록으로 돌아가기</Link>
      </p>
    </div>
  );
}
