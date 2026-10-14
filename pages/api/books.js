export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Informe o titulo" });

  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books&key=${process.env.BOOKS_API_KEY}`;

  try {
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(url);
      if (response.status < 500) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
    const data = await response.json();
    res.status(response.status).json(data);
  } catch {
    res.status(502).json({ error: "Falha ao consultar a API de livros" });
  }
}
