"use client";

import { useState, useEffect } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from "recharts";

export default function EcoFontMonitorDashboard() {
  const initialForm = {
    month: "",
    week: "",
    water: "0",
    energy: "0",
    ph: "0",
  };

  const [formData, setFormData] = useState(initialForm);

  const [maintenanceDays, setMaintenanceDays] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ecoFontMaintenanceDays");

      return saved ? JSON.parse(saved) : 150;
    }

    return 150;
  });

  const [tempMaintenance, setTempMaintenance] = useState(maintenanceDays);

  const [editingMaintenance, setEditingMaintenance] = useState(false);

  const [dashboardData, setDashboardData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ecoFontDashboardData");

      return saved
        ? JSON.parse(saved)
        : {
            water: 0,
            energy: 0,
            ph: 0,
          };
    }

    return {
      water: 0,
      energy: 0,
      ph: 0,
    };
  });

  const [weeklyHistory, setWeeklyHistory] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ecoFontWeeklyHistory");

      return saved ? JSON.parse(saved) : [];
    }

    return [];
  });

  const [editingIndex, setEditingIndex] = useState(null);

  /* =========================
     DATA E HORÁRIO
  ========================== */

  const getCurrentDateTime = () => {
    return new Date().toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  /* =========================
     CARREGAR DADOS SALVOS
  ========================== */

  useEffect(() => {
    const savedDashboard = localStorage.getItem("ecoFontDashboardData");

    const savedHistory = localStorage.getItem("ecoFontWeeklyHistory");

    const savedMaintenance = localStorage.getItem("ecoFontMaintenanceDays");

    if (savedDashboard) {
      setDashboardData(JSON.parse(savedDashboard));
    }

    if (savedHistory) {
      setWeeklyHistory(JSON.parse(savedHistory));
    }

    if (savedMaintenance) {
      setMaintenanceDays(JSON.parse(savedMaintenance));
      setTempMaintenance(JSON.parse(savedMaintenance));
    }
  }, []);

  /* =========================
     SALVAR DADOS AUTOMATICAMENTE
  ========================== */

  useEffect(() => {
    localStorage.setItem("ecoFontDashboardData", JSON.stringify(dashboardData));
  }, [dashboardData]);

  useEffect(() => {
    localStorage.setItem("ecoFontWeeklyHistory", JSON.stringify(weeklyHistory));
  }, [weeklyHistory]);

  useEffect(() => {
    localStorage.setItem(
      "ecoFontMaintenanceDays",
      JSON.stringify(maintenanceDays),
    );
  }, [maintenanceDays]);

  const handleSave = () => {
    if (!formData.week || !formData.month) {
      alert("Selecione o mês e a semana.");
      return;
    }

    const existingWeek = weeklyHistory.findIndex(
      (item) => item.week === formData.week && item.month === formData.month,
    );

    const newData = {
      month: formData.month,
      week: formData.week,
      water: Number(formData.water || 0),
      energy: Number(formData.energy || 0),
      ph: Number(formData.ph || 0),
      createdAt: getCurrentDateTime(),
    };

    if (editingIndex !== null) {
      const updated = [...weeklyHistory];

      updated[editingIndex] = {
        ...newData,
        updatedAt: getCurrentDateTime(),
      };

      setWeeklyHistory(updated);

      setEditingIndex(null);
    } else {
      if (existingWeek !== -1) {
        alert("Já existe um registro para essa semana neste mês.");
        return;
      }

      setWeeklyHistory([...weeklyHistory, newData]);
    }

    setDashboardData({
      water: newData.water,
      energy: newData.energy,
      ph: newData.ph,
    });
  };

  const handleEdit = (index) => {
    const item = weeklyHistory[index];

    setFormData({
      month: item.month,
      week: item.week,
      water: item.water,
      energy: item.energy,
      ph: item.ph,
    });

    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updated = weeklyHistory.filter((_, i) => i !== index);

    setWeeklyHistory(updated);
  };

  const handleSelectHistory = (item) => {
    setDashboardData({
      water: item.water,
      energy: item.energy,
      ph: item.ph,
    });
  };

  const resetForm = () => {
    setFormData({
      month: "",
      week: "",
      water: "0",
      energy: "0",
      ph: "0",
    });

    setEditingIndex(null);
  };

  const confirmMaintenance = () => {
    setMaintenanceDays(tempMaintenance);

    setEditingMaintenance(false);
  };

  const getBarColor = (value) => {
    if (value > 400) return "#ef4444";

    if (value >= 300) return "#facc15";

    return "#2563eb";
  };

  const waterColor =
    dashboardData.water > 400 ? "text-red-600" : "text-green-600";

  const energyColor =
    dashboardData.energy > 3 ? "text-red-600" : "text-green-600";

  const phColor = dashboardData.ph < 6 ? "text-red-600" : "text-green-600";

  const maintenanceColor =
    maintenanceDays <= 30 ? "text-red-600" : "text-green-600";

  const getSystemStatus = () => {
    if (dashboardData.ph < 6) {
      return {
        text: "⚠ Qualidade da água inadequada",
        color: "text-red-600",
      };
    }

    if (dashboardData.water > 400) {
      return {
        text: "⚠ Consumo de água acima do ideal",
        color: "text-red-600",
      };
    }

    if (dashboardData.energy > 3) {
      return {
        text: "⚠ Consumo energético acima do ideal",
        color: "text-red-600",
      };
    }

    if (maintenanceDays <= 30) {
      return {
        text: "⚠ Manutenção preventiva próxima",
        color: "text-orange-500",
      };
    }

    return {
      text: "Funcionando normalmente",
      color: "text-green-600",
    };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Monitorador de Chafariz
              </h1>

              <p className="text-gray-600 mt-1">
                Sistema de Monitoramento Sustentável do Chafariz - Shopping
                Quintino
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

              <span className="text-sm text-gray-700 font-medium">
                Sistema ativo
              </span>
            </div>
          </div>
        </div>

        {/* ALERTAS */}
        <div className="space-y-4">
          {dashboardData.ph < 6 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="font-medium text-red-700">
                ⚠ Qualidade da água inadequada.
              </p>
            </div>
          )}

          {dashboardData.energy > 3 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <p className="font-medium text-orange-700">
                ⚠ Consumo energético acima do ideal.
              </p>
            </div>
          )}

          {dashboardData.water > 400 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="font-medium text-red-700">
                ⚠ Consumo de água acima do ideal.
              </p>
            </div>
          )}

          {maintenanceDays <= 30 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="font-medium text-yellow-700">
                ⚠ Manutenção preventiva próxima.
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="font-medium text-blue-700">
              ℹ Sistema preparado para integração com sensores IoT.
            </p>
          </div>
        </div>

        {/* PAINEL */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Painel de Controle</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Mês</label>

              <select
                value={formData.month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    month: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              >
                <option value="">Selecione</option>
                <option>Janeiro</option>
                <option>Fevereiro</option>
                <option>Março</option>
                <option>Abril</option>
                <option>Maio</option>
                <option>Junho</option>
                <option>Julho</option>
                <option>Agosto</option>
                <option>Setembro</option>
                <option>Outubro</option>
                <option>Novembro</option>
                <option>Dezembro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Semana</label>

              <select
                value={formData.week}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    week: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              >
                <option value="">Selecione</option>
                <option>Semana 1</option>
                <option>Semana 2</option>
                <option>Semana 3</option>
                <option>Semana 4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Consumo de Água (L)
              </label>

              <input
                type="number"
                value={formData.water}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    water: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              />
              <p className="text-xs text-gray-500 mt-2">Ideal: 200L - 300L</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Energia (kWh)
              </label>

              <input
                type="number"
                step="0.1"
                value={formData.energy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    energy: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              />
              <p className="text-xs text-gray-500 mt-2">Ideal: até 3 kWh</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">pH</label>

              <input
                type="number"
                step="0.1"
                value={formData.ph}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ph: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-3"
              />
              <p className="text-xs text-gray-500 mt-2">
                Ideal: pH entre 6 e 8
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="bg-black text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90 transition"
            >
              {editingIndex !== null
                ? "Salvar Edição"
                : "Confirmar Informações"}
            </button>

            <button
              onClick={resetForm}
              className="bg-gray-300 text-black px-6 py-3 rounded-2xl font-medium hover:bg-gray-400 transition"
            >
              Limpar Campos
            </button>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Status do Chafariz
            </p>

            <h2 className={`text-2xl font-bold mt-3 ${systemStatus.color}`}>
              {systemStatus.text}
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Consumo de Água
            </p>

            <h2 className={`text-4xl font-bold mt-3 ${waterColor}`}>
              {dashboardData.water}L
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Consumo Energético
            </p>

            <h2 className={`text-4xl font-bold mt-3 ${energyColor}`}>
              {dashboardData.energy} kWh
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Qualidade da Água
            </p>

            <h2 className={`text-4xl font-bold mt-3 ${phColor}`}>
              pH {dashboardData.ph}
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Manutenção Preventiva
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingMaintenance(true);
                    setTempMaintenance(maintenanceDays);
                  }}
                  className="text-gray-500 hover:text-black hover:scale-110 transition duration-200"
                >
                  ✏️
                </button>

                {editingMaintenance && (
                  <button
                    onClick={confirmMaintenance}
                    className="text-green-600 hover:scale-125 transition duration-200"
                  >
                    ✅
                  </button>
                )}
              </div>
            </div>

            {editingMaintenance ? (
              <input
                type="number"
                value={tempMaintenance}
                onChange={(e) => setTempMaintenance(Number(e.target.value))}
                className="mt-4 w-full border rounded-xl p-3"
              />
            ) : (
              <h2 className={`text-4xl font-bold mt-3 ${maintenanceColor}`}>
                {maintenanceDays} dias
              </h2>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Tempo de Funcionamento
            </p>

            <h2 className="text-4xl font-bold text-black mt-3">15h</h2>

            <p className="text-gray-600 font-medium mt-2">
              Funcionamento contínuo
            </p>
          </div>
        </div>

        {/* GRÁFICOS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-6">Consumo de Água</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyHistory}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="week" />

                <YAxis domain={[0, 500]} />

                <Tooltip />

                <Bar dataKey="water" radius={[10, 10, 0, 0]}>
                  {weeklyHistory.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.water)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-6">Consumo Energético</h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyHistory}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="week" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-2xl font-bold mb-6">Histórico Semanal</h3>

          <div className="space-y-4">
            {weeklyHistory.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectHistory(item)}
                className="border rounded-2xl p-4 cursor-pointer hover:bg-gray-50 transition flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Período</p>

                    <p className="font-semibold">
                      {item.week} - {item.month}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Água</p>

                    <p className="font-semibold">{item.water}L</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Energia</p>

                    <p className="font-semibold">{item.energy} kWh</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">pH</p>

                    <p className="font-semibold">{item.ph}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Criado em</p>

                    <p className="font-semibold">{item.createdAt}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Alterado em</p>

                    <p className="font-semibold">{item.updatedAt || "-"}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(index);
                    }}
                    className="bg-yellow-400 px-4 py-2 rounded-xl font-medium hover:scale-105 transition"
                  >
                    Editar
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:scale-105 transition"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
