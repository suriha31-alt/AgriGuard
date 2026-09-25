function Auth({
  authMode,
  authData,
  authLoading,
  error,
  onAuthInputChange,
  onAuthSubmit,
  onSwitchMode
}) {
  return (
    <div className="app">

      <header className="header">
        <div>
          <h1>AgriGuard</h1>
          <p>Government Schemes for Farmers</p>
        </div>
      </header>

      <main className="container">

        <section className="welcome-section">

          <h2>
            {authMode === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h2>

          <p>
            {authMode === "login"
              ? "Login to discover government schemes relevant to your farm."
              : "Create an account to save your farmer profile and discover relevant schemes."}
          </p>

        </section>

        <form
          className="profile-form"
          onSubmit={onAuthSubmit}
        >

          {authMode === "register" && (
            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={authData.name}
                onChange={onAuthInputChange}
                required
              />

            </div>
          )}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={authData.email}
              onChange={onAuthInputChange}
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={authData.password}
              onChange={onAuthInputChange}
              minLength="6"
              required
            />

          </div>

          {error && (
            <div className="error-box">
              <p>{error}</p>
            </div>
          )}

          <button
            className="save-profile-button"
            type="submit"
            disabled={authLoading}
          >
            {authLoading
              ? "Please wait..."
              : authMode === "login"
              ? "Login"
              : "Create Account"}
          </button>

          <div className="auth-switch">

            {authMode === "login" ? (
              <>
                <span>
                  Don't have an account?
                </span>

                <button
                  type="button"
                  className="auth-switch-button"
                  onClick={() => onSwitchMode("register")}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <span>
                  Already have an account?
                </span>

                <button
                  type="button"
                  className="auth-switch-button"
                  onClick={() => onSwitchMode("login")}
                >
                  Login
                </button>
              </>
            )}

          </div>

        </form>

      </main>

      <footer>
        <p>
          AgriGuard • Helping farmers discover relevant government schemes
        </p>
      </footer>

    </div>
  );
}

export default Auth;