import D3 from "./3D";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <D3 />
      </div>
    </main>
  );
}
