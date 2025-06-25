import Link from "next/link";

interface NavigationProps {
  title?: string;
  backLink?: {
    href: string;
    text: string;
  };
  className?: string;
}

export default function Navigation({
  title,
  backLink,
  className,
}: NavigationProps) {
  return (
    <nav className={`mb-8 ${className}`}>
      {backLink && (
        <Link
          href={backLink.href}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1 transition-colors"
        >
          <span>←</span>
          <span>{backLink.text}</span>
        </Link>
      )}
      {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
    </nav>
  );
}
