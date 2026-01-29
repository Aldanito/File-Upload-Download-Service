import { Header } from "@/widgets/Header";
import { Footer } from "@/widgets/Footer";
import { ErrorBoundary } from "@/shared/ui";
import { getApiBaseUrl } from "@/config";
import "./globals.css";

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const apiUrl = getApiBaseUrl();
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#f5f4f0] text-primary">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__API_URL__=${JSON.stringify(apiUrl)}`,
          }}
        />
        <Header />
        <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <Footer />
      </body>
    </html>
  );
}
