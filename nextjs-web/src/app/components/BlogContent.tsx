interface BlogContentProps {
  content: string;
  className?: string;
}

export default function BlogContent({
  content,
  className = "",
}: BlogContentProps) {
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <div
        className="
        whitespace-pre-wrap 
        font-sans 
        leading-relaxed 
        text-gray-800
        [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-8 [&>h1]:text-gray-900
        [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:mt-6 [&>h2]:text-gray-900
        [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mb-2 [&>h3]:mt-4 [&>h3]:text-gray-900
        [&>p]:mb-4 [&>p]:leading-relaxed
        [&>ul]:mb-4 [&>ul]:ml-6 [&>ul]:list-disc
        [&>ol]:mb-4 [&>ol]:ml-6 [&>ol]:list-decimal
        [&>li]:mb-1 [&>li]:leading-relaxed
        [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm
        [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600
      "
      >
        {content}
      </div>
    </div>
  );
}
