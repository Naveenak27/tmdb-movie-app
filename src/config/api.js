// const API_KEY = 'b17207d21346daa45477c7c254d38e88';
// const BASE_URL = 'https://api.themoviedb.org/3';
// const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// export const fetchMoviesByCategory = async (categoryId, page = 1) => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${categoryId}&page=${page}`
//     );
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching movies:', error);
//     return { results: [], total_pages: 0 };
//   }
// };

// export const fetchCategories = async () => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
//     );
//     const data = await response.json();
//     return data.genres;
//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     return [];
//   }
// };

// export const fetchMovieDetails = async (movieId) => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
//     );
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching movie details:', error);
//     return null;
//   }
// };

// export { IMAGE_BASE_URL };

const API_KEY = 'b17207d21346daa45477c7c254d38e88'; // Replace with your actual API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const fetchMoviesByCategory = async (categoryId, page = 1) => {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${categoryId}&page=${page}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return { results: [], total_pages: 0 };
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
    );
    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export { API_KEY, BASE_URL, IMAGE_BASE_URL };



