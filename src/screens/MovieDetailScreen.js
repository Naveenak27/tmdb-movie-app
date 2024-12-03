import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { fetchMovieDetails, IMAGE_BASE_URL } from '../config/api';

export default function MovieDetailScreen({ route }) {
  const [movie, setMovie] = useState(null);
  const { movieId } = route.params;

  useEffect(() => {
    loadMovieDetails();
  }, []);

  const loadMovieDetails = async () => {
    const movieData = await fetchMovieDetails(movieId);
    setMovie(movieData);
  };

  if (!movie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${movie.backdrop_path}` }}
        style={styles.backdrop}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.releaseDate}>
          Release Date: {movie.release_date}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            Rating: {movie.vote_average.toFixed(1)}/10
          </Text>
        </View>
        <Text style={styles.overview}>{movie.overview}</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Genre:</Text>
          <Text style={styles.infoText}>
            {movie.genres.map(genre => genre.name).join(', ')}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Runtime:</Text>
          <Text style={styles.infoText}>{movie.runtime} minutes</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  releaseDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
});