<!-- src/components/index_top.vue -->
<template>
  <div class="top-navigation">
    <div class="top-bar">
      <ul class="top-menu">
        <li v-if="!currentUser" class="login-item"><a href="#" @click.prevent="showLogin">登录</a></li>
        <li v-else class="user-menu">
          <span>欢迎, {{ currentUser.username }}</span>
          <a href="/user_info.html">个人中心</a>
          <a href="#" @click.prevent="logout">退出</a>
        </li>
        <li><a href="https://www.douban.com/download/" target="_blank">下载客户端</a></li>
      </ul>
    </div>
    
    <div class="search-area">
      <div class="logo">豆瓣电影</div>
      <!-- 已删除搜索表单 -->
    </div>
    
    <!-- 登录模态框 -->
    <div v-if="showAuthModal" class="modal-overlay" @click="closeModal">
      <div class="auth-modal" @click.stop>
        <h3>登录</h3>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input 
              type="text" 
              placeholder="用户名" 
              v-model="authForm.username" 
              required
            >
          </div>
          <div class="form-group">
            <input 
              type="password" 
              placeholder="密码" 
              v-model="authForm.password" 
              required
            >
          </div>
          <button type="submit" class="auth-btn">登录</button>
        </form>
        <button class="close-modal" @click="closeModal">&times;</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexTop',
  data() {
    return {
      showAuthModal: false,
      authForm: {
        username: '',
        password: ''
      },
      currentUser: null
    }
  },
  
  async mounted() {
    // 页面加载时检查是否有登录用户
    await this.checkCurrentUser();
  },
  
  methods: {
    showLogin() {
      this.showAuthModal = true;
    },
    
    closeModal() {
      this.showAuthModal = false;
      this.authForm.username = '';
      this.authForm.password = '';
    },
    
    async handleLogin() {
      console.log('登录:', this.authForm);
      
      try {
        // 获取用户数据
        const response = await fetch('/data/user.csv');
        const usersText = await response.text();
        
        // 解析用户数据
        const users = this.parseUsersCSV(usersText);
        
        // 查找匹配的用户（验证用户名和密码）
        const user = users.find(u => 
          u.username === this.authForm.username && 
          u.password === this.authForm.password
        );
        
        if (user) {
          this.currentUser = user;
          // 保存用户ID到localStorage
          localStorage.setItem('currentUserId', user['user_id']);
          this.closeModal();
        } else {
          alert('用户名或密码错误');
        }
      } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败，请稍后重试');
      }
    },
    
    logout() {
      this.currentUser = null;
      localStorage.removeItem('currentUserId');
    },
    
    async checkCurrentUser() {
      const currentUserId = localStorage.getItem('currentUserId');
      
      if (currentUserId) {
        try {
          // 获取用户数据
          const response = await fetch('/data/user.csv');
          const usersText = await response.text();
          
          // 解析用户数据
          const users = this.parseUsersCSV(usersText);
          
          // 查找当前用户
          const user = users.find(u => u['user_id'] === currentUserId);
          
          if (user) {
            this.currentUser = user;
          } else {
            // 如果没找到用户，清除本地存储
            localStorage.removeItem('currentUserId');
          }
        } catch (error) {
          console.error('检查用户状态失败:', error);
        }
      }
    },
    
    parseUsersCSV(csvText) {
      // 移除可能的BOM标记
      if (csvText.charCodeAt(0) === 0xFEFF) {
        csvText = csvText.slice(1);
      }

      const lines = this.splitCSVLines(csvText);
      if (lines.length <= 1) return [];

      // 解析标题行
      const headers = this.parseCSVLine(lines[0]).map(h => h.trim());

      // 解析数据行
      const users = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;

        try {
          const values = this.parseCSVLine(line).map(v => v.trim());
          if (values.length !== headers.length) continue;

          const user = {};
          headers.forEach((header, index) => {
            user[header] = values[index] || '';
          });

          users.push(user);
        } catch (e) {
          console.log(`解析用户第${i+1}行时出错:`, e);
        }
      }

      return users;
    },
    
    parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          // 检查是否是转义的引号
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++; // 跳过下一个引号
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }

      result.push(current);
      return result;
    },

    splitCSVLines(text) {
      const lines = [];
      let currentLine = '';
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
          // 检查是否是转义的引号
          if (i + 1 < text.length && text[i + 1] === '"') {
            currentLine += '""';
            i++; // 跳过下一个引号
            continue;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === '\n' && !inQuotes) {
          lines.push(currentLine);
          currentLine = '';
          continue;
        }

        currentLine += char;
      }

      // 添加最后一行（如果没有以换行符结尾）
      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    }
  }
}
</script>

<style scoped>
.top-navigation {
  width: 100%;
}

.top-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  margin: 0;
  background-color: #2e2e2e;
  height: 40px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.top-menu {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  width: 100%;
  justify-content: flex-start;
}

.top-menu li {
  margin-right: 20px;
  white-space: nowrap;
  line-height: 40px;
}

.login-item {
  margin-right: auto;
}

.top-menu a {
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
}

.top-menu a:hover {
  color: #cccccc;
}

.user-menu {
  color: #ffffff;
  display: flex;
  gap: 15px;
}

.search-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 60px; /* 为固定顶部导航留出空间 */
  padding-bottom: 20px;
}

.logo {
  font-size: 28px;
  font-weight: bold;
  white-space: nowrap;
  color: #37a;
}

/* 登录模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.auth-modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  position: relative;
}

.auth-modal h3 {
  margin-top: 0;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.auth-btn {
  width: 100%;
  padding: 12px;
  background-color: #37a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.auth-btn:hover {
  background-color: #258;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-modal:hover {
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-area {
    padding-top: 60px;
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .auth-modal {
    width: 90%;
    margin: 0 20px;
  }
}
</style>