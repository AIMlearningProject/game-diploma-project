import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { searchBooks, GENRES, DIFFICULTY_OPTIONS } from '../data/books';

const MANUAL_TEMPLATE = { title: '', author: '', pages: '', genre: 'muu', difficulty: 1.2 };

export default function BookLog() {
  const navigate = useNavigate();
  const logBook  = useGameStore(s => s.logBook);

  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [manual,     setManual]     = useState(false);
  const [manualBook, setManualBook] = useState(MANUAL_TEMPLATE);
  const [pagesRead,  setPagesRead]  = useState('');
  const [review,     setReview]     = useState('');
  const [difficulty, setDifficulty] = useState(1.2);
  const [submitted,  setSubmitted]  = useState(false);
  const [reward,     setReward]     = useState(null);

  const handleSearch = (q) => {
    setQuery(q);
    setResults(q.trim() ? searchBooks(q) : []);
  };

  const pickBook = (book) => {
    setSelected(book);
    setDifficulty(book.difficulty);
    setPagesRead(String(book.pages));
    setManual(false);
    setResults([]);
    setQuery('');
  };

  const activeBook = manual
    ? { ...manualBook, pages: Number(manualBook.pages) || 0, difficulty }
    : selected
    ? { ...selected, pages: Number(pagesRead) || selected.pages, difficulty }
    : null;

  const canSubmit = activeBook &&
    String(activeBook.title).trim() &&
    Number(pagesRead) > 0 &&
    review.length >= 20;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const result = logBook({
      title:  activeBook.title,
      author: activeBook.author || 'Tuntematon',
      pages:  Number(pagesRead),
      genre:  activeBook.genre,
      difficulty,
    });
    setReward(result);
    setSubmitted(true);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted && reward) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="card">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="mb-2 text-green-600">Kirja kirjattu!</h1>
          <p className="text-gray-600 mb-6">Hienoa lukemista!</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-600">+{reward.steps}</div>
              <div className="text-sm text-gray-600">askelta</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-600">+{reward.xp}</div>
              <div className="text-sm text-gray-600">XP-pistettä</div>
            </div>
          </div>

          {reward.achievements?.length > 0 && (
            <div className="mb-6">
              <p className="font-semibold text-yellow-700 mb-3">🏅 Uudet saavutukset!</p>
              {reward.achievements.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg mb-2">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-sm">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate('/game')} className="btn btn-primary flex-1 py-3">
              🎮 Katso liike!
            </button>
            <button onClick={() => navigate('/')} className="btn btn-secondary flex-1 py-3">
              Etusivulle
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="mb-2">Kirjaa kirja 📖</h1>
      <p className="text-gray-500 mb-8 text-sm">Hae kirja tai lisää se käsin.</p>

      {/* Search — shown only when nothing selected yet */}
      {!selected && !manual && (
        <div className="card mb-6">
          <h2 className="mb-4">Valitse kirja</h2>
          <input
            className="input mb-3"
            placeholder="Hae nimellä tai kirjailijalla..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
          />
          {results.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto mb-2">
              {results.map(b => (
                <button key={b.id} onClick={() => pickBook(b)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <p className="font-medium">{b.title}</p>
                  <p className="text-sm text-gray-500">{b.author} · {b.pages} s · {b.genre}</p>
                </button>
              ))}
            </div>
          )}
          {query && results.length === 0 && (
            <p className="text-sm text-gray-500 mb-2">Ei tuloksia — lisää käsin!</p>
          )}
          <button onClick={() => { setManual(true); setManualBook(MANUAL_TEMPLATE); }}
            className="btn btn-secondary w-full mt-2">
            + Lisää kirja käsin
          </button>
        </div>
      )}

      {/* Manual book form */}
      {manual && (
        <div className="card mb-6">
          <h2 className="mb-4">Lisää kirja käsin</h2>
          <div className="space-y-3">
            <input className="input" placeholder="Kirjan nimi *" value={manualBook.title}
              onChange={e => setManualBook(p => ({ ...p, title: e.target.value }))} />
            <input className="input" placeholder="Kirjailija" value={manualBook.author}
              onChange={e => setManualBook(p => ({ ...p, author: e.target.value }))} />
            <input className="input" placeholder="Sivumäärä *" type="number" value={manualBook.pages}
              onChange={e => setManualBook(p => ({ ...p, pages: e.target.value }))} />
            <select className="input" value={manualBook.genre}
              onChange={e => setManualBook(p => ({ ...p, genre: e.target.value }))}>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button onClick={() => setManual(false)} className="btn btn-secondary mt-4 text-sm">
            ← Takaisin hakuun
          </button>
        </div>
      )}

      {/* Details — shown after book is chosen */}
      {(selected || manual) && (
        <form onSubmit={handleSubmit} className="card space-y-5">
          {selected && (
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">{selected.title}</p>
                <p className="text-gray-500 text-sm">{selected.author} · {selected.genre}</p>
              </div>
              <button type="button" onClick={() => { setSelected(null); setPagesRead(''); }}
                className="text-sm text-gray-400 hover:text-gray-600">Vaihda</button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Luetut sivut{selected ? ` (max ${selected.pages})` : ' *'}
            </label>
            <input type="number" className="input" value={pagesRead}
              onChange={e => setPagesRead(e.target.value)}
              min="1" max={selected?.pages || 9999} required
              placeholder="Kuinka monta sivua luit?" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Vaikeustaso</label>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setDifficulty(opt.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    difficulty === opt.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Arvostelu ({review.length} / vähintään 20 merkkiä)
            </label>
            <textarea className="input" rows={4} value={review}
              onChange={e => setReview(e.target.value)} minLength={20}
              placeholder="Mitä pidit kirjasta?" />
          </div>

          {Number(pagesRead) > 0 && (
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-800">
              Noin <strong>+{Math.max(1, Math.floor(Number(pagesRead) / 10))}</strong> askelta odottaa sinua!
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full py-3 text-base" disabled={!canSubmit}>
            📖 Kirjaa kirja!
          </button>
        </form>
      )}
    </div>
  );
}
