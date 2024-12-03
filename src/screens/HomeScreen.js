import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  fetchCategories, 
  fetchMoviesByCategory, 
  IMAGE_BASE_URL,
  API_KEY,
  BASE_URL 
} from '../config/api';import { StatusBar } from 'expo-status-bar';

const MOVIE_TYPES = [
  { id: 'popular', name: 'trending now', endpoint: 'movie/popular' },
  { id: 'top_rated', name: 'Top Rated', endpoint: 'movie/top_rated' },
  { id: 'upcoming', name: 'Coming soon', endpoint: 'movie/upcoming' }
];


const PaginationButtons = ({ currentPage, totalPages, onPageChange }) => {

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <View style={styles.paginationContainer}>
      {getPageNumbers().map((page, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.pageButton,
            page === currentPage && styles.activePageButton,
            page === '...' && styles.ellipsisButton,
          ]}
          onPress={() => page !== '...' && onPageChange(page)}
          disabled={page === '...' || page === currentPage}
        >
          <Text
            style={[
              styles.pageButtonText,
              page === currentPage && styles.activePageButtonText,
            ]}
          >
            {page}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMenuType, setSelectedMenuType] = useState('categories'); // 'categories' or 'movieTypes'
  const [selectedMovieType, setSelectedMovieType] = useState(null);
  const flatListRef = useRef(null);

  // At the top with other constants
const ACTION_GENRE_ID = 28;

// Update the initial useEffect
useEffect(() => {
  const initializeScreen = async () => {
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
    const actionCategory = categoriesData.find(cat => cat.id === ACTION_GENRE_ID);
    if (actionCategory) {
      setSelectedCategory(actionCategory);
      const movieData = await fetchMoviesByCategory(ACTION_GENRE_ID, 1);
      setMovies(movieData.results);
      setTotalPages(movieData.total_pages);
    }
  };
  
  initializeScreen();
}, []);

// Remove or comment out the loadCategories function since we're handling it in useEffect


  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setMovies([]);
      setCurrentPage(1);
      loadMovies(selectedCategory.id, 1, true);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedMovieType) {
      setMovies([]);
      setCurrentPage(1);
      loadMoviesByType(selectedMovieType.endpoint, 1);
    }
  }, [selectedMovieType]);

  const loadCategories = async () => {
    const categoriesData = await fetchCategories();
    setCategories(categoriesData);
  };

  const loadMovies = async (categoryId, page, isNewCategory = false) => {
    if (isNewCategory) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const data = await fetchMoviesByCategory(categoryId, page);
      if (isNewCategory) {
        setMovies(data.results);
      } else {
        setMovies([...movies, ...data.results]);
      }
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

// Update the loadMoviesByType function
const loadMoviesByType = async (endpoint, page) => {
  setIsLoading(true);
  try {
    const response = await fetch(
      `${BASE_URL}/${endpoint}?api_key=${API_KEY}&page=${page}`
    );
    const data = await response.json();
    
    let filteredResults = data.results;
    
    // Filter upcoming movies by release date
    if (endpoint === 'movie/upcoming') {
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      filteredResults = data.results.filter(movie => 
        movie.release_date > currentDate
      );
    }
    
    setMovies(filteredResults);
    setTotalPages(data.total_pages);
  } catch (error) {
    console.error('Error fetching movies by type:', error);
  } finally {
    setIsLoading(false);
  }
};  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (selectedCategory) {
      loadMovies(selectedCategory.id, page, true);
    } else if (selectedMovieType) {
      loadMoviesByType(selectedMovieType.endpoint, page);
    }
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

// Modify the renderMovie function to show release date for upcoming movies
const renderMovie = ({ item }) => {
  // console.log(item,"renderMovie");
  
  const isUpcoming = selectedMovieType?.endpoint === 'movie/upcoming';
  
  return (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
        style={styles.moviePoster}
      />
<View style={styles.movieInfo}>
  <Text style={styles.movieTitle} numberOfLines={2}>
    {item.title}
  </Text>
  <View style={styles.ratingContainer}>
    <Text style={styles.ratingValue}>{item.vote_average.toFixed(1)}</Text>
    <Ionicons name="star" size={14} color="#FFD700" style={styles.starIcon} />
    <Text style={styles.maxRating}>/10</Text>
  </View>
  {isUpcoming && (
    <Text style={styles.releaseDate}>
      Release: {new Date(item.release_date).toLocaleDateString()}
    </Text>
  )}
</View>
    </TouchableOpacity>
  );
};
  const renderMenuItem = (item, type) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        if (type === 'category') {
          setSelectedCategory(item);
          setSelectedMovieType(null);
        } else {
          setSelectedMovieType(item);
          setSelectedCategory(null);
        }
        setMenuVisible(false);
      }}
    >
      <Text style={styles.menuItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderMenuContent = () => (
    <View style={styles.menuContent}>
      <View style={styles.menuHeader}>
        <TouchableOpacity
          style={styles.menuTypeButton}
          onPress={() => setSelectedMenuType('categories')}
        >
          <Text
            style={[
              styles.menuTypeText,
              selectedMenuType === 'categories' && styles.activeMenuTypeText,
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuTypeButton}
          onPress={() => setSelectedMenuType('movieTypes')}
        >
          <Text
            style={[
              styles.menuTypeText,
              selectedMenuType === 'movieTypes' && styles.activeMenuTypeText,
            ]}
          >
            Cinex
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={selectedMenuType === 'categories' ? categories : MOVIE_TYPES}
        renderItem={({ item }) =>
          renderMenuItem(item, selectedMenuType === 'categories' ? 'category' : 'movieType')
        }
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
  <TouchableOpacity
    onPress={() => setMenuVisible(true)}
    style={styles.menuButton}
  >
    <Ionicons name="menu" size={30} color="#000" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>
    {selectedCategory ? selectedCategory.name : 
     selectedMovieType ? selectedMovieType.name : 'Movies'}
  </Text>
  <Image
    source={{ uri: 'https://naveenak.netlify.app/img/black.jpeg' }}
    style={styles.logoImage}
  />
  {/* <Text style={styles.logoText}>Cinex</Text> */}
</View>

      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            {renderMenuContent()}
          </View>
        </View>
      </Modal>

      <FlatList
        ref={flatListRef}
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.movieRow}
        ListFooterComponent={renderFooter}
        ListFooterComponentStyle={styles.footerStyle}
      />

      <PaginationButtons
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  }, movieCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  
  movieInfo: {
    padding: 8,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 12,
    color: '#666',
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  movieRow: {
    justifyContent: 'space-between',
    padding: 8,
  },
  movieCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  moviePoster: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  movieTitle: {
    padding: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '70%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  menuContent: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  menuTypeText: {
    fontSize: 16,
    color: '#666',
  },
  activeMenuTypeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFooter: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerStyle: {
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pageButton: {
    minWidth: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activePageButton: {
    backgroundColor: '#007AFF',
  },
  ellipsisButton: {
    backgroundColor: 'transparent',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activePageButtonText: {
    color: '#fff',
  },
  movieInfo: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  movieTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
  },
  starIcon: {
    marginHorizontal: 3,
  },
  maxRating: {
    fontSize: 13,
    color: '#666',
  },
  releaseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },

  pageButton: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  activePageButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
    transform: [{ scale: 1.1 }],
  },

  ellipsisButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },

  pageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  activePageButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  
});