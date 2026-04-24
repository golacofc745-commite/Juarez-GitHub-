"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, TrendingUp, Target, Calendar, BarChart3 } from "lucide-react"

interface IndicatorData {
  mediaAtual: string
  mediaNecessaria: string
}

interface FormData {
  diasUteis: string
  diaAtual: string
  af: IndicatorData
  seguro: IndicatorData
  emprestimo: IndicatorData
  venda: IndicatorData
}

const STORAGE_KEY = "juarez-check-data"

const FAIXAS = [100, 102, 110, 120, 140, 160, 180, 200]

const INDICATORS = [
  { key: "af", label: "AF", icon: Target, color: "from-emerald-500 to-teal-500" },
  { key: "seguro", label: "Seguro", icon: BarChart3, color: "from-blue-500 to-cyan-500" },
  { key: "emprestimo", label: "Empréstimo", icon: TrendingUp, color: "from-amber-500 to-orange-500" },
  { key: "venda", label: "Venda", icon: Calendar, color: "from-rose-500 to-pink-500" },
] as const

const defaultFormData: FormData = {
  diasUteis: "",
  diaAtual: "",
  af: { mediaAtual: "", mediaNecessaria: "" },
  seguro: { mediaAtual: "", mediaNecessaria: "" },
  emprestimo: { mediaAtual: "", mediaNecessaria: "" },
  venda: { mediaAtual: "", mediaNecessaria: "" },
}

