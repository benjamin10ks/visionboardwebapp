import { Suspense } from "react";
import DesignEditor from "@/app/design-editor";

export default function Home() {
  return (
    <main className="w-full h-screen">
      <Suspense fallback={<div>Loading editor...</div>}>
        <DesignEditor />
      </Suspense>
    </main>
  );
}
