import MovieDetail from "@/components/MovieDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const movieId = Number(id);
  return (
    <main className="min-h-screen">
      <MovieDetail id={movieId} />
    </main>
  );
}
