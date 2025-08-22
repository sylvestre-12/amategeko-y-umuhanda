'use client';

import Image from 'next/image';

export default function ImageDisplay() {
  return (
    <div style={{ width: '100%', height: '250px', position: 'relative' }}>
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
