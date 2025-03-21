import { Suspense } from "react";
import { v4 as uuidv4 } from "uuid";
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
