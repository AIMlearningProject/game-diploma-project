import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

export default function BookLogScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [pagesRead, setPagesRead] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await api.get(`/books/search?q=${searchQuery}`);
      setBooks(response.data.books);
    } catch (error) {
      Alert.alert('Virhe', 'Kirjojen haku epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBook) {
      Alert.alert('Virhe', 'Valitse kirja');
      return;
    }

    if (!pagesRead || parseInt(pagesRead) <= 0) {
      Alert.alert('Virhe', 'Syötä luettujen sivujen määrä');
      return;
    }

    if (reviewText.length < 20) {
      Alert.alert('Virhe', 'Arvostelu tulee olla vähintään 20 merkkiä');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/students/${user.id}/log-book`, {
        bookId: selectedBook.id,
        pagesRead: parseInt(pagesRead),
        reviewText,
        finishDate: new Date().toISOString(),
      });

      Alert.alert('Onnistui', 'Kirja kirjattu onnistuneesti!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (error) {
      Alert.alert('Virhe', error.response?.data?.message || 'Kirjan kirjaus epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Etsi kirjaa</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Kirjoita kirjan nimi tai kirjailija..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchBooks}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>Hae</Text>
          </TouchableOpacity>
        </View>

        {books.length > 0 && (
          <View style={styles.booksContainer}>
            {books.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={[
                  styles.bookItem,
                  selectedBook?.id === book.id && styles.bookItemSelected,
                ]}
                onPress={() => setSelectedBook(book)}
              >
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>{book.author}</Text>
                <Text style={styles.bookDetails}>
                  {book.pages} sivua • {book.genre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {selectedBook && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kirjaa kirja</Text>

          <View style={styles.selectedBook}>
            <Text style={styles.selectedBookTitle}>{selectedBook.title}</Text>
            <Text style={styles.selectedBookAuthor}>{selectedBook.author}</Text>
          </View>

          <Text style={styles.label}>Luetut sivut (max {selectedBook.pages})</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={pagesRead}
            onChangeText={setPagesRead}
            placeholder="Syötä luetut sivut"
          />

          <Text style={styles.label}>Arvostelu (vähintään 20 merkkiä)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Mitä pidit kirjasta?"
          />
          <Text style={styles.charCount}>{reviewText.length} / 20 merkkiä</Text>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading || reviewText.length < 20) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || reviewText.length < 20}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Kirjaa kirja</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  searchButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  booksContainer: {
    marginTop: 12,
  },
  bookItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bookItemSelected: {
    borderColor: '#0ea5e9',
    backgroundColor: '#eff6ff',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  bookDetails: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  selectedBook: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectedBookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  selectedBookAuthor: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
