import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl space-y-12 px-4 text-center">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-primary md:text-4xl">
          File Upload / Download Service
        </h1>
        <p className="mt-3 text-secondary">
          Create a secure share to collect files from contributors. Anyone with the download link and password can view and download the collected files.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/share/new"
          className="rounded-xl border-2 border-primary bg-white p-6 shadow-sm transition duration-200 hover:border-primary-hover hover:bg-primary/5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-primary">Create Share</h2>
          <p className="mt-2 text-sm text-secondary">
            Create a share and receive two links: one for contributors to upload files, one for anyone who should view and download. Each link is protected by its own password.
          </p>
        </Link>
        <Link
          href="/access"
          className="rounded-xl border-2 border-secondary bg-white p-6 shadow-sm transition duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-primary">Enter a link</h2>
          <p className="mt-2 text-sm text-secondary">
            Open an existing share by pasting your link to upload files or download collected files.
          </p>
        </Link>
      </div>
    </div>
  );
}
