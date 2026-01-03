export default function SummaryViewer({ summary }: { summary: string }) {
    return (
        <div className="w-full max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {summary}
        </div>
    );
}