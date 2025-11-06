import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Black from './components/Black';
import { useI18n } from './i18n';

function LoginPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('🔐 LOGIN FORM SUBMIT:', formData);

    try {
      await login(formData.name, formData.password);
      console.log('✅ LOGIN SUCCESS - NAVIGATING TO /users');
      navigate('/users');
    } catch (err) {
      console.error('❌ LOGIN FORM ERROR:', err);
      setError(t('login.error.invalid'));
    }
  };

  return (
    <div className="login-page">
      <header>
        <Link to="/" className="back-button">{t('login.back')}</Link>
        <h1 className="page-title">{t('login.title')}</h1>
      </header>

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">{t('login.username')}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder={t('login.username.placeholder')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('login.password')}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Вставляем компонент Black с путями старой кнопки */}
        <Black 
          type="submit" 
          disabled={loading}
        >
          {loading ? t('login.submitting') : t('login.submit')}
        </Black>

        {/* Test credentials hint removed */}
      </form>
    </div>
  );
}

export default LoginPage;
