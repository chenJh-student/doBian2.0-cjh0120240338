<!-- src/App.vue -->
<template>
  <div class="home-container">
    <IndexTop />
    <div class="content-wrapper">
      <div class="main-content">
        <MovieTabs />
      </div>
      <div class="sidebar">
        <TopRatedMovies />
      </div>
    </div>
  </div>
</template>

<script>
import IndexTop from './components/index_top.vue';
import MovieTabs from './components/MovieTabs.vue';
import TopRatedMovies from './components/TopRatedMovies.vue';

export default {
  name: 'App',
  components: {
    IndexTop,
    MovieTabs,
    TopRatedMovies
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 20px 20px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.main-content {
  flex: 3;
}

.sidebar {
  flex: 1;
  min-width: 300px;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    min-width: unset;
  }
}
</style>