

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-300 min-h-screen">
        {children}
      </body>
    </html>
  );
}
