   export default async function handler(req, res) {
     const { q } = req.query;
     if (!q) return res.status(400).json({ error: "Informe o título" });

     const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books&key=${process.env.BOOKS_API_KEY}`;
     const response = await fetch(url);
     const data = await response.json();
     res.status(response.status).json(data);
   }