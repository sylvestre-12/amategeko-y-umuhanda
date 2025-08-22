'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const [contactNumber, setContactNumber] = useState('');
  const router = useRouter();

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ✅ NAVIGATION */}
      <nav
        style={{
          backgroundColor: '#4a90e2',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        <div style={{ marginBottom: '5px' }}>KWIGA AMATEGEKO Y’UMUHANDA</div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            fontSize: '14px',
          }}
        >
          <span style={{ cursor: 'pointer' }}>Home</span>
          <span style={{ cursor: 'pointer' }}>About</span>
          <span style={{ cursor: 'pointer' }}>Services</span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => setContactNumber('0786278953')}
          >
            Contact
          </span>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/auth/signup')}
          >
            Account
          </span>
        </div>
      </nav>

      {/* Show contact number if clicked */}
      {contactNumber && (
        <div
          style={{
            textAlign: 'center',
            padding: '5px',
            background: '#f1f1f1',
            color: 'green',
            fontWeight: 'bold',
          }}
        >
          {contactNumber}
        </div>
      )}

      {/* ✅ HERO BANNER */}
      <section
        style={{
          backgroundColor: 'yellow',
          padding: '40px 20px',
          textAlign: 'center',
          borderBottom: '2px solid green',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'black',
            lineHeight: '1.6',
          }}
        >
          IYI SYSTEM IFASHA KWIGA NO GUSUZUMA UBUMENYI UFITE <br />
          MUMATEGEKO Y’UMUHANDA ARIKO UBANJE KUGIRA KONTI YAWE <br />
          KANDA HEPHO IBUMOSO BWAWE
        </h2>
      </section>

      {/* ✅ TWO COLUMNS (STACKS ON MOBILE) */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          height: 'auto',
          flex: '1',
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            flex: '1 1 300px',
            minHeight: '250px',
            backgroundColor: 'black',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              textDecoration: 'underline',
              fontWeight: 'bold',
              fontSize: '18px',
              marginBottom: '15px',
            }}
          >
            SERVICE ZITANGIRA
          </h3>
         <p
  style={{ cursor: 'pointer', color: 'lightblue', textDecoration: 'underline' }}
  onClick={() => router.push('/auth/login')}
>
  KANDA HANO KW’INJIRA
</p>
<p
  style={{ cursor: 'pointer', color: 'lightblue', textDecoration: 'underline' }}
  onClick={() => router.push('/auth/signup')}
>
  KANDA HANO UFUNGURE KONTE
</p>

        </div>

        {/* CENTER COLUMN */}
        <div
          style={{
            flex: '1 1 300px',
            minHeight: '250px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          <h2>
            USHAKA KWIGA IMODOKA UKANABONA URUHUSHYA <br />
            RWO GUTWARA IBINYABIZIGA RWA BURUNDU WATUGANA
          </h2>
        </div>

        {/* RIGHT COLUMN: Single Image */}
        <div
          style={{
            flex: '1 1 300px',
            minHeight: '250px',
            backgroundColor: 'white',
            color: '#333',
            padding: '0',
            border: '1px solid lightgreen',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <Image
            src="/image/amamaza02.png"
            alt="Amamaza"
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </section>

      {/* ✅ FOOTER */}
      <footer
        style={{
          backgroundColor: '#333',
          color: 'white',
          textAlign: 'center',
          padding: '15px 10px',
          marginTop: 'auto',
        }}
      >
        &copy; {new Date().getFullYear()} KWIGA AMATEGEKO Y’UMUHANDA | Copy Rights Tegeri
      </footer>
    </div>
  );
}
