    "use client";

    import { useEffect, useState } from "react";
    import { useParams, useRouter } from "next/navigation";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { Badge } from "@/components/ui/badge";
    import { Button } from "@/components/ui/button";
    import { Separator } from "@/components/ui/separator";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { Skeleton } from "@/components/ui/skeleton";

    type Doc = {
    id: string;
    text?: string[];
    cleaned_text?: string[];
    sentiment?: string;
    reddit_score?: number;
    date?: string;
    source?: string;
    type?: string;
    keywords?: string[];
    entities?: string[];
    parent_id?: string;
    };

    export default function DocumentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [doc, setDoc] = useState<Doc | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isTextExpanded, setIsTextExpanded] = useState(false);
    const [isCleanedTextExpanded, setIsCleanedTextExpanded] = useState(false);

    useEffect(() => {
        const fetchDoc = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/document/${id}`);
            const data = await res.json();
            setDoc(data.doc);
        } catch {
            setError("Failed to fetch document.");
        }
        };

        if (id) fetchDoc();
    }, [id]);

    if (error) return <p className="text-red-600">{error}</p>;
    if (!doc)
        return (
        <div className="max-w-4xl mx-auto p-6">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-40 w-full" />
        </div>
        );

    const originalText = doc.text?.join(" ") || "";
    const cleanedText = doc.cleaned_text?.join(" ") || "";

    const truncateText = (text: string, expanded: boolean) =>
        expanded || text.length <= 500 ? text : text.slice(0, 500) + "...";
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl">
                Document ID: {doc.id} {doc.type && `(Reddit ${capitalize(doc.type)})`}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2 text-sm">
                {doc.source?.startsWith("r/") && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    Source: {doc.source}
                </Badge>
                )}

                {doc.reddit_score !== undefined && (
                <Badge variant="outline" className="bg-orange-200 text-orange-800">
                    Reddit Score: {doc.reddit_score}
                </Badge>
                )}

                {doc.sentiment && (
                <Badge
                    className={`text-white font-bold ${
                    doc.sentiment === "positive"
                        ? "bg-green-500"
                        : doc.sentiment === "negative"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                >
                    Sentiment: {capitalize(doc.sentiment)}
                </Badge>
                )}

                {doc.date && (
                <Badge variant="outline" className="text-gray-700">
                    Date: {new Date(doc.date).toLocaleDateString()}
                </Badge>
                )}

                {doc.parent_id && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Parent ID: {doc.parent_id}
                </Badge>
                )}
            </div>
            </CardHeader>

            <CardContent className="space-y-4">
            <div>
                <h2 className="font-semibold mb-1">Original Text</h2>
                {!isTextExpanded ? (
                    <ScrollArea className="bg-gray-100 rounded p-3 whitespace-pre-line max-h-[300px]">
                    {truncateText(originalText, false)}
                    </ScrollArea>
                ) : (
                    <div className="bg-gray-100 rounded p-3 whitespace-pre-line">
                    {originalText}
                    </div>
                )}
                {originalText.length > 500 && (
                    <Button
                    variant="link"
                    className="text-blue-600 text-sm px-0"
                    onClick={() => setIsTextExpanded((prev) => !prev)}
                    >
                    {isTextExpanded ? "Show less" : "Show more"}
                    </Button>
                )}
                </div>


            {cleanedText !== originalText && (
                <div>
                    <h2 className="font-semibold mb-1">Cleaned Text</h2>

                    {!isCleanedTextExpanded ? (
                    <ScrollArea className="bg-gray-50 rounded p-3 whitespace-pre-line max-h-[300px]">
                        {truncateText(cleanedText, false)}
                    </ScrollArea>
                    ) : (
                    <div className="bg-gray-50 rounded p-3 whitespace-pre-line">
                        {cleanedText}
                    </div>
                    )}

                    {cleanedText.length > 500 && (
                    <Button
                        variant="link"
                        className="text-blue-600 text-sm px-0"
                        onClick={() => setIsCleanedTextExpanded((prev) => !prev)}
                    >
                        {isCleanedTextExpanded ? "Show less" : "Show more"}
                    </Button>
                    )}
                </div>
            )}

            {(doc.keywords?.length ?? 0) > 0 && (
                <>
                <Separator />
                <div>
                    <h3 className="font-medium">Keywords:</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                    {doc.keywords!.map((kw, i) => (
                        <Badge key={i} variant="outline" className="bg-blue-100 text-blue-800">
                        {kw}
                        </Badge>
                    ))}
                    </div>
                </div>
                </>
            )}

            {(doc.entities?.length ?? 0) > 0 && (
                <>
                <Separator />
                <div>
                    <h3 className="font-medium">Entities:</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                    {doc.entities!.map((e, i) => (
                        <Badge key={i} variant="outline" className="bg-green-100 text-green-800">
                        {e}
                        </Badge>
                    ))}
                    </div>
                </div>
                </>
            )}

            <div className="pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                ← Back to Search Results
                </Button>
            </div>
            </CardContent>
        </Card>
        </div>
    );
    }