"use client";

import { useEffect, useState } from "react";

type Plant = {
  id: string;
  name: string;
  species: string;
  last_watered: string | null;
  created_at: string;
};

function getFilteredSortedPlants(
  plants: Plant[],
  search: string,
  sortOrder: "asc" | "desc"
) {
  return plants
    .filter((plant) => {
      const term = search.toLowerCase();
      return (
        plant.name.toLowerCase().includes(term) ||
        (plant.species || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (!a.last_watered) return 1;
      if (!b.last_watered) return -1;
      const dateA = new Date(a.last_watered);
      const dateB = new Date(b.last_watered);
      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
}

export default function Home() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; species: string }>({
    name: "",
    species: "",
  });

  useEffect(() => {
    const fetchPlants = async () => {
      const res = await fetch("/api/plants");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlants(data);
      } else {
        console.error("API did not return an array:", data);
      }
    };

    fetchPlants();
  }, []);

  const filteredPlants = getFilteredSortedPlants(plants, search, sortOrder);

  const handleAddPlant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const species = (form.elements.namedItem("species") as HTMLInputElement)
      .value;

    const res = await fetch("/api/plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, species }),
    });

    if (res.ok) {
      form.reset();
      const res = await fetch("/api/plants");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlants(data);
      } else {
        console.error("API did not return an array:", data);
        setPlants([]); // fallback to empty array to prevent crash
      }
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🌱 My Plants</h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or species"
        className="mb-6 w-full p-2 border rounded"
      />

      {/* Sort */}
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="sort" className="text-sm text-gray-600">
          Sort by last watered:
        </label>
        <select
          id="sort"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="p-1 border rounded text-sm"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Add */}
      <form onSubmit={handleAddPlant} className="mb-6 space-y-2">
        <input
          name="name"
          placeholder="Plant name"
          required
          className="block w-full p-2 border rounded"
        />
        <input
          name="species"
          placeholder="Species (optional)"
          className="block w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Plant
        </button>
      </form>

      {/* Plant Cards */}
      <div className="space-y-4">
        {filteredPlants.length > 0 ? (
          filteredPlants.map((plant) => (
            <div
              key={plant.id}
              className="p-4 border rounded shadow-sm bg-white"
            >
              {editId === plant.id ? (
                <>
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="block w-full mb-2 p-2 border rounded"
                  />
                  <input
                    value={editForm.species}
                    onChange={(e) =>
                      setEditForm({ ...editForm, species: e.target.value })
                    }
                    className="block w-full mb-2 p-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await fetch(`/api/plants/${plant.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(editForm),
                        });
                        setEditId(null);
                        const data = await fetch("/api/plants").then((res) =>
                          res.json()
                        );
                        setPlants(data);
                      }}
                      className="px-4 py-1 bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-4 py-1 bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{plant.name}</h2>
                  <p className="text-gray-600">
                    {plant.species || "Unknown species"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last watered: {plant.last_watered || "Never"}
                  </p>
                  <div className="flex gap-2 flex-wrap mt-2">
                    <button
                      onClick={async () => {
                        await fetch(`/api/plants/${plant.id}/water`, {
                          method: "PATCH",
                        });
                        const data = await fetch("/api/plants").then((res) =>
                          res.json()
                        );
                        setPlants(data);
                      }}
                      className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Watered Today 💧
                    </button>
                    <button
                      onClick={() => {
                        setEditId(plant.id);
                        setEditForm({
                          name: plant.name,
                          species: plant.species || "",
                        });
                      }}
                      className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit ✏️
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = confirm(`Delete "${plant.name}"?`);
                        if (!confirmed) return;
                        await fetch(`/api/plants/${plant.id}`, {
                          method: "DELETE",
                        });
                        const data = await fetch("/api/plants").then((res) =>
                          res.json()
                        );
                        setPlants(data);
                      }}
                      className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No matching plants found.</p>
        )}
      </div>
    </main>
  );
}
