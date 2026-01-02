'use client';

// Mock authentication for frontend-only mode
export const mockAuth = {
  login: async (mobile, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Strict validation - only specific credentials work
    if (mobile === 'admin' && password === 'MarkazTech2024!') {
      const mockTokens = {
        access: 'mock-admin-token-' + Date.now(),
        refresh: 'mock-refresh-token-' + Date.now(),
        full_name: 'مدیر سیستم',
        is_admin: true,
        role: 'ADMIN',
        is_staff: true,
        is_superuser: true,
        mobile: 'admin',
        wallet_balance: 1000000,
        id: 1,
        avatar_url: null,
        email: 'admin@markaztech.ir',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('accessToken', mockTokens.access);
      localStorage.setItem('refreshToken', mockTokens.refresh);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('user', JSON.stringify(mockTokens));
      
      return { data: mockTokens };
    }
    
    // Test user credentials
    if (mobile === '09123456789' && password === 'test123') {
      const mockTokens = {
        access: 'mock-user-token-' + Date.now(),
        refresh: 'mock-refresh-token-' + Date.now(),
        full_name: 'کاربر تست',
        is_admin: false,
        role: 'USER',
        is_staff: false,
        is_superuser: false,
        mobile: mobile,
        wallet_balance: Math.floor(Math.random() * 100000) + 10000,
        id: 2,
        avatar_url: null,
        email: 'user@test.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('accessToken', mockTokens.access);
      localStorage.setItem('refreshToken', mockTokens.refresh);
      localStorage.setItem('isAdmin', 'false');
      localStorage.setItem('user', JSON.stringify(mockTokens));
      
      return { data: mockTokens };
    }
    
    // Reject all other credentials
    throw new Error('شماره موبایل یا رمز عبور اشتباه است');
  },
  
  register: async (mobile, password, full_name) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validate mobile
    if (!mobile.startsWith('09') || mobile.length !== 11) {
      throw new Error('شماره موبایل باید با 09 شروع شود و 11 رقم باشد');
    }
    
    // Validate password
    if (password.length < 6) {
      throw new Error('رمز عبور باید حداقل 6 کاراکتر باشد');
    }
    
    // Validate name
    if (!full_name || full_name.trim().length < 2) {
      throw new Error('نام و نام خانوادگی الزامی است');
    }
    
    // Mock successful registration
    return {
      data: {
        message: 'حساب کاربری با موفقیت ساخته شد',
        user_id: Math.floor(Math.random() * 10000) + 1000,
        mobile: mobile,
        full_name: full_name.trim()
      }
    };
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  
  isLoggedIn: () => {
    return !!localStorage.getItem('accessToken');
  },
  
  isAdmin: () => {
    return localStorage.getItem('isAdmin') === 'true';
  }
};