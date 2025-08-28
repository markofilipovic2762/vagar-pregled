"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageCheck } from "lucide-react";

interface Kotur {
  proizvod: string;
  mbr: string;
  datum: string;
  vezivac: string;
}

const api = "http://10.21.22.254:8087";

export default function App() {
  const [koturi, setKoturi] = useState<Kotur[]>([]);
  const [newCoilIds, setNewCoilIds] = useState<string[]>([]);
  const prevKoturi = useRef<Kotur[]>([]); // <-- koristi useRef

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchKoturi = async () => {
      const koturiResponse = await fetch(`${api}/spakovani_koturi`);
      const koturiData = await koturiResponse.json();

      // Detekcija novih kotura
      const prevIds = new Set(prevKoturi.current.map((k: Kotur) => k.proizvod));
      const newIds = koturiData
        .filter((k: Kotur) => !prevIds.has(k.proizvod))
        .map((k: Kotur) => k.proizvod);

      setNewCoilIds(newIds);
      setKoturi(koturiData);
      prevKoturi.current = koturiData; // <-- update samo ovde
    };

    fetchKoturi();
    intervalId = setInterval(fetchKoturi, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const sortedCoils = [...koturi].sort((a, b) => {
    if (a.datum && b.datum) {
      return new Date(b.datum).getTime() - new Date(a.datum).getTime();
    }
    return 0;
  });

  return (
    <div className="flex flex-col bg-gradient-to-b from-gray-800 to-green-400/60">
      <div className="max-w-7xl mx-auto w-full ">
        <div className="my-4 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-200 mb-2">
            Pregled spakovanih kotura{" "}
            {new Date().toLocaleDateString("sr-Latn-RS", { weekday: "long" })}{" "}
            {new Date().toLocaleDateString("sr-RS")}{" "}
          </h1>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pt-6 pb-[260px] min-h-3/5">
          {/* ...koturi cards... */}
          {sortedCoils.map((coil) => (
            <Card
              key={coil.proizvod}
              className={
                "transition-all duration-1000 justify-center ease-in-out transform hover:bg-green-200 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" +
                (newCoilIds.includes(coil.proizvod)
                  ? " animate-pulse-once"
                  : "")
              }
            >
              {/* ...card content... */}
              <CardHeader>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex gap-4">
                    <PackageCheck className="h-7 w-7 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
                      Kotur {coil.proizvod}
                    </CardTitle>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold text-2xl">
                      Spakovan u {coil.datum.substring(11)}
                    </span>
                  </div>
                  <div className="text-2xl text-gray-500 font-semibold">
                    Spakovao/la:{" "}
                    <span className="text-green-600 font-semibold text-2xl">
                      {coil.vezivac}
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Fiksiran donji deo */}
      <div
        className="fixed bottom-0 left-0 w-full z-10 bg-gradient-to-b from-gray-800/95 to-green-400/95"
        // style={{
        //   background: "linear-gradient(90deg, #1e293b 0%, #334155 50%, #22d3ee 100%)",
        // }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ...statistika cards... */}
            <Card className="bg-gray-700/80 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Statistika:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ukupno kotura danas:</span>
                    <span className="font-semibold text-white">
                      {koturi.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700/80 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Poslednje spakovano
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const lastPacked = koturi.sort(
                    (a, b) =>
                      new Date(b.datum).getTime() - new Date(a.datum).getTime()
                  )[0];

                  return lastPacked ? (
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-white">
                        Kotur: {lastPacked.proizvod}
                      </p>
                      <p className="text-sm text-gray-300">
                        {lastPacked.datum}
                      </p>
                      {lastPacked.vezivac && (
                        <p className="text-sm text-green-400">
                          Spakovao: {lastPacked.vezivac}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">Nema spakovanih kotura</p>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="bg-gray-700/80 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Broj spakovanih kotura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="">
                  {Object.entries(
                    koturi.reduce<Record<string, number>>((acc, curr) => {
                      const key = curr.vezivac || "Nepoznato";
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([vezivac, count]) => (
                    <>
                      <div key={vezivac} className="flex justify-between gap-6">
                        <span className="text-gray-300">{vezivac}</span>

                        <span className="font-semibold text-white">
                          {count}
                        </span>
                      </div>
                      <hr className="border-gray-600" />
                    </>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
