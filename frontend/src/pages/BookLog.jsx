import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../stores/authStore';

function BookLog() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [pagesRead, setPagesRead] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await api.get(`/books/search?q=${searchQuery}`);
      setBooks(response.data.books);
    } catch (err) {
      setError('Kirjojen haku epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedBook) {
      setError('Valitse kirja');
      return;
    }

    if (!pagesRead || pagesRead <= 0) {
      setError('Anna luettujen sivujen määrä');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/students/${user.id}/log-book`, {
        bookId: selectedBook.id,
        pagesRead: parseInt(pagesRead),
        reviewText,
        finishDate: new Date().toISOString(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Kirjan kirjaus epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-8">Kirjaa kirja</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Kirja kirjattu onnistuneesti! Ohjataan...
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <h2 className="mb-4">Etsi kirjaa</h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder="Kirjoita kirjan nimi tai kirjailija..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
          />
          <button
            onClick={searchBooks}
            className="btn btn-primary"
            disabled={loading}
          >
            Hae
          </button>
        </div>

        {books.length > 0 && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedBook?.id === book.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-gray-600">kirjoittanut {book.author}</p>
                <p className="text-xs text-gray-500">
                  {book.pages} sivua • {book.genre} • Vaikeustaso: {book.difficultyScore}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <form onSubmit={handleSubmit} className="card">
          <h2 className="mb-4">Kirjan tiedot</h2>

          <div className="mb-4">
            <p className="font-medium text-lg">{selectedBook.title}</p>
            <p className="text-gray-600">kirjoittanut {selectedBook.author}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Luetut sivut (max {selectedBook.pages})
            </label>
            <input
              type="number"
              className="input"
              value={pagesRead}
              onChange={(e) => setPagesRead(e.target.value)}
              max={selectedBook.pages}
              min="1"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Arvostelu (vähintään 20 merkkiä)
            </label>
            <textarea
              className="input"
              rows="4"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              minLength="20"
              placeholder="Mitä pidit kirjasta?"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewText.length} / 20 merkkiä
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || reviewText.length < 20}
          >
            {loading ? 'Lähetetään...' : 'Kirjaa kirja'}
          </button>
        </form>
      )}
    </div>
  );
}

export default BookLog;
