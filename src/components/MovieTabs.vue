<template>
  <div class="movie-tabs">
    <!-- 导航标签 -->
    <div class="tabs-nav">
      <button 
        :class="['tab-button', { active: activeTab === 'latest' }]"
        @click="setActiveTab('latest')"
      >
        最新电影
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'hot' }]"
        @click="setActiveTab('hot')"
      >
        热门电影
      </button>
    </div>
    
    <!-- 内容区域 -->
    <div class="tabs-content">
      <!-- 最新电影内容 -->
      <div v-show="activeTab === 'latest'" class="tab-pane">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="movies-container">
          <div 
            v-for="movie in displayedLatestMovies" 
            :key="movie['电影编号']" 
            class="movie-item"
            @click="goToMovieDetail(movie['电影编号'])"
          >
            <div class="poster-container">
              <img 
                v-if="movie.loaded"
                :src="getImagePath(movie['本地图片路径'])" 
                :alt="movie['电影标题']"
                class="movie-poster"
                @error="handleImageError(movie)"
              />
              <div v-else class="loading-placeholder">
                <div class="spinner"></div>
                <p>图片加载中...</p>
              </div>
            </div>
            <div class="movie-details">
              <h3>{{ movie['电影标题'] }}</h3>
              <p class="year">{{ formatDate(movie['上映时间']) }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="!loading && latestTotalPages > 1" class="pagination">
          <button 
            @click="prevLatestPage" 
            :disabled="latestCurrentPage === 1"
            class="page-btn"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ latestCurrentPage }} 页，共 {{ latestTotalPages }} 页
          </span>
          <button 
            @click="nextLatestPage" 
            :disabled="latestCurrentPage === latestTotalPages"
            class="page-btn"
          >
            下一页
          </button>
        </div>
      </div>
      
      <!-- 热门电影内容 -->
      <div v-show="activeTab === 'hot'" class="tab-pane">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="movies-container">
          <div 
            v-for="movie in displayedHotMovies" 
            :key="movie['电影编号']" 
            class="movie-item"
            @click="goToMovieDetail(movie['电影编号'])"
          >
            <div class="poster-container">
              <img 
                v-if="movie.loaded"
                :src="getImagePath(movie['本地图片路径'])" 
                :alt="movie['电影标题']"
                class="movie-poster"
                @error="handleImageError(movie)"
              />
              <div v-else class="loading-placeholder">
                <div class="spinner"></div>
                <p>图片加载中...</p>
              </div>
            </div>
            <div class="movie-details">
              <h3>{{ movie['电影标题'] }}</h3>
              <p class="rating">评分：{{ getRating(movie) }}</p>
              <p class="year">{{ movie['上映时间'].split('(')[0] }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="!loading && hotTotalPages > 1" class="pagination">
          <button 
            @click="prevHotPage" 
            :disabled="hotCurrentPage === 1"
            class="page-btn"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ hotCurrentPage }} 页，共 {{ hotTotalPages }} 页
          </span>
          <button 
            @click="nextHotPage" 
            :disabled="hotCurrentPage === hotTotalPages"
            class="page-btn"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';

