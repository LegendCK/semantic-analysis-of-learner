import React from "react";
import { useHistoryStore } from "../store/history";

const History = () => {
  const { items } = useHistoryStore();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Query History</h1>
      {items.length === 0 ? (
        <p>No previous queries found.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="p-4 border rounded-md shadow-sm">
              <p>
                <span className="font-semibold">Question:</span> {item.question}
              </p>
              <p>
                <span className="font-semibold">Matched Concept:</span>{" "}
                {item.matchedConcept}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;
