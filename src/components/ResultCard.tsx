type Props = { concept: string };
export default function ResultCard({ concept }: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-6 text-center">
      <h2 className="text-xl font-semibold text-gray-800">Detected Concept:</h2>
      <p className="mt-2 text-blue-600 text-lg font-bold">{concept}</p>
    </div>
  );
}
