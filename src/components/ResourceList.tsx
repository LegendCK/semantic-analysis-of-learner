import { useQueryStore } from "../store/queryStore";

export default function ResourceList() {
  const resources = useQueryStore((s) => s.resources);

  return (
    <div className="mt-6 grid gap-4">
      <h3 className="text-lg font-semibold">Recommended Resources:</h3>
      {resources.map((r) => (
        <a
          key={r.id}
          href={r.url}
          target="_blank"
          className="block bg-gray-100 p-4 rounded-md hover:bg-gray-200"
        >
          <strong>{r.title}</strong> <span className="text-sm">({r.type})</span>
        </a>
      ))}
    </div>
  );
}
