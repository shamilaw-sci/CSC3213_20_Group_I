import ComparisonDetail from "./view";

export default async function ComparisonPage({ params }: { params: Promise<{ comparisonId: string }> }) {
  const { comparisonId } = await params;
  return <ComparisonDetail comparisonId={comparisonId} />;
}
