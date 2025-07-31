import { apiService } from './apiService'

class AuthService {
  setToken(token) {
    apiService.setToken(token)
  }

  async login(email, password) {
    const response = await apiService.post('/auth/login', {
      email,
      password,
    })
    
    if (response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async register(userData) {
    const response = await apiService.post('/auth/register', userData)
    
    if (response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async logout() {
    try {
      await apiService.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.setToken(null)
    }
  }

  async getCurrentUser() {
    return await apiService.get('/auth/me')
  }

  async updateProfile(userData) {
    return await apiService.put('/auth/profile', userData)
  }

  async changePassword(currentPassword, newPassword) {
    return await apiService.put('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  }

  async forgotPassword(email) {
    return await apiService.post('/auth/forgot-password', { email })
  }

  async resetPassword(token, newPassword) {
    return await apiService.post('/auth/reset-password', {
      token,
      newPassword,
    })
  }
}

export const authService = new AuthService()
