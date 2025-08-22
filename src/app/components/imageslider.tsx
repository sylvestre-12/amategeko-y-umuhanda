'use client';

import Image from 'next/image';

export default function ImageDisplay() {
  return (
  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
  <Image
    src="/image/amamaza02.png"
    alt="Amamaza"
    fill
    sizes="100vw"
    className="object-cover"
    priority
  />
</div>

  );
}
