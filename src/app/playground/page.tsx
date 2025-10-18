import { EnhancedApiPlayground } from "@/components/enhanced-api-playground";

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Lynxa Pro Playground</h2>
          <p className="text-muted-foreground text-lg">Test Lynxa Pro AI by Nexariq (AJ STUDIOZ) in real-time</p>
        </div>
        <EnhancedApiPlayground />
      </div>
    </div>
  );
}
