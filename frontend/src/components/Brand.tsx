import { CircleDot } from 'lucide-react';

export default function Brand({ heading = false }: { heading?: boolean }) {
  const Tag = heading ? 'h1' : 'span';
  return <Tag className="brand"><span className="brand-mark" aria-hidden="true"><CircleDot size={21} strokeWidth={1.6} /></span>
    <span className="brand-word">MATCHDAY<span className="brand-dot" aria-hidden="true">.</span></span></Tag>;
}
