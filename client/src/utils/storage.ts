class Storage {
  private themeKey = "theme";
  private accessTokenKey = "accessToken";
  private refreshTokenKey = "refreshToken";
  private sidebarStateKey = "sidebarCollapsed";

  // --- persistent preferences: localStorage ---
  getTheme() {
    return localStorage.getItem(this.themeKey);
  }
  setTheme(theme: string) {
    localStorage.setItem(this.themeKey, theme);
  }
  getSidebarCollapsed(): boolean {
    const value = localStorage.getItem(this.sidebarStateKey);
    return value ? JSON.parse(value) : false;
  }
  setSidebarCollapsed(isCollapsed: boolean) {
    localStorage.setItem(this.sidebarStateKey, JSON.stringify(isCollapsed));
  }

  // --- session-scoped tokens: sessionStorage ---
  setTokens(accessToken: string, refreshToken: string) {
    sessionStorage.setItem(this.accessTokenKey, accessToken);
    sessionStorage.setItem(this.refreshTokenKey, refreshToken);
  }
  clearTokens() {
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
  }
  getAccessToken() {
    return sessionStorage.getItem(this.accessTokenKey);
  }
  getRefreshToken() {
    return sessionStorage.getItem(this.refreshTokenKey);
  }
}

export const storage = new Storage();

/* class Storage {
  private themeKey = "theme";
  private accessTokenKey = "accessToken";
  private refreshTokenKey = "refreshToken";
  private sidebarStateKey = "sidebarCollapsed"; // New key

  getTheme() {
    return localStorage.getItem(this.themeKey);
  }

  setTheme(theme: string) {
    localStorage.setItem(this.themeKey, theme);
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  clearTokens() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  getAccessToken() {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getSidebarCollapsed(): boolean {
    const value = localStorage.getItem(this.sidebarStateKey);
    return value ? JSON.parse(value) : false;
  }

  setSidebarCollapsed(isCollapsed: boolean) {
    localStorage.setItem(this.sidebarStateKey, JSON.stringify(isCollapsed));
  }
}

export const storage = new Storage();
 */
