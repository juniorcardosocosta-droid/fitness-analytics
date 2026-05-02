import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#0a162b",
    color: "#fff"
  },

  title: {
    fontSize: 24,
    marginBottom: 20
  },

  section: {
    marginBottom: 20
  },

  kpiBox: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#0f1c33"
  },

  kpiTitle: {
    fontSize: 10,
    color: "#94a3b8"
  },

  kpiValue: {
    fontSize: 16,
    fontWeight: "bold"
  }
})

export default function RelatorioPDF({ dados }: any) {
  const { receita, despesa, resultado, margem } = dados

  return (
    <Document>

      {/* CAPA */}
      <Page style={styles.page}>
        <Text style={styles.title}>Relatório Financeiro</Text>
        <Text>Academia: Gym Analytics</Text>
        <Text>Período: Últimos meses</Text>
      </Page>

      {/* RESUMO */}
      <Page style={styles.page}>
        <Text style={styles.title}>Resumo Executivo</Text>

        <View style={styles.kpiBox}>
          <Text style={styles.kpiTitle}>Receita</Text>
          <Text style={styles.kpiValue}>R$ {receita}</Text>
        </View>

        <View style={styles.kpiBox}>
          <Text style={styles.kpiTitle}>Despesa</Text>
          <Text style={styles.kpiValue}>R$ {despesa}</Text>
        </View>

        <View style={styles.kpiBox}>
          <Text style={styles.kpiTitle}>Resultado</Text>
          <Text style={styles.kpiValue}>R$ {resultado}</Text>
        </View>

        <View style={styles.kpiBox}>
          <Text style={styles.kpiTitle}>Margem</Text>
          <Text style={styles.kpiValue}>{margem}%</Text>
        </View>
      </Page>

      {/* ANALISE AUTOMATICA */}
      <Page style={styles.page}>
        <Text style={styles.title}>Análise Automática</Text>

        <Text>
          {margem < 0
            ? "A empresa apresentou prejuízo no período, exigindo atenção imediata."
            : margem < 10
            ? "A margem está baixa, indicando necessidade de controle de custos."
            : "A empresa apresenta boa saúde financeira."}
        </Text>

        <Text style={{ marginTop: 10 }}>
          O comportamento de receita e despesas indica oportunidades de melhoria operacional.
        </Text>
      </Page>

    </Document>
  )
}