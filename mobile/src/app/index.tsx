import { io } from 'socket.io-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Lead = {
  id: string;
  created_time?: string;
  field_data?: {
    name: string;
    values: string[];
  }[];
};



export default function HomeScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
  const socket = io('http://192.168.29.19:5000', {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    setConnected(true);
    setLoading(false);
  });

  socket.on('disconnect', () => {
    setConnected(false);
  });

  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error.message);
    setConnected(false);
    setLoading(false);
  });

  socket.on('new_lead', (lead: Lead) => {
    setLeads((current) => {
      if (current.some((item) => item.id === lead.id)) {
        return current;
      }
      return [lead, ...current];
    });
  });

  return () => {
    socket.disconnect();
  };
}, []);

  const renderLead = ({ item }: { item: Lead }) => (
    <View style={styles.leadCard}>
      <Text style={styles.leadName}>
        {item.field_data?.find((f) => f.name === 'full_name')?.values?.[0]
          ?? item.field_data?.find((f) => f.name === 'name')?.values?.[0]
          ?? 'New lead'}
      </Text>

      {item.field_data?.map((field) => (
        <Text key={field.name} style={styles.detail}>
          {field.name.replace(/_/g, ' ')}: {field.values.join(', ')}
        </Text>
      ))}

      <Text style={styles.date}>
        {item.created_time
          ? new Date(item.created_time).toLocaleString()
          : 'Date unavailable'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meta Leads</Text>
        <Text style={styles.subtitle}>Real-time lead dashboard</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: connected ? '#16a34a' : '#d97706' },
            ]}
          />
          <Text style={styles.statusText}>
            {connected ? 'Connected to server' : 'Waiting for backend'}
          </Text>
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>TOTAL LEADS RECEIVED</Text>
        <Text style={styles.summaryValue}>{leads.length}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent leads</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : leads.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No leads yet</Text>
          <Text style={styles.emptyText}>
            New test leads will appear here when the backend is connected.
          </Text>
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id}
          renderItem={renderLead}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  header: {
    backgroundColor: '#172554',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 26,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 30, fontWeight: '800', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#cbd5e1', marginTop: 5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  statusDot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  statusText: { color: '#ffffff', fontSize: 13 },
  summary: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  summaryLabel: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  summaryValue: { color: '#172554', fontSize: 38, fontWeight: '800', marginTop: 8 },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#172554',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  empty: {
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#334155' },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  leadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  leadName: { fontSize: 17, fontWeight: '700', color: '#172554' },
  detail: { color: '#475569', marginTop: 6, textTransform: 'capitalize' },
  date: { color: '#94a3b8', marginTop: 12, fontSize: 12 },
});
