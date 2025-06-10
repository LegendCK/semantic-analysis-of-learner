import QueryInput from "../components/QueryInput";

export default function Home() {
  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-center text-3xl font-bold text-blue-700 mt-10">
        Recommendation Learning System
      </h1>
      <QueryInput />
    </div>
  );
}
