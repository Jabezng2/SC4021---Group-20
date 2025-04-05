// app/document/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type DocData = {
  id: string;
  text?: string;
  title?: string;
  platform?: string;
  sentiment?: string;
  cleaned_text?: string;
  // Add other fields as needed
};

export default function DocumentPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState<DocData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDoc = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/document/${id}`);
        const data = await res.json();
        setDoc(data.doc);
      } catch (err) {
        setError("Failed to fetch document.");
      }
    };

    fetchDoc();
  }, [id]);

  if (!id) return <p>No document ID provided.</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!doc) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {doc.title || `Document ID: ${doc.id}`}
      </h1>
      <div className="space-y-2">
        <p className="text-gray-700 whitespace-pre-line">{doc.text}</p>

        {doc.cleaned_text && (
          <>
            <h2 className="text-lg font-semibold mt-4">Cleaned Text</h2>
            <p className="text-gray-600 whitespace-pre-line">{doc.cleaned_text}</p>
          </>
        )}

        {doc.platform && (
          <p>
            <strong>Platform:</strong> {doc.platform}
          </p>
        )}

        {doc.sentiment && (
          <p>
            <strong>Sentiment:</strong> {doc.sentiment}
          </p>
        )}
      </div>
    </div>
  );
}
