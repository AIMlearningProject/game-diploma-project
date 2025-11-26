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
      Alert.alert('Error', 'Failed to search books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBook) {
      Alert.alert('Error', 'Please select a book');
      return;
    }

    if (!pagesRead || parseInt(pagesRead) <= 0) {
      Alert.alert('Error', 'Please enter valid pages read');
      return;
    }

    if (reviewText.length < 20) {
      Alert.alert('Error', 'Review must be at least 20 characters');
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

      Alert.alert('Success', 'Book logged successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to log book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search for a Book</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter book title or author..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchBooks}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>Search</Text>
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
                <Text style={styles.bookAuthor}>by {book.author}</Text>
                <Text style={styles.bookDetails}>
                  {book.pages} pages • {book.genre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {selectedBook && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Book</Text>

          <View style={styles.selectedBook}>
            <Text style={styles.selectedBookTitle}>{selectedBook.title}</Text>
            <Text style={styles.selectedBookAuthor}>by {selectedBook.author}</Text>
          </View>

          <Text style={styles.label}>Pages Read (max {selectedBook.pages})</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={pagesRead}
            onChangeText={setPagesRead}
            placeholder="Enter pages read"
          />

          <Text style={styles.label}>Review (minimum 20 characters)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="What did you think about this book?"
          />
          <Text style={styles.charCount}>{reviewText.length} / 20 characters</Text>

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
              <Text style={styles.submitButtonText}>Log Book</Text>
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
