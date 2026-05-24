import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

function ErrorFallback() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h2 className="text-xl font-semibold text-foreground mb-2">{t("error.unexpectedError")}</h2>
      <Button onClick={() => window.location.reload()}>{t("error.reloadPage")}</Button>
    </div>
  );
}