export default {
  name: 'MovieTabs',
  data() {
    return {
      activeTab: 'latest', // 默认显示最新电影
      movies: [],
      latestMovies: [], // 按时间排序的电影
      hotMovies: [], // 热门电影（相同顺序）
      displayedLatestMovies: [],
      displayedHotMovies: [],
      loading: true,
      latestCurrentPage: 1,
      hotCurrentPage: 1,
      moviesPerPage: 8
    }
  },
  computed: {
    latestTotalPages() {
      return Math.ceil(this.latestMovies.length / this.moviesPerPage);
    },
    hotTotalPages() {
      return Math.ceil(this.hotMovies.length / this.moviesPerPage);
    }
  },
  mounted() {
    this.loadMoviesFromCsv();
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    
    async loadMoviesFromCsv() {
      try {
        const response = await fetch('/data/movie_info.csv');
        const csvText = await response.text();
        
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });
        
        this.movies = parsed.data;
        
        // 按上映时间排序获取最新电影
        this.latestMovies = [...this.movies].sort((a, b) => {
          return new Date(b['上映时间']) - new Date(a['上映时间']);
        });
        
        // 热门电影使用相同列表（可以按观看次数等排序，但此处保持原样）
        this.hotMovies = this.movies.map(movie => ({
          ...movie,
          loaded: false
        }));
        
        // 初始化显示第一页
        this.updateDisplayedMovies();
        this.loading = false;
        
        // 预加载图片
        this.preloadImages();
      } catch (error) {
        console.error('加载电影数据失败:', error);
        this.loading = false;
      }
    },
    
    updateDisplayedMovies() {
      // 更新最新电影显示
      const latestStartIndex = (this.latestCurrentPage - 1) * this.moviesPerPage;
      const latestEndIndex = latestStartIndex + this.moviesPerPage;
      this.displayedLatestMovies = this.latestMovies.slice(latestStartIndex, latestEndIndex);
      
      // 更新热门电影显示
      const hotStartIndex = (this.hotCurrentPage - 1) * this.moviesPerPage;
      const hotEndIndex = hotStartIndex + this.moviesPerPage;
      this.displayedHotMovies = this.hotMovies.slice(hotStartIndex, hotEndIndex);
      
      // 预加载当前页图片
      this.preloadImages();
    },
    
    preloadImages() {
      // 预加载最新电影图片
      this.displayedLatestMovies.forEach(movie => {
        if (!movie.loaded) {
          const img = new Image();
          img.onload = () => {
            movie.loaded = true;
          };
          img.onerror = () => {
            movie.loaded = true;
          };
          img.src = this.getImagePath(movie['本地图片路径']);
        }
      });
      
      // 预加载热门电影图片
      this.displayedHotMovies.forEach(movie => {
        if (!movie.loaded) {
          const img = new Image();
          img.onload = () => {
            movie.loaded = true;
          };
          img.onerror = () => {
            movie.loaded = true;
          };
          img.src = this.getImagePath(movie['本地图片路径']);
        }
      });
    },
    
    getImagePath(imagePath) {
      if (imagePath && typeof imagePath === 'string') {
        // 移除可能的BOM标记
        if (imagePath.charCodeAt(0) === 65279) {
          imagePath = imagePath.substring(1);
        }
        // 清理路径，移除多余的引号
        imagePath = imagePath.replace(/(^["'])|(["']$)/g, '');
        // 确保路径正确
        if (imagePath.startsWith('img/')) {
          return `/${imagePath}`;
        } else if (!imagePath.startsWith('/')) {
          return `/img/${imagePath}`;
        }
        return imagePath;
      }
      return '/img/default_movie.jpg';
    },
    
    handleImageError(movie) {
      // 图片加载失败时使用默认图片
    },
    
    formatDate(dateStr) {
      // 简化日期显示
      if (dateStr) {
        return dateStr.split('(')[0];
      }
      return '未知日期';
    },
    
    getRating(movie) {
      // 根据电影信息生成评分（模拟数据）
      const specialTitles = [
        "入殓师 おくりびと", 
        "致命魔术 The Prestige", 
        "死亡诗社 Dead Poets Society", 
        "被嫌弃的松子的一生 嫌われ松子の一生", 
        "教父2 The Godfather: Part II"
      ];
      
      if (specialTitles.includes(movie['电影标题'])) {
        return (8.5 + Math.random() * 1.4).toFixed(1);
      }
      return (7.0 + Math.random() * 2.9).toFixed(1);
    },
    
    goToMovieDetail(movieId) {
      window.location.href = `/movie-detail.html?id=${movieId}`;
    },
    
    // 最新电影分页
    prevLatestPage() {
      if (this.latestCurrentPage > 1) {
        this.latestCurrentPage--;
        this.updateDisplayedMovies();
      }
    },
    
    nextLatestPage() {
      if (this.latestCurrentPage < this.latestTotalPages) {
        this.latestCurrentPage++;
        this.updateDisplayedMovies();
      }
    },
    
    // 热门电影分页
    prevHotPage() {
      if (this.hotCurrentPage > 1) {
        this.hotCurrentPage--;
        this.updateDisplayedMovies();
      }
    },
    
    nextHotPage() {
      if (this.hotCurrentPage < this.hotTotalPages) {
        this.hotCurrentPage++;
        this.updateDisplayedMovies();
      }
    }
  }
}
</script>

<style scoped>
.movie-tabs {
  margin-bottom: 30px;
}

.tabs-nav {
  display: flex;
  border-bottom: 2px solid #f44336;
  margin-bottom: 20px;
}

.tab-button {
  padding: 12px 24px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: #666;
  transition: all 0.3s;
  position: relative;
}

.tab-button:hover {
  color: #f44336;
}

.tab-button.active {
  color: #f44336;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #f44336;
}

.movies-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.movie-item {
  cursor: pointer;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.movie-item:hover {
  transform: translateY(-5px);
}

.poster-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f0f0f0;
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.movie-details {
  padding: 10px;
}

.movie-details h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating, .year {
  margin: 3px 0;
  font-size: 14px;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

.page-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #666;
}
</style>