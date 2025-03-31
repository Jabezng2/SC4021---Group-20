import { Suspense } from "react";
import SearchResults from "./SearchResults";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}