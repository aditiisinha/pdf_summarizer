import { cn } from "@/lib/utils";

function parsePoint(point: string) {
    const isNumbered = /^\d+\./.test(point);
    const isMainPoint = /^•/.test(point);

    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
    const hasEmoji = emojiRegex.test(point);
    const isEmpty = !point.trim();

    return { isNumbered, isMainPoint, hasEmoji, isEmpty };
}

function parseEmojiPoint(content: string) {
    // Remove both the bullet and potential leading spaces
    const cleanContent = content.startsWith('•') ? content.substring(1).trim() : content.trim();
    const matches = cleanContent.match(/^(\p{Emoji}+)(.+)$/u);

    if (!matches) {
        return { emoji: '•', text: cleanContent };
    }

    const [_, emoji, text] = matches;
    return {
        emoji: emoji.trim(),
        text: text.trim(),
    };
}

const EmojiPoint = ({ point, index }: { point: string, index: number }) => {
    const { emoji, text } = parseEmojiPoint(point);
    const isStandardBullet = emoji === '•';

    return (
        <div key={`point-${index}`} className="flex items-start gap-3 pl-2 group">
            <span className={cn(
                "shrink-0 transition-transform group-hover:scale-110",
                isStandardBullet ? "text-rose-400/60 mt-1.5 text-xs" : "text-xl mt-0.5"
            )}>
                {emoji}
            </span>
            <p className="text-base text-muted-foreground/90 leading-relaxed flex-1">
                {text}
            </p>
        </div>
    );
}

const RegularPoint = ({ point, index }: { point: string, index: number }) => {
    // Clean potential bullet from content
    const cleanText = point.startsWith('•') ? point.substring(1).trim() : point.trim();

    return (
        <div
            key={`point-${index}`}
            className="group relative bg-white/[0.03] p-4 rounded-2xl border border-white/10
                    hover:border-rose-400/30 hover:bg-white/[0.05]
                    transition-all duration-300 shadow-sm"
        >
            <div className="absolute inset-0 bg-gradient-to-br 
                    from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300 rounded-2xl" />

            <div className="relative flex items-start gap-3">
                <span className="text-rose-400/60 mt-1.5 shrink-0 text-xs">
                    •
                </span>
                <p className="text-base text-muted-foreground/90 leading-relaxed">
                    {cleanText}
                </p>
            </div>
        </div>
    );
}

export default function ContentSection({
    title,
    points
}: {
    title: string;
    points: string[]
}) {
    return (
        <div className="space-y-4">
            {points.map((point, index) => {
                const { isMainPoint, hasEmoji, isEmpty } = parsePoint(point);

                if (isEmpty) return null;

                if (hasEmoji || isMainPoint) {
                    return (
                        <EmojiPoint
                            key={`point-${index}`}
                            point={point}
                            index={index}
                        />
                    );
                }

                return (
                    <RegularPoint
                        key={`point-${index}`}
                        point={point}
                        index={index}
                    />
                );
            })}
        </div>
    );
}