function parseBrazilianNumber(value: string): number {
  if (!value) return 0
  const cleaned = value.replace(/\./g, "").replace(",", ".")
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

function formatBrazilianNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function calculateIndicator(
  mediaAtual: string,
  mediaNecessaria: string,
  diasTrabalhados: number,
  diasUteis: number
) {
  const avgAtual = parseBrazilianNumber(mediaAtual)
  const avgNecessaria = parseBrazilianNumber(mediaNecessaria)

  const totalRealizado = avgAtual * diasTrabalhados
  const meta = avgNecessaria * diasUteis
  const projecao = avgAtual * diasUteis
  const percentual = meta > 0 ? (totalRealizado / meta) * 100 : 0

  return {
    totalRealizado,
    meta,
    projecao,
    percentual,
  }
}

export default function JuarezCheck() {
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setFormData(JSON.parse(saved))
      } catch {
        // Invalid data, use default
      }
    }
    setIsLoaded(true)
  }, [])

  // Save data to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    }
  }, [formData, isLoaded])

  const handleClearData = useCallback(() => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados?")) {
      setFormData(defaultFormData)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const updateIndicator = useCallback(
    (indicator: keyof FormData, field: keyof IndicatorData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [indicator]: {
          ...(prev[indicator] as IndicatorData),
          [field]: value,
        },
      }))
    },
    []
  )

  const diasUteis = parseInt(formData.diasUteis) || 0
  const diaAtual = parseInt(formData.diaAtual) || 0

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Juarez Check
              </h1>
              <p className="text-xs text-muted-foreground">
                Controle de Metas
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearData}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Limpar dados</span>
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Configuração do Mês */}
        <Card className="border-0 shadow-lg bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Configuração do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Dias úteis no mês
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 22"
                  value={formData.diasUteis}
                  onChange={(e) => updateField("diasUteis", e.target.value)}
                  className="h-12 text-lg font-medium bg-background"
                  min="1"
                  max="31"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Dia atual (dias trabalhados)
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 10"
                  value={formData.diaAtual}
                  onChange={(e) => updateField("diaAtual", e.target.value)}
                  className="h-12 text-lg font-medium bg-background"
                  min="0"
                  max="31"
                />
              </div>
            </div>
            {diasUteis > 0 && diaAtual > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Progresso:</span>{" "}
                  <span className="text-primary font-bold">
                    {diaAtual} de {diasUteis} dias
                  </span>{" "}
                  ({((diaAtual / diasUteis) * 100).toFixed(0)}% do mês)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Indicadores */}
        <Card className="border-0 shadow-lg bg-card overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Indicadores de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 font-semibold text-sm text-muted-foreground">
                      Indicador
                    </th>
                    <th className="text-center p-4 font-semibold text-sm text-muted-foreground">
                      Média Atual
                    </th>
                    <th className="text-center p-4 font-semibold text-sm text-muted-foreground">
                      Média Necessária
                    </th>
                    <th className="text-center p-4 font-semibold text-sm text-muted-foreground">
                      Total Realizado
                    </th>
                    <th className="text-center p-4 font-semibold text-sm text-muted-foreground">
                      Meta Total
                    </th>
                    <th className="text-center p-4 font-semibold text-sm text-muted-foreground">
                      Projeção
                    </th>
                    <th className="text-center p-4 font-semibold text-sm text-muted-foreground">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {INDICATORS.map(({ key, label, icon: Icon, color }) => {
                    const data = formData[key] as IndicatorData
                    const calc = calculateIndicator(
                      data.mediaAtual,
                      data.mediaNecessaria,
                      diaAtual,
                      diasUteis
                    )

                    return (
                      <tr
                        key={key}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}
                            >
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-foreground">
                              {label}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={data.mediaAtual}
                            onChange={(e) =>
                              updateIndicator(key, "mediaAtual", e.target.value)
                            }
                            className="text-center h-10 max-w-[120px] mx-auto bg-background"
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={data.mediaNecessaria}
                            onChange={(e) =>
                              updateIndicator(
                                key,
                                "mediaNecessaria",
                                e.target.value
                              )
                            }
                            className="text-center h-10 max-w-[120px] mx-auto bg-background"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-semibold text-foreground">
                            {formatBrazilianNumber(calc.totalRealizado)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-semibold text-muted-foreground">
                            {formatBrazilianNumber(calc.meta)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`font-semibold ${
                              calc.projecao >= calc.meta
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {formatBrazilianNumber(calc.projecao)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-full text-sm font-bold ${
                              calc.percentual >= 100
                                ? "bg-success/20 text-success"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {formatBrazilianNumber(calc.percentual, 1)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {INDICATORS.map(({ key, label, icon: Icon, color }) => {
                const data = formData[key] as IndicatorData
                const calc = calculateIndicator(
                  data.mediaAtual,
                  data.mediaNecessaria,
                  diaAtual,
                  diasUteis
                )

                return (
                  <div
                    key={key}
                    className="border border-border rounded-xl p-4 bg-background space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">
                          {label}
                        </h3>
                        <span
                          className={`text-sm font-semibold ${
                            calc.percentual >= 100
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {formatBrazilianNumber(calc.percentual, 1)}% da meta
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Média Atual
                        </label>
                        <Input
                          type="text"
                          placeholder="0,00"
                          value={data.mediaAtual}
                          onChange={(e) =>
                            updateIndicator(key, "mediaAtual", e.target.value)
                          }
                          className="h-10 bg-card"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Média Necessária
                        </label>
                        <Input
                          type="text"
                          placeholder="0,00"
                          value={data.mediaNecessaria}
                          onChange={(e) =>
                            updateIndicator(
                              key,
                              "mediaNecessaria",
                              e.target.value
                            )
                          }
                          className="h-10 bg-card"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Realizado
                        </p>
                        <p className="font-bold text-foreground">
                          {formatBrazilianNumber(calc.totalRealizado)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Meta</p>
                        <p className="font-bold text-muted-foreground">
                          {formatBrazilianNumber(calc.meta)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Projeção
                        </p>
                        <p
                          className={`font-bold ${
                            calc.projecao >= calc.meta
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {formatBrazilianNumber(calc.projecao)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Faixas de Desempenho */}
        <Card className="border-0 shadow-lg bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Faixas de Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {INDICATORS.map(({ key, label, icon: Icon, color }) => {
                const data = formData[key] as IndicatorData
                const calc = calculateIndicator(
                  data.mediaAtual,
                  data.mediaNecessaria,
                  diaAtual,
                  diasUteis
                )

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-foreground">
                        {label}
                      </span>
                      <span
                        className={`ml-auto text-sm font-bold ${
                          calc.percentual >= 100
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {formatBrazilianNumber(calc.percentual, 1)}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FAIXAS.map((faixa) => {
                        const atingida = calc.percentual >= faixa
                        return (
                          <div
                            key={faixa}
                            className={`
                              px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300
                              ${
                                atingida
                                  ? "bg-success text-success-foreground shadow-md scale-105"
                                  : "bg-destructive/20 text-destructive"
                              }
                            `}
                          >
                            {faixa}%
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-muted-foreground">
          <p>
            Juarez Check &copy; {new Date().getFullYear()} — Seus dados são
            salvos localmente no navegador
          </p>
        </footer>
      </div>
    </main>
  )
}
