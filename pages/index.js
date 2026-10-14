import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import BookCard from "../components/BookCard";

const initialBooksData = [
  {
    id: 1,
    title: "Can't Hurt Me",
    author: "David Goggins",
    cover: "https://m.media-amazon.com/images/I/41sgicYWg8L._SY445_SX342_.jpg",
    status: "concluído",
  },
  {
    id: 2,
    title: "Como fazer amigos e influenciar pessoas",
    author: "Dale Carnegie",
    cover: "https://m.media-amazon.com/images/I/51ekLm860KL._SY445_SX342_.jpg",
    status: "lendo",
  },
];

const FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "lendo", label: "Lendo" },
  { value: "leia", label: "Quero ler" },
  { value: "concluído", label: "Concluídos" },
];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [darkMode, setDarkMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "error" | "success", text }
  const [hasMounted, setHasMounted] = useState(false);

  // Carrega os dados salvos
  useEffect(() => {
    const savedBooks = localStorage.getItem("books");
    setBooks(savedBooks ? JSON.parse(savedBooks) : initialBooksData);
    setDarkMode(localStorage.getItem("darkMode") === "true");
    setHasMounted(true);
  }, []);

  // Salva livros e tema
  useEffect(() => {
    if (!hasMounted) return;
    localStorage.setItem("books", JSON.stringify(books));
    localStorage.setItem("darkMode", String(darkMode));
  }, [books, darkMode, hasMounted]);

  if (!hasMounted) return null;

  const filteredBooks =
    selectedStatus === "todos"
      ? books
      : books.filter((book) => book.status === selectedStatus);

  const countFor = (status) =>
    status === "todos"
      ? books.length
      : books.filter((book) => book.status === status).length;

  const handleAddBook = async () => {
    const title = newTitle.trim();
    if (!title || loading) return;

    setLoading(true);
    setMessage(null);

    try {
      const query = encodeURIComponent(title);
        const res = await fetch(`/api/books?q=${query}`);
      if (!res.ok) throw new Error("Falha na requisição");

      const data = await res.json();
      const info = data.items?.[0]?.volumeInfo;

      if (!info) {
        setMessage({
          type: "error",
          text: `Não encontramos "${title}". Confira o título e tente de novo.`,
        });
        return;
      }

      const foundTitle = info.title || title;
      const alreadyAdded = books.some(
        (book) => book.title.toLowerCase() === foundTitle.toLowerCase()
      );
      if (alreadyAdded) {
        setMessage({
          type: "error",
          text: `"${foundTitle}" já está na sua lista.`,
        });
        return;
      }

      const newBook = {
        id: crypto.randomUUID(),
        title: foundTitle,
        author: info.authors ? info.authors[0] : "Autor desconhecido",
        cover: info.imageLinks?.thumbnail?.replace("http://", "https://") || "",
        status: "leia",
      };

      setBooks([newBook, ...books]);
      setNewTitle("");
      setMessage({ type: "success", text: `"${foundTitle}" foi adicionado.` });
    } catch {
      setMessage({
        type: "error",
        text: "Não foi possível buscar o livro. Verifique sua conexão e tente de novo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setBooks(
      books.map((book) =>
        book.id === id ? { ...book, status: newStatus } : book
      )
    );
  };

  const handleDeleteBook = (id) => {
    if (window.confirm("Tem certeza que deseja remover este livro?")) {
      setBooks(books.filter((book) => book.id !== id));
    }
  };

  return (
    <div className={`${styles.page} ${darkMode ? styles.dark : ""}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Meus livros</h1>
            <p className={styles.subtitle}>
              {countFor("concluído")} de {books.length} concluídos
            </p>
          </div>
          <button
            className={styles.themeButton}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Modo claro" : "Modo escuro"}
          </button>
        </header>

        <div className={styles.addForm}>
          <input
            className={styles.input}
            type="text"
            placeholder="Digite o título de um livro"
            aria-label="Título do livro"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddBook()}
          />
          <button
            className={styles.addButton}
            onClick={handleAddBook}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Adicionar"}
          </button>
        </div>

        <p
          className={`${styles.message} ${
            message?.type === "error" ? styles.messageError : styles.messageSuccess
          }`}
          role="status"
        >
          {message?.text}
        </p>

        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`${styles.filter} ${
                selectedStatus === filter.value ? styles.filterActive : ""
              }`}
              onClick={() => setSelectedStatus(filter.value)}
            >
              {filter.label}
              <span className={styles.count}>{countFor(filter.value)}</span>
            </button>
          ))}
        </div>

        {filteredBooks.length === 0 ? (
          <p className={styles.empty}>
            Nenhum livro aqui ainda. Digite um título acima para adicionar.
          </p>
        ) : (
          <div className={styles.grid}>
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
