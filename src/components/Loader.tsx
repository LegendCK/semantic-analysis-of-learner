export default function Loader() {
  return (
    <div className="flex justify-center items-center mt-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      <span className="ml-2 text-blue-600">Analyzing your query...</span>
    </div>
  );
}
