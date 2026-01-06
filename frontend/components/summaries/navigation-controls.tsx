import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationControlsProps {
    current: number;
    total: number;
    onNext: () => void;
    onPrevious: () => void;
    onSectionSelect: (index: number) => void;
}

export function NavigationControls({
    current,
    total,
    onNext,
    onPrevious,
    onSectionSelect,
}: NavigationControlsProps) {
    return (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-rose-100">
            <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                disabled={current === 0}
                className="h-10 w-10 min-w-10 rounded-full bg-rose-500 text-white hover:bg-rose-600 hover:text-white disabled:bg-rose-200 disabled:text-white/50"
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="flex  gap-2">
                {
                    Array.from({ length: total }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onSectionSelect(index)}
                            className={cn(
                                'w-2 h-2 rounded-full transition-all duration-300 p-0 flex-shrink-0',
                                current === index
                                    ? 'bg-rose-600 scale-110'
                                    : 'bg-rose-200 hover:bg-rose-300'
                            )}
                        />
                    ))}

            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                disabled={current === total - 1}
                className="h-10 w-10 min-w-10 rounded-full bg-rose-500 text-white hover:bg-rose-600 hover:text-white disabled:bg-rose-200 disabled:text-white/50"
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
        </div>
    );
}