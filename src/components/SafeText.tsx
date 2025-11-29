/**
 * Safe text rendering component
 * Automatically escapes HTML to prevent XSS
 */
import { escapeHtml } from "@/lib/xss-protection";

type Props = {
  children: string | number | null | undefined;
  className?: string;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

/**
 * Component that safely renders text by escaping HTML
 * Use this for all user-generated content
 */
export default function SafeText({ children, className, as: Component = "span" }: Props) {
  const safeText = escapeHtml(children);
  
  return <Component className={className} dangerouslySetInnerHTML={{ __html: safeText }} />;
}

/**
 * Hook for escaping text in client components
 */
export function useSafeText(text: string | number | null | undefined): string {
  return escapeHtml(text);
}
