import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
  },
});

export const AuditPDFDocument = ({ audit }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Audit Report</Text>
      <View style={styles.section}>
        <Text style={styles.title}>{audit.title}</Text>
        <Text style={styles.text}>Status: {audit.status}</Text>
        <Text style={styles.text}>Created: {new Date(audit.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.text}>Location: {audit.metadata?.location}</Text>
        <Text style={styles.text}>Department: {audit.metadata?.department}</Text>
      </View>
      
      {audit.responses?.map((response, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.text}>
            Q{index + 1}: {response.question}
          </Text>
          <Text style={styles.text}>
            Answer: {response.answer}
          </Text>
        </View>
      ))}
      
      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()} - Aurora Audit Platform
      </Text>
    </Page>
  </Document>
);

export const generatePDF = async (audit) => {
  // This function would be called to generate PDF
  return <AuditPDFDocument audit={audit} />;
};
