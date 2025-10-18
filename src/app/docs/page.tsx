import { CorporateApiDocs } from "@/components/corporate-api-docs";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <CorporateApiDocs />
    </div>
  );
}

export const metadata = {
  title: 'API Documentation - Lynxa Pro Developer Portal',
  description: 'Comprehensive API documentation for Lynxa Pro - Enterprise-grade AI API powered by Nexariq (AJ STUDIOZ)',
};
