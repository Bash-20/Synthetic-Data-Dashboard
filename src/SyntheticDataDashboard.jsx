
import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toPng } from "html-to-image";

const Card = ({ children, className = "" }) => (
  <div className={`border rounded-2xl p-4 shadow ${className}`}>{children}</div>
);
const CardContent = ({ children }) => <div>{children}</div>;
const Button = ({ children, onClick }) => (
  <button onClick={onClick} className="p-2 bg-blue-500 text-white rounded">{children}</button>
);

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const generateSyntheticData = () => {
  const data = [];
  for (let i = 0; i < 12; i++) {
    data.push({
      month: monthNames[i],
      realAccuracy: 0.8 + Math.random() * 0.1,
      syntheticAccuracy: 0.85 + Math.random() * 0.05,
      threatsDetected: Math.floor(Math.random() * 100),
    });
  }
  return data;
};

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [selectedRange, setSelectedRange] = useState(monthNames);

  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {
    setData(generateSyntheticData());
  }, []);

  const downloadCSV = (data) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]));
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "synthetic_data.csv";
    link.click();
  };

  const exportChart = (ref, filename) => {
    if (ref.current === null) return;
    toPng(ref.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Export failed", err);
      });
  };

  const filteredData = data.filter((d) => selectedRange.includes(d.month));

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      <div className="col-span-2 flex items-center justify-between mb-4">
        <img src="/logo.png" alt="Logo" className="h-12" />
        <h1 className="text-2xl font-bold">Synthetic Data Dashboard</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 items-center col-span-2">
        <label className="font-medium mr-2">Select Months:</label>
        {monthNames.map((month, index) => (
          <label key={index} className="flex items-center space-x-1">
            <input
              type="checkbox"
              value={month}
              checked={selectedRange.includes(month)}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedRange((prev) =>
                  prev.includes(value)
                    ? prev.filter((m) => m !== value)
                    : [...prev, value]
                );
              }}
            />
            <span>{month}</span>
          </label>
        ))}
      </div>

      <Card className="col-span-2">
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Threat Detection Over Time</h2>
            <Button onClick={() => exportChart(lineChartRef, "threats.png")}>
              Export PNG
            </Button>
          </div>
          <div ref={lineChartRef}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="threatsDetected" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Real vs Synthetic Data Accuracy</h2>
            <Button onClick={() => exportChart(barChartRef, "accuracy.png")}>
              Export PNG
            </Button>
          </div>
          <div ref={barChartRef}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filteredData}>
                <XAxis dataKey="month" />
                <YAxis domain={[0.7, 1]} />
                <Tooltip />
                <Bar dataKey="realAccuracy" fill="#82ca9d" name="Real Data" />
                <Bar dataKey="syntheticAccuracy" fill="#8884d8" name="Synthetic Data" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">Key Performance Indicators</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-2xl shadow">Accuracy: 91%</div>
            <div className="bg-gray-100 p-4 rounded-2xl shadow">F1-Score: 0.88</div>
            <div className="bg-gray-100 p-4 rounded-2xl shadow">Privacy Risk: Low</div>
            <div className="bg-green-200 p-4 rounded-2xl shadow">GDPR: Compliant</div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 text-center">
        <CardContent>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setData(generateSyntheticData())}>
              Regenerate Synthetic Data
            </Button>
            <Button onClick={() => downloadCSV(data)}>
              Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
