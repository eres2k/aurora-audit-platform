import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { Button } from '@mui/material';
import { generateChart } from '../utils/charts';

const AuditPDF = ({ audit }) => (
  <Document>
    <Page size="A4">
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24 }}>Audit Report: {audit.title}</Text>
        <Text style={{ fontSize: 16, marginTop: 10 }}>Status: {audit.status}</Text>
        <Image src={generateChart(audit)} style={{ marginTop: 20 }} />
        {audit.responses.map((response) => (
          <View key={response.questionId}>
            <Text>{response.questionText}</Text>
            <Text>Answer: {response.answer}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const PDFExport = ({ audit }) => (
  <PDFDownloadLink document={<AuditPDF audit={audit} />} fileName={`${audit.title}.pdf`}>
    {({ loading }) => (
      <Button variant="contained" disabled={loading}>
        {loading ? 'Generating PDF...' : 'Export PDF'}
      </Button>
    )}
  </PDFDownloadLink>
);

export default PDFExport;
