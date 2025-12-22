<template>
  <div class="top-rated-movies">
    <h2>高分电影榜</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <ul v-else class="movie-list">
      <li 
        v-for="(movie, index) in topRatedMovies" 
        :key="movie['电影编号']"
        class="movie-item"
        @click="goToMovieDetail(movie['电影编号'])"
      >
        <span class="rank">{{ index + 1 }}.</span>
        <span class="movie-title">{{ movie['电影标题'] }}</span>
        <span class="rating">{{ generateRating(movie) }}</span>
      </li>
    </ul>
    
    <!-- 广告轮播区域 -->
    <div class="ad-carousel" v-if="!loading">
      <div class="ad-container">
        <a :href="adLink" target="_blank">
          <img 
            :src="currentAdImage" 
            :alt="'广告图片 ' + (currentAdIndex + 1)"
            class="ad-image"
          />
        </a>
      </div>
      <div class="ad-indicators">
        <span 
          v-for="(ad, index) in ads" 
          :key="index"
          :class="['indicator', { active: index === currentAdIndex }]"
          @click="setCurrentAd(index)"
        ></span>
      </div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';

export default {
  name: 'TopRatedMovies',
  data() {
    return {
      movies: [],
      loading: true,
      // 广告相关数据
      ads: [
        '/data/diwu/2.jpg',
        '/data/diwu/3.jpg',
        '/data/diwu/4.jpg',
        '/data/diwu/5.jpg',
        '/data/diwu/d619f937-84fa-44ed-8296-6322e5166232.jpg'
      ],
      currentAdIndex: 0,
      adLink: 'https://www.ldoooo.com/ldq-template-delivery/pc/landing-page/?msclkid=d8c35a05ca2f1db06066334d3eae761e#/landing/13715',
      adInterval: null
    }
  },
  computed: {
    topRatedMovies() {
      // 按评分排序并取前10
      return [...this.movies]
        .sort((a, b) => this.generateRating(b) - this.generateRating(a))
        .slice(0, 10);
    },
    currentAdImage() {
      return this.ads[this.currentAdIndex];
    }
  },
  mounted() {
    this.loadMoviesFromCsv();
    // 启动广告轮播
    this.startAdCarousel();
  },
  beforeUnmount() {
    // 清理定时器
    if (this.adInterval) {
      clearInterval(this.adInterval);
    }
  },
  methods: {
    async loadMoviesFromCsv() {
      try {
        const response = await fetch('/data/movie_info.csv');
        const csvText = await response.text();
        
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });
        
        this.movies = parsed.data;
        this.loading = false;
      } catch (error) {
        console.error('加载电影数据失败:', error);
        this.loading = false;
      }
    },
    
    generateRating(movie) {
      // 根据电影信息生成评分（模拟数据）
      const specialTitles = [
        "入殓师 おくりびと", 
        "致命魔术 The Prestige", 
        "死亡诗社 Dead Poets Society", 
        "被嫌弃的松子的一生 嫌われ松子の一生", 
        "教父2 The Godfather: Part II"
      ];
      
      if (specialTitles.includes(movie['电影标题'])) {
        return parseFloat((8.5 + Math.random() * 1.4).toFixed(1));
      }
      return parseFloat((7.0 + Math.random() * 2.9).toFixed(1));
    },
    
    goToMovieDetail(movieId) {
      window.location.href = `/movie-detail.html?id=${movieId}`;
    },
    
    // 广告轮播相关方法
    startAdCarousel() {
      this.adInterval = setInterval(() => {
        this.nextAd();
      }, 3000); // 每3秒切换一次广告
    },
    
    nextAd() {
      this.currentAdIndex = (this.currentAdIndex + 1) % this.ads.length;
    },
    
    setCurrentAd(index) {
      this.currentAdIndex = index;
      // 重置定时器
      if (this.adInterval) {
        clearInterval(this.adInterval);
      }
      this.startAdCarousel();
    }
  }
}
</script>

<style scoped>
.top-rated-movies {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.movie-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.movie-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.movie-item:hover {
  background-color: #f0f0f0;
}

.rank {
  font-weight: bold;
  color: #f44336;
  width: 30px;
  flex-shrink: 0;
}

.movie-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 10px;
}

.rating {
  color: #f44336;
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* 广告轮播样式 */
.ad-carousel {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.ad-container {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: 4px;
}

.ad-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s;
}

.ad-indicators {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;
  margin: 0 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.indicator.active {
  background-color: #f44336;
}
</style>