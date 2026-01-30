import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Invoice, Client, Job } from '@/lib/types'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 10,
    color: '#666',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#0ea5e9',
  },
  invoiceNumber: {
    fontSize: 10,
    textAlign: 'right',
    color: '#666',
    marginTop: 4,
  },
  statusBanner: {
    padding: 12,
    marginBottom: 20,
    borderRadius: 4,
    backgroundColor: '#dcfce7',
    borderLeft: '4px solid #22c55e',
  },
  statusBannerOverdue: {
    backgroundColor: '#fee2e2',
    borderLeft: '4px solid #ef4444',
  },
  statusBannerPending: {
    backgroundColor: '#dbeafe',
    borderLeft: '4px solid #3b82f6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#166534',
  },
  statusTextOverdue: {
    color: '#991b1b',
  },
  statusTextPending: {
    color: '#1e40af',
  },
  detailsSection: {
    flexDirection: 'row',
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  detailsColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  billToName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  billToText: {
    fontSize: 10,
    color: '#333',
    marginBottom: 2,
  },
  invoiceDetailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  invoiceDetailLabel: {
    fontSize: 10,
    color: '#666',
    width: 80,
  },
  invoiceDetailValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  serviceTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  serviceDate: {
    fontSize: 9,
    color: '#999',
  },
  amountSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '2px solid #e5e7eb',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  paymentInstructions: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    border: '1px solid #bfdbfe',
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 10,
    color: '#1e3a8a',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
  },
  footerText: {
    marginBottom: 4,
  },
})

interface InvoicePDFProps {
  invoice: Invoice
  client: Client
  job: Job | null
}

export default function InvoicePDF({ invoice, client, job }: InvoicePDFProps) {
  const isOverdue = () => {
    if (invoice.status === 'Paid') return false
    return new Date(invoice.dueDate) < new Date()
  }

  const getDaysOverdue = () => {
    if (!isOverdue()) return 0
    const diff = new Date().getTime() - new Date(invoice.dueDate).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const invoiceNum = invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>ExcelPro Washers</Text>
            <Text style={styles.companyTagline}>Professional Pressure Washing Services</Text>
            <View style={styles.contactInfo}>
              <Text>(613) 555-WASH</Text>
              <Text>info@excelprowashers.com</Text>
              <Text>Ottawa, ON</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoiceNum}</Text>
          </View>
        </View>

        {/* Status Banner */}
        {invoice.status === 'Paid' && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>Payment Received - Thank You!</Text>
          </View>
        )}

        {isOverdue() && invoice.status !== 'Paid' && (
          <View style={[styles.statusBanner, styles.statusBannerOverdue]}>
            <Text style={[styles.statusText, styles.statusTextOverdue]}>
              Payment Overdue - Due {getDaysOverdue()} days ago
            </Text>
          </View>
        )}

        {invoice.status !== 'Paid' && !isOverdue() && (
          <View style={[styles.statusBanner, styles.statusBannerPending]}>
            <Text style={[styles.statusText, styles.statusTextPending]}>
              Payment Due: {formatDate(invoice.dueDate)}
            </Text>
          </View>
        )}

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsColumn}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.billToName}>
              {client.firstName} {client.lastName}
            </Text>
            {client.companyName && (
              <Text style={styles.billToText}>{client.companyName}</Text>
            )}
            <Text style={styles.billToText}>{client.email}</Text>
            {client.phone && (
              <Text style={styles.billToText}>{client.phone}</Text>
            )}
            {client.address && (
              <Text style={styles.billToText}>{client.address}</Text>
            )}
          </View>

          <View style={styles.detailsColumn}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Invoice Date:</Text>
              <Text style={styles.invoiceDetailValue}>
                {formatDate(invoice.createdAt)}
              </Text>
            </View>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Due Date:</Text>
              <Text style={styles.invoiceDetailValue}>
                {formatDate(invoice.dueDate)}
              </Text>
            </View>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Status:</Text>
              <Text style={styles.invoiceDetailValue}>
                {invoice.status === 'Paid' ? 'Paid' : isOverdue() ? 'Overdue' : 'Outstanding'}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Description */}
        {job && (
          <View style={styles.serviceSection}>
            <Text style={styles.serviceTitle}>Service Provided</Text>
            <Text style={styles.serviceTitle}>{job.title}</Text>
            {job.description && (
              <Text style={styles.serviceDescription}>{job.description}</Text>
            )}
            {job.startDate && (
              <Text style={styles.serviceDate}>
                Service Date: {formatDate(job.startDate)}
              </Text>
            )}
          </View>
        )}

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount Due</Text>
            <Text style={styles.amountValue}>
              ${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Payment Instructions */}
        {invoice.status !== 'Paid' && (
          <View style={styles.paymentInstructions}>
            <Text style={styles.paymentTitle}>Payment Instructions</Text>
            <Text style={styles.paymentText}>
              E-Transfer: Send payment to payments@excelprowashers.com
            </Text>
            <Text style={styles.paymentText}>
              Check: Make payable to "ExcelPro Washers"
            </Text>
            <Text style={styles.paymentText}>
              Cash: Contact us to arrange payment
            </Text>
            <Text style={[styles.paymentText, { marginTop: 8 }]}>
              Please include invoice #{invoiceNum} in your payment reference.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for choosing ExcelPro Washers!</Text>
          <Text style={styles.footerText}>
            Questions about this invoice? Contact us at info@excelprowashers.com or (613) 555-WASH
          </Text>
        </View>
      </Page>
    </Document>
  )
}
