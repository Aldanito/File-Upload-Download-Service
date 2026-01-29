"use client";

import React from "react";
import Link from "next/link";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-md space-y-6 px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold text-primary">Something went wrong</h1>
          <p className="text-secondary text-sm">
            An error occurred. Please try again or return to the home page.
          </p>
          <Link
            href="/"
            className="inline-block rounded border border-primary bg-primary px-4 py-2 text-sm text-light transition hover:bg-primary-hover"
          >
            Back to home
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
