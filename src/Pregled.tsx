import React, { useState, useEffect } from "react";
import { Calendar, Package, Users, Clock, Search } from "lucide-react";
import { Button } from "./components/ui/button";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker, { registerLocale } from "react-datepicker";
import { srLatn } from "date-fns/locale"; // Serbian Latin

interface Vezivac {
  id: number;
  ime: string;
  smena: number;
  koture: number;
}

interface Smena {
  vezivaci: Vezivac[];
  ukupnoKotura: number;
}

interface Dan {
  datum: string; // "YYYY-MM-DD"
  smene: {
    "1": Smena;
    "2": Smena;
    "3": Smena;
  };
  ukupnoDan: number;
}

interface PregledResponse {
  period: string; // "YYYY-MM-DD - YYYY-MM-DD"
  ukupnoKotura: number;
  dani: Dan[];
}

const Pregled = ({ handlePrikaziPregled }: {handlePrikaziPregled: any}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  registerLocale("srLatn", srLatn);

  const generateMockData = (start, end) => {
    const vezivaci = [
      { id: 1, ime: "Marko Petrović", smena: 1 },
      { id: 2, ime: "Ana Jovanović", smena: 1 },
      { id: 3, ime: "Stefan Nikolić", smena: 2 },
      { id: 4, ime: "Milica Stojanović", smena: 2 },
      { id: 5, ime: "Đorđe Milenković", smena: 3 },
      { id: 6, ime: "Jovana Radić", smena: 3 },
    ];

    // Generisanje datuma između početnog i krajnjeg
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const dates = [];

    for (
      let d = new Date(startDateObj);
      d <= endDateObj;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(new Date(d));
    }

    const daniPodaci = dates.map((datum) => {
      const smene = {};

      [1, 2, 3].forEach((smenaNum) => {
        const vezivacismene = vezivaci.filter((v) => v.smena === smenaNum);
        const vezivacipodaci = vezivacismene.map((vezivac) => ({
          ...vezivac,
          koture: Math.floor(Math.random() * 30) + 10, // 10-40 kotura po vezivcu
        }));

        smene[smenaNum] = {
          vezivaci: vezivacipodaci,
          ukupnoKotura: vezivacipodaci.reduce((sum, v) => sum + v.koture, 0),
        };
      });

      return {
        datum: datum.toISOString().split("T")[0],
        smene: smene,
        ukupnoDan: Object.values(smene).reduce(
          (sum, s) => sum + s.ukupnoKotura,
          0
        ),
      };
    });

    const ukupnoKotura = daniPodaci.reduce(
      (sum, dan) => sum + dan.ukupnoDan,
      0
    );

    return {
      period: `${start} - ${end}`,
      ukupnoKotura: ukupnoKotura,
      dani: daniPodaci,
    };
  };

  const handleSearch = () => {
    if (!startDate || !endDate) {
      alert("Molimo unesite i početni i krajnji datum");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Početni datum mora biti pre krajnjeg datuma");
      return;
    }

    setLoading(true);

    // Simulacija API poziva
    setTimeout(() => {
      // Konvertovanje Date objekata u string format za generateMockData
      const startStr = startDate.toISOString().split("T")[0];
      const endStr = endDate.toISOString().split("T")[0];
      const mockData = generateMockData(startStr, endStr);
      setData(mockData);
      setLoading(false);
    }, 1000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSmenaTime = (smena) => {
    const times = {
      1: "06:30 - 14:30",
      2: "14:30 - 22:30",
      3: "22:30 - 06:30",
    };
    return times[smena];
  };

  return (
    <div className="max-w mx-auto px-20 py-8 bg-gradient-to-b from-gray-800 to-green-400/60 min-h-screen">
      <div className="bg-gray-100 rounded-lg shadow-md p-6 mb-6">
        <Button
          className="bg-green-600 border-2 mb-2"
          onClick={handlePrikaziPregled}
        >
          Nazad
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Package className="mr-3 text-blue-600" />
          Pregled Spakovanih Kotura po Smenama
        </h1>

        {/* Forma za odabir datuma */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Početni datum
            </label>
            <div lang="sr" className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <DatePicker
                maxDate={new Date()}
                selected={startDate ? new Date(startDate) : null}
                onChange={(date) => setStartDate(date)}
                locale="srLatn"
                dateFormat="dd.MM.yyyy"
                placeholderText="Izaberite početni datum"
                className="w-full cursor-pointer pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Krajnji datum
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <DatePicker
                minDate={startDate ? new Date(startDate) : null}
                maxDate={new Date()}
                selected={endDate ? new Date(endDate) : null}
                onChange={(date) => setEndDate(date)}
                locale="srLatn"
                dateFormat="dd.MM.yyyy"
                placeholderText="Izaberite krajnji datum"
                className="w-full cursor-pointer pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-800 cursor-pointer disabled:bg-blue-300 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="mr-2 w-4 h-4" />
                  Prikaži
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Prikaz rezultata */}
      {data && (
        <div className="space-y-6">
          {/* Ukupan pregled */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Ukupan pregled za period: {formatDate(startDate)} -{" "}
              {formatDate(endDate)}
            </h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {data?.ukupnoKotura}
                </div>
                <div className="text-gray-600">
                  Ukupno spakovanih kotura za period
                </div>
              </div>
            </div>
          </div>

          {/* Prikaz po danima */}
          {data?.dani?.map((dan, index) => (
            <div key={dan.datum} className="bg-white rounded-lg shadow-md p-6">
              <div className="border-l-4 border-blue-500 pl-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {formatDate(dan.datum)} -{" "}
                  {new Date(dan.datum).toLocaleDateString("sr-RS", {
                    weekday: "long",
                  })}
                </h2>
                <p className="text-gray-600">
                  Ukupno za dan:{" "}
                  <span className="font-semibold text-blue-600">
                    {dan.ukupnoDan} kotura
                  </span>
                </p>
              </div>

              {/* Smene za taj dan */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(dan.smene).map(([smenaNum, smenaData]) => (
                  <div
                    key={`${dan.datum}-${smenaNum}`}
                    className="bg-gray-50 rounded-lg p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Clock className="mr-2 text-green-600 w-5 h-5" />
                        Smena {smenaNum}
                      </h3>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                        {getSmenaTime(parseInt(smenaNum))}
                      </span>
                    </div>

                    {/* Ukupno za smenu */}
                    <div className="bg-green-100 rounded-md p-3 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-700">
                          {smenaData.ukupnoKotura}
                        </div>
                        <div className="text-sm text-gray-600">
                          ukupno kotura
                        </div>
                      </div>
                    </div>

                    {/* Vezivači sa individualnim brojevima */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <Users className="mr-2 w-4 h-4" />
                        Vezivači ({smenaData.vezivaci.length})
                      </h4>
                      {smenaData.vezivaci.map((vezivac) => (
                        <div
                          key={`${dan.datum}-${vezivac.id}`}
                          className="bg-white rounded-md p-3 border-l-3 border-green-400"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-800 text-sm">
                                {vezivac.ime}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {vezivac.koture}
                              </div>
                              <div className="text-xs text-gray-500">
                                kotura
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Početno stanje */}
      {!data && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Odaberite period za pregled
          </h3>
          <p className="text-gray-500">
            Unesite početni i krajnji datum da biste videli pregled spakovanih
            kotura po smenama
          </p>
        </div>
      )}
    </div>
  );
};

export default Pregled;
