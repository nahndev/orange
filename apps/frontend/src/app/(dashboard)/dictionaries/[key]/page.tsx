interface DictionaryDetailPageProps {
  params: { key: string };
}

export default function DictionaryDetailPage({ params }: DictionaryDetailPageProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold text-slate-900">{params.key}</h1>
      <p className="text-sm text-slate-500">Dictionary management for &ldquo;{params.key}&rdquo; is coming soon.</p>
    </div>
  );
}
