export interface Quote {
  text: string
  author: string
}

export async function getSpanishQuotes(): Promise<Quote[]> {
  const response = await fetch('http://localhost:3000/api/frases-motivacion');
  if (!response.ok) {
    throw new Error('No se pudo obtener las frases');
  }

  const data = await response.json();

  // Normalizamos los nombres para que coincidan con el tipo `Quote`
  return data.map((item: any) => ({
    author: item.autor,
    text: item.texto,
  }));
}
