import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Tv, Plus, Check, Play } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { VideoPlayer } from '../components/VideoPlayer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';
import { IMAGE_BASE_URL, BACKDROP_SIZE } from '../config/api';
import type { TVShowDetails, Video, CartItem } from '../types/movie';

export function TVDetail() {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTVShow] = useState<TVShowDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, removeItem, isInCart } = useCart();

  const tvId = parseInt(id || '0');
  const inCart = isInCart(tvId);

  useEffect(() => {
    const fetchTVData = async () => {
      try {
        setLoading(true);
        const [tvData, videoData] = await Promise.all([
          tmdbService.getTVShowDetails(tvId),
          tmdbService.getTVShowVideos(tvId)
        ]);

        setTVShow(tvData);
        
        // Filter for trailers and teasers
        const trailers = videoData.results.filter(
          video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
        );
        setVideos(trailers);
        
        if (trailers.length > 0) {
          setSelectedVideo(trailers[0]);
        }
      } catch (err) {
        setError('Error al cargar los detalles de la serie.');
        console.error('Error fetching TV show details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (tvId) {
      fetchTVData();
    }
  }, [tvId]);

  const handleCartAction = () => {
    if (!tvShow) return;

    const cartItem: CartItem = {
      id: tvShow.id,
      title: tvShow.name,
      poster_path: tvShow.poster_path,
      type: 'tv',
      first_air_date: tvShow.first_air_date,
      vote_average: tvShow.vote_average,
    };

    if (inCart) {
      removeItem(tvShow.id);
    } else {
      addItem(cartItem);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorMessage message={error || 'Serie no encontrada'} />
      </div>
    );
  }

  const backdropUrl = tvShow.backdrop_path
    ? `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${tvShow.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=1280&h=720&fit=crop&crop=center';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <Link
              to="/tv"
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a series
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {tvShow.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{tvShow.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-1" />
                <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
              </div>
              <div className="flex items-center">
                <Tv className="h-5 w-5 mr-1" />
                <span>{tvShow.number_of_seasons} temporadas</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {tvShow.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sinopsis</h2>
              <p className="text-gray-700 leading-relaxed">
                {tvShow.overview || 'Sin descripción disponible.'}
              </p>
              {tvShow.tagline && (
                <p className="text-gray-500 italic mt-4">"{tvShow.tagline}"</p>
              )}
            </div>

            {/* Videos */}
            {videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tráilers y Videos</h2>
                
                {showVideo && selectedVideo ? (
                  <div className="mb-4">
                    <VideoPlayer videoKey={selectedVideo.key} title={selectedVideo.name} />
                  </div>
                ) : (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowVideo(true)}
                      className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden group"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ 
                          backgroundImage: selectedVideo 
                            ? `url(https://img.youtube.com/vi/${selectedVideo.key}/maxresdefault.jpg)` 
                            : `url(${backdropUrl})` 
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors group-hover:scale-110">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="font-medium">Reproducir Tráiler</p>
                        <p className="text-sm opacity-75">{selectedVideo?.name}</p>
                      </div>
                    </button>
                  </div>
                )}

                {videos.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => {
                          setSelectedVideo(video);
                          setShowVideo(true);
                        }}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedVideo?.id === video.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{video.name}</p>
                        <p className="text-sm text-gray-600">{video.type}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <button
                onClick={handleCartAction}
                className={`w-full mb-6 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  inCart
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {inCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Agregada al Carrito
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Agregar al Carrito
                  </>
                )}
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Estado</h3>
                  <p className="text-gray-700">{tvShow.status}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Primera Emisión</h3>
                  <p className="text-gray-700">
                    {new Date(tvShow.first_air_date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Temporadas</h3>
                  <p className="text-gray-700">{tvShow.number_of_seasons}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Episodios</h3>
                  <p className="text-gray-700">{tvShow.number_of_episodes}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Duración</h3>
                  <p className="text-gray-700">
                    {tvShow.episode_run_time.length > 0
                      ? `${tvShow.episode_run_time[0]} min`
                      : 'Variable'
                    }
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Idioma Original</h3>
                  <p className="text-gray-700">{tvShow.original_language.toUpperCase()}</p>
                </div>

                {tvShow.production_companies.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Productoras</h3>
                    <div className="space-y-2">
                      {tvShow.production_companies.slice(0, 3).map((company) => (
                        <p key={company.id} className="text-gray-700 text-sm">
                          {company.name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}