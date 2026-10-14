import styles from "../styles/Home.module.css";

export const STATUS_LABELS = {
  leia: "Quero ler",
  lendo: "Lendo",
  "concluído": "Concluído",
};

const STATUS_CLASS = {
  leia: styles.statusLeia,
  lendo: styles.statusLendo,
  "concluído": styles.statusConcluido,
};

export default function BookCard({ book, onStatusChange, onDelete }) {
  return (
    <article className={styles.card}>
      <div className={styles.coverWrap}>
        {book.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.cover}
            src={book.cover}
            alt={`Capa do livro ${book.title}`}
          />
        ) : (
          <div className={styles.coverFallback}>{book.title}</div>
        )}
      </div>

      <div className={styles.cardBody}>
        <h2 className={styles.bookTitle}>{book.title}</h2>
        <p className={styles.bookAuthor}>{book.author}</p>

        <div className={styles.cardActions}>
          <select
            className={`${styles.statusSelect} ${STATUS_CLASS[book.status] || ""}`}
            value={book.status}
            onChange={(e) => onStatusChange(book.id, e.target.value)}
            aria-label={`Status de ${book.title}`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            className={styles.removeButton}
            onClick={() => onDelete(book.id)}
          >
            Remover
          </button>
        </div>
      </div>
    </article>
  );
}